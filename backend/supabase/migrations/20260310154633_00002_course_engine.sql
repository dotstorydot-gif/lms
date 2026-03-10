-----------------------------------------
-- 1. COURSE CATEGORIES
-----------------------------------------
CREATE TABLE public.course_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT,
    icon_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tenant_id, slug)
);
-----------------------------------------
-- 2. COURSES
-----------------------------------------
CREATE TYPE course_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE course_level AS ENUM (
    'beginner',
    'intermediate',
    'advanced',
    'all_levels'
);
CREATE TABLE public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    instructor_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE RESTRICT,
    category_id UUID REFERENCES public.course_categories(id) ON DELETE
    SET NULL,
        title VARCHAR(255) NOT NULL,
        slug VARCHAR(255) NOT NULL,
        subtitle VARCHAR(255),
        description TEXT,
        learning_objectives JSONB,
        -- Array of strings
        requirements JSONB,
        -- Array of strings
        thumbnail_url TEXT,
        promo_video_url TEXT,
        level course_level DEFAULT 'all_levels',
        status course_status DEFAULT 'draft',
        is_free BOOLEAN DEFAULT false,
        price DECIMAL(10, 2),
        currency VARCHAR(3) DEFAULT 'USD',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(tenant_id, slug)
);
-----------------------------------------
-- 3. COURSE CURRICULUM (SECTIONS & LESSONS)
-----------------------------------------
CREATE TABLE public.course_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE TYPE lesson_type AS ENUM ('video', 'article', 'pdf', 'quiz', 'assignment');
CREATE TABLE public.lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_id UUID NOT NULL REFERENCES public.course_sections(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    type lesson_type NOT NULL,
    is_free_preview BOOLEAN DEFAULT false,
    order_index INT NOT NULL DEFAULT 0,
    -- Content fields
    content TEXT,
    -- Used for article/text lessons
    video_url TEXT,
    -- Used for video lessons
    video_duration INT,
    -- Duration in seconds
    asset_url TEXT,
    -- Used for PDF or Downloadable main files
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Resources attached to a specific lesson (e.g. source code zip files)
CREATE TABLE public.lesson_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_size_bytes BIGINT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-----------------------------------------
-- 4. RLS POLICIES FOR COURSE ENGINE
-----------------------------------------
ALTER TABLE public.course_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_resources ENABLE ROW LEVEL SECURITY;
-- Course Categories Policies
CREATE POLICY "Public can view tenant categories" ON public.course_categories FOR
SELECT USING (true);
-- Filtered at app level by tenant_id
CREATE POLICY "Tenant admins can manage categories" ON public.course_categories FOR ALL USING (
    public.get_user_tenant_role(tenant_id) = 'tenant_admin'
);
-- Courses Policies
CREATE POLICY "Public can view published courses" ON public.courses FOR
SELECT USING (status = 'published');
CREATE POLICY "Instructors can manage their own courses" ON public.courses FOR ALL USING (
    instructor_id = auth.uid()
    AND public.get_user_tenant_role(tenant_id) IN ('instructor', 'tenant_admin')
);
CREATE POLICY "Tenant admins can view all tenant courses" ON public.courses FOR
SELECT USING (
        public.get_user_tenant_role(tenant_id) = 'tenant_admin'
    );
-- Course Sections & Lessons Policies
-- (Anyone can view the structure of a published course via relations, but content is gated)
CREATE POLICY "Public can view sections of published courses" ON public.course_sections FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.courses
            WHERE id = course_sections.course_id
                AND status = 'published'
        )
    );
CREATE POLICY "Instructors can manage sections of their courses" ON public.course_sections FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.courses
        WHERE id = course_sections.course_id
            AND instructor_id = auth.uid()
    )
);
-- Lessons
CREATE POLICY "Public can view lesson metadata" ON public.lessons FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.course_sections
                JOIN public.courses ON public.courses.id = public.course_sections.course_id
            WHERE public.course_sections.id = lessons.section_id
                AND public.courses.status = 'published'
        )
    );
CREATE POLICY "Instructors can manage lessons" ON public.lessons FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.course_sections
            JOIN public.courses ON public.courses.id = public.course_sections.course_id
        WHERE public.course_sections.id = lessons.section_id
            AND public.courses.instructor_id = auth.uid()
    )
);
-- Lesson Resources
CREATE POLICY "Public can view free preview resources" ON public.lesson_resources FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.lessons
            WHERE id = lesson_resources.lesson_id
                AND is_free_preview = true
        )
    );
CREATE POLICY "Instructors can manage resources" ON public.lesson_resources FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.lessons
            JOIN public.course_sections ON public.course_sections.id = public.lessons.section_id
            JOIN public.courses ON public.courses.id = public.course_sections.course_id
        WHERE public.lessons.id = lesson_resources.lesson_id
            AND public.courses.instructor_id = auth.uid()
    )
);
-----------------------------------------
-- TRIGGERS
-----------------------------------------
CREATE TRIGGER update_categories_modtime BEFORE
UPDATE ON public.course_categories FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_courses_modtime BEFORE
UPDATE ON public.courses FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_lessons_modtime BEFORE
UPDATE ON public.lessons FOR EACH ROW EXECUTE PROCEDURE update_modified_column();