-- =============================================
-- 1. COURSE ENROLLMENTS
-- =============================================
CREATE TABLE public.enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(user_id, course_id)
);
-- =============================================
-- 2. LESSON PROGRESS
-- =============================================
CREATE TABLE public.lesson_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    enrollment_id UUID NOT NULL REFERENCES public.enrollments(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT false,
    watch_time_seconds INT DEFAULT 0,
    -- For video lessons
    last_position_seconds INT DEFAULT 0,
    -- Resume playback position
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, lesson_id)
);
-- =============================================
-- 3. CERTIFICATES
-- =============================================
CREATE TABLE public.certificates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    enrollment_id UUID REFERENCES public.enrollments(id),
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    certificate_url TEXT,
    unique_code VARCHAR(64) UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex'),
    UNIQUE(user_id, course_id)
);
-- =============================================
-- 4. RLS POLICIES
-- =============================================
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
-- Enrollments
CREATE POLICY "Students can view their own enrollments" ON public.enrollments FOR
SELECT USING (user_id = auth.uid());
CREATE POLICY "Students can enroll themselves" ON public.enrollments FOR
INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Tenant admins can view all enrollments" ON public.enrollments FOR
SELECT USING (
        public.get_user_tenant_role(tenant_id) IN ('tenant_admin', 'instructor')
    );
-- Lesson Progress
CREATE POLICY "Students can manage their own progress" ON public.lesson_progress FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Instructors can view student progress" ON public.lesson_progress FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.enrollments e
                JOIN public.courses c ON c.id = e.course_id
            WHERE e.id = lesson_progress.enrollment_id
                AND c.instructor_id = auth.uid()
        )
    );
-- Certificates
CREATE POLICY "Users can view their own certificates" ON public.certificates FOR
SELECT USING (user_id = auth.uid());
CREATE POLICY "Public can verify certificates by unique code" ON public.certificates FOR
SELECT USING (true);
-- Filtered by unique_code at app level
-- =============================================
-- 5. HELPER FUNCTION: auto-issue certificate on 100% completion
-- =============================================
CREATE OR REPLACE FUNCTION public.check_and_issue_certificate(p_enrollment_id UUID) RETURNS VOID AS $$
DECLARE v_total_lessons INT;
v_completed_lessons INT;
v_enrollment RECORD;
BEGIN
SELECT e.*,
    c.tenant_id INTO v_enrollment
FROM public.enrollments e
    JOIN public.courses c ON c.id = e.course_id
WHERE e.id = p_enrollment_id;
SELECT COUNT(*) INTO v_total_lessons
FROM public.lessons l
    JOIN public.course_sections cs ON cs.id = l.section_id
WHERE cs.course_id = v_enrollment.course_id;
SELECT COUNT(*) INTO v_completed_lessons
FROM public.lesson_progress lp
WHERE lp.enrollment_id = p_enrollment_id
    AND lp.is_completed = true;
IF v_total_lessons > 0
AND v_completed_lessons >= v_total_lessons THEN -- Update enrollment as completed
UPDATE public.enrollments
SET completed_at = NOW()
WHERE id = p_enrollment_id;
-- Issue certificate if not already issued
INSERT INTO public.certificates (user_id, course_id, tenant_id, enrollment_id)
VALUES (
        v_enrollment.user_id,
        v_enrollment.course_id,
        v_enrollment.tenant_id,
        p_enrollment_id
    ) ON CONFLICT (user_id, course_id) DO NOTHING;
END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;