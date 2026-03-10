-- =============================================
-- TENANT BRANDING & WHITE-LABELING
-- =============================================
ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS favicon_url TEXT;
ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS primary_color VARCHAR(7) DEFAULT '#7C3AED';
ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS secondary_color VARCHAR(7) DEFAULT '#10B981';
ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS font_family VARCHAR(100) DEFAULT 'Inter';
ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS custom_domain VARCHAR(255);
ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS welcome_message TEXT;
ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}';
ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS stripe_account_id VARCHAR(255);
-- For Stripe Connect revenue splitting
ALTER TABLE public.tenants
ADD COLUMN IF NOT EXISTS commission_percent DECIMAL(5, 2) DEFAULT 20.00;
-- Platform takes 20% by default
-- Tenant feature flags
CREATE TABLE IF NOT EXISTS public.tenant_features (
    tenant_id UUID PRIMARY KEY REFERENCES public.tenants(id) ON DELETE CASCADE,
    can_live_classes BOOLEAN DEFAULT false,
    can_custom_domain BOOLEAN DEFAULT false,
    can_certificates BOOLEAN DEFAULT true,
    can_coupons BOOLEAN DEFAULT true,
    can_affiliate BOOLEAN DEFAULT false,
    max_courses INT DEFAULT 10,
    max_students INT DEFAULT 500,
    max_storage_gb INT DEFAULT 5,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.tenant_features ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tenant admins manage own features" ON public.tenant_features FOR ALL USING (
    public.get_user_tenant_role(tenant_id) IN ('tenant_admin', 'super_admin')
);
CREATE POLICY "Anyone can read tenant features" ON public.tenant_features FOR
SELECT USING (true);