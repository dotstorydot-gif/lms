-- =============================================
-- E-COMMERCE: ORDERS & PAYMENTS
-- =============================================
CREATE TYPE order_status AS ENUM ('pending', 'completed', 'refunded', 'failed');
CREATE TYPE payment_provider AS ENUM ('stripe', 'paypal', 'free');
CREATE TABLE public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE RESTRICT,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE RESTRICT,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE RESTRICT,
    status order_status DEFAULT 'pending',
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    provider payment_provider DEFAULT 'stripe',
    stripe_session_id VARCHAR(255),
    stripe_payment_intent_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);
-- Coupon codes / discounts
CREATE TABLE public.coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    discount_type VARCHAR(10) NOT NULL DEFAULT 'percent',
    -- 'percent' | 'fixed'
    discount_value DECIMAL(10, 2) NOT NULL,
    max_uses INT,
    uses_count INT DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, code)
);
-- =============================================
-- RLS POLICIES
-- =============================================
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own orders" ON public.orders FOR
SELECT USING (user_id = auth.uid());
CREATE POLICY "Backend can insert orders" ON public.orders FOR
INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Tenant admins view all orders" ON public.orders FOR
SELECT USING (
        public.get_user_tenant_role(tenant_id) IN ('tenant_admin', 'super_admin')
    );
CREATE POLICY "Admins manage coupons" ON public.coupons FOR ALL USING (
    public.get_user_tenant_role(tenant_id) IN ('tenant_admin', 'super_admin')
);
CREATE POLICY "Public can validate coupons" ON public.coupons FOR
SELECT USING (is_active = true);