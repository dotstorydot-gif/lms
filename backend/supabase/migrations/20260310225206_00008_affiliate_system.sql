-- =============================================
-- AFFILIATE SYSTEM
-- =============================================
CREATE TYPE affiliate_status AS ENUM ('pending', 'approved', 'suspended');
CREATE TYPE payout_status AS ENUM ('pending', 'processing', 'paid', 'failed');
-- Affiliate profiles
CREATE TABLE public.affiliates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE UNIQUE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    status affiliate_status DEFAULT 'pending',
    referral_code VARCHAR(20) UNIQUE NOT NULL DEFAULT UPPER(SUBSTR(MD5(random()::TEXT), 1, 8)),
    commission_percent DECIMAL(5, 2) DEFAULT 30.00,
    -- Default 30%
    total_earnings DECIMAL(10, 2) DEFAULT 0,
    total_paid DECIMAL(10, 2) DEFAULT 0,
    payment_info JSONB DEFAULT '{}',
    -- PayPal email, bank details etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Track each referral click/conversion
CREATE TABLE public.affiliate_referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
    order_id UUID REFERENCES public.orders(id) ON DELETE
    SET NULL,
        referred_user_id UUID REFERENCES public.user_profiles(id) ON DELETE
    SET NULL,
        course_id UUID REFERENCES public.courses(id),
        click_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        converted_at TIMESTAMP WITH TIME ZONE,
        -- When order was completed
        commission_amount DECIMAL(10, 2),
        status VARCHAR(20) DEFAULT 'click' -- 'click' | 'converted' | 'paid'
);
-- Payout requests
CREATE TABLE public.affiliate_payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    affiliate_id UUID NOT NULL REFERENCES public.affiliates(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    status payout_status DEFAULT 'pending',
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    transaction_ref VARCHAR(255)
);
-- =============================================
-- RLS
-- =============================================
ALTER TABLE public.affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.affiliate_payouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own affiliate profile" ON public.affiliates FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Admins view all affiliates" ON public.affiliates FOR
SELECT USING (
        public.get_user_tenant_role(tenant_id) IN ('tenant_admin', 'super_admin')
    );
CREATE POLICY "Affiliates see own referrals" ON public.affiliate_referrals FOR
SELECT USING (
        affiliate_id IN (
            SELECT id
            FROM public.affiliates
            WHERE user_id = auth.uid()
        )
    );
CREATE POLICY "Affiliates manage own payouts" ON public.affiliate_payouts FOR ALL USING (
    affiliate_id IN (
        SELECT id
        FROM public.affiliates
        WHERE user_id = auth.uid()
    )
);
-- =============================================
-- HELPER: attribute order to affiliate
-- =============================================
CREATE OR REPLACE FUNCTION public.attribute_affiliate_commission(p_order_id UUID, p_referral_code TEXT) RETURNS VOID AS $$
DECLARE v_affiliate RECORD;
v_order RECORD;
v_commission DECIMAL(10, 2);
BEGIN
SELECT a.* INTO v_affiliate
FROM public.affiliates a
WHERE a.referral_code = p_referral_code
    AND a.status = 'approved';
IF NOT FOUND THEN RETURN;
END IF;
SELECT o.* INTO v_order
FROM public.orders o
WHERE o.id = p_order_id
    AND o.status = 'completed';
IF NOT FOUND THEN RETURN;
END IF;
v_commission := ROUND(
    (
        v_order.amount * v_affiliate.commission_percent / 100
    ),
    2
);
-- Update referral record
UPDATE public.affiliate_referrals
SET status = 'converted',
    converted_at = NOW(),
    commission_amount = v_commission,
    order_id = p_order_id
WHERE affiliate_id = v_affiliate.id
    AND course_id = v_order.course_id
    AND status = 'click';
-- Update affiliate total earnings
UPDATE public.affiliates
SET total_earnings = total_earnings + v_commission
WHERE id = v_affiliate.id;
-- Send notification to affiliate
PERFORM public.send_notification(
    v_affiliate.user_id,
    'payment_success',
    'Commission earned! 💰',
    'You earned $' || v_commission || ' from a referral.',
    '/affiliate',
    p_order_id
);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;