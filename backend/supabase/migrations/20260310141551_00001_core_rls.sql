-----------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-----------------------------------------
-- 1. Enable RLS on all tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_tenant_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
-- 2. Helper functions for RLS
-- Get current user's role for a specific tenant
CREATE OR REPLACE FUNCTION public.get_user_tenant_role(tenant_id UUID) RETURNS user_role AS $$
SELECT role
FROM public.user_tenant_roles
WHERE user_id = auth.uid()
    AND tenant_id = $1
    AND is_active = true
LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;
-- Check if current user is a super admin anywhere
CREATE OR REPLACE FUNCTION public.is_super_admin() RETURNS BOOLEAN AS $$
SELECT EXISTS (
        SELECT 1
        FROM public.user_tenant_roles
        WHERE user_id = auth.uid()
            AND role = 'super_admin'
            AND is_active = true
    );
$$ LANGUAGE sql SECURITY DEFINER;
-- 3. Tenants Policies
-- Anyone can view active tenants (needed for login/routing)
CREATE POLICY "Public can view active tenants" ON public.tenants FOR
SELECT USING (is_active = true);
-- Only super admins can insert/update/delete tenants
CREATE POLICY "Super admins can manage tenants" ON public.tenants FOR ALL USING (public.is_super_admin());
-- Tenant admins can update their OWN tenant details
CREATE POLICY "Tenant admins can update own tenant" ON public.tenants FOR
UPDATE USING (
        public.get_user_tenant_role(id) = 'tenant_admin'
    );
-- 4. Subscription Plans Policies
-- Anyone can view subscription plans (for pricing page)
CREATE POLICY "Public can view subscription plans" ON public.subscription_plans FOR
SELECT USING (true);
-- Only super admins can manage subscription plans
CREATE POLICY "Super admins can manage subscription plans" ON public.subscription_plans FOR ALL USING (public.is_super_admin());
-- 5. Tenant Subscriptions Policies
-- Super admins can do anything
CREATE POLICY "Super admins can manage tenant subscriptions" ON public.tenant_subscriptions FOR ALL USING (public.is_super_admin());
-- Tenant admins can view their own subscriptions
CREATE POLICY "Tenant admins can view own subscriptions" ON public.tenant_subscriptions FOR
SELECT USING (
        public.get_user_tenant_role(tenant_id) = 'tenant_admin'
    );
-- 6. User Profiles Policies
-- Users can read and update their own profile
CREATE POLICY "Users can view own profile" ON public.user_profiles FOR
SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR
UPDATE USING (auth.uid() = id);
-- Super admins can view all profiles
CREATE POLICY "Super admins can view all profiles" ON public.user_profiles FOR
SELECT USING (public.is_super_admin());
-- Instructors/Admins can see profiles of students in their tenant
-- (Complex policy: check if both users exist in the same tenant and the acting user has an elevated role)
CREATE POLICY "Tenant admins and instructors can view tenant users" ON public.user_profiles FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.user_tenant_roles target_user
                JOIN public.user_tenant_roles acting_user ON target_user.tenant_id = acting_user.tenant_id
            WHERE target_user.user_id = user_profiles.id
                AND acting_user.user_id = auth.uid()
                AND acting_user.role IN ('tenant_admin', 'instructor')
        )
    );
-- 7. User Tenant Roles Policies
-- Users can view their own roles
CREATE POLICY "Users can view own roles" ON public.user_tenant_roles FOR
SELECT USING (user_id = auth.uid());
-- Super admins can manage all roles
CREATE POLICY "Super admins can manage all roles" ON public.user_tenant_roles FOR ALL USING (public.is_super_admin());
-- Tenant admins can view and manage roles within their tenant
CREATE POLICY "Tenant admins can manage tenant roles" ON public.user_tenant_roles FOR ALL USING (
    public.get_user_tenant_role(tenant_id) = 'tenant_admin'
);
-- 8. Permissions & Role_Permissions Policies
-- Standard read-only for all authenticated users (needed by frontend to check what they can do)
CREATE POLICY "Authenticated users can read permissions" ON public.permissions FOR
SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can read role_permissions" ON public.role_permissions FOR
SELECT USING (auth.role() = 'authenticated');
-- Super admins can modify permissions
CREATE POLICY "Super admins can manage permissions" ON public.permissions FOR ALL USING (public.is_super_admin());
CREATE POLICY "Super admins can manage role_permissions" ON public.role_permissions FOR ALL USING (public.is_super_admin());