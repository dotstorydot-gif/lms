-- Enable UUID generation extension
create extension if not exists "uuid-ossp";
-- Define Custom Enum Types
CREATE TYPE user_role AS ENUM (
    'super_admin',
    'tenant_admin',
    'instructor',
    'student'
);
CREATE TYPE subscription_tier AS ENUM ('free', 'starter', 'pro', 'enterprise');
-----------------------------------------
-- 1. TENANT MANAGEMENT (SaaS Core)
-----------------------------------------
CREATE TABLE public.tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    subdomain VARCHAR(255) UNIQUE NOT NULL,
    -- e.g., 'academy1' -> academy1.ourlms.com
    custom_domain VARCHAR(255) UNIQUE,
    -- e.g., 'www.academy1.com'
    logo_url TEXT,
    primary_color VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Subscription Plans Definition
CREATE TABLE public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    tier subscription_tier NOT NULL,
    price_monthly DECIMAL(10, 2) NOT NULL,
    price_yearly DECIMAL(10, 2) NOT NULL,
    max_courses INT,
    -- NULL = unlimited
    max_instructors INT,
    -- NULL = unlimited
    max_storage_gb INT,
    -- NULL = unlimited
    features JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Tenants Subscriptions Mapping
CREATE TABLE public.tenant_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.subscription_plans(id) ON DELETE RESTRICT,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    -- active, past_due, canceled
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-----------------------------------------
-- 2. USER & AUTHENTICATION
-----------------------------------------
-- Extends the secure auth.users table in Supabase
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    -- Links to Supabase Auth
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    timezone VARCHAR(100) DEFAULT 'UTC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- User mapping to Tenants and Roles
-- A user can have different roles in different tenants (e.g., student in Tenant A, instructor in Tenant B)
CREATE TABLE public.user_tenant_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'student',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, tenant_id) -- User can only have one primary role per tenant
);
-----------------------------------------
-- 3. PERMISSIONS & RBAC
-----------------------------------------
-- Standard static permissions defined globally
CREATE TABLE public.permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    -- e.g., 'create_course', 'manage_users', 'view_analytics'
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Map permissions to roles
CREATE TABLE public.role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role user_role NOT NULL,
    permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    UNIQUE(role, permission_id)
);
-----------------------------------------
-- TRIGGERS & FUNCTIONS
-----------------------------------------
-- Function: Automatically create a user profile when a new user signs up via auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$ BEGIN
INSERT INTO public.user_profiles (id, email, full_name, avatar_url)
VALUES (
        new.id,
        new.email,
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'avatar_url'
    );
RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Trigger: Fire the function after insert on auth.users
CREATE TRIGGER on_auth_user_created
AFTER
INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
-- Trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION update_modified_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ language 'plpgsql';
CREATE TRIGGER update_tenants_modtime BEFORE
UPDATE ON public.tenants FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_user_profiles_modtime BEFORE
UPDATE ON public.user_profiles FOR EACH ROW EXECUTE PROCEDURE update_modified_column();