-- =============================================
-- IN-APP NOTIFICATIONS
-- =============================================
CREATE TYPE notification_type AS ENUM (
    'enrollment',
    'course_completed',
    'certificate_issued',
    'new_lesson',
    'quiz_passed',
    'quiz_failed',
    'payment_success',
    'live_class_reminder',
    'announcement'
);
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT,
    is_read BOOLEAN DEFAULT false,
    action_url TEXT,
    -- e.g. /student/courses/uuid/learn
    related_id UUID,
    -- course_id, quiz_id, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX notifications_user_idx ON public.notifications(user_id, is_read, created_at DESC);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own notifications" ON public.notifications FOR ALL USING (user_id = auth.uid());
-- =============================================
-- HELPER: send notification to a user
-- =============================================
CREATE OR REPLACE FUNCTION public.send_notification(
        p_user_id UUID,
        p_type notification_type,
        p_title TEXT,
        p_body TEXT DEFAULT NULL,
        p_action_url TEXT DEFAULT NULL,
        p_related_id UUID DEFAULT NULL
    ) RETURNS UUID AS $$
DECLARE v_id UUID;
BEGIN
INSERT INTO public.notifications(
        user_id,
        type,
        title,
        body,
        action_url,
        related_id
    )
VALUES (
        p_user_id,
        p_type,
        p_title,
        p_body,
        p_action_url,
        p_related_id
    )
RETURNING id INTO v_id;
RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- =============================================
-- TRIGGER: Notify student on enrollment
-- =============================================
CREATE OR REPLACE FUNCTION public.notify_on_enrollment() RETURNS TRIGGER AS $$
DECLARE v_title TEXT;
BEGIN
SELECT title INTO v_title
FROM public.courses
WHERE id = NEW.course_id;
PERFORM public.send_notification(
    NEW.user_id,
    'enrollment',
    'Successfully enrolled!',
    'You are now enrolled in "' || v_title || '".',
    '/student/courses/' || NEW.course_id || '/learn',
    NEW.course_id
);
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE TRIGGER on_enrollment_created
AFTER
INSERT ON public.enrollments FOR EACH ROW EXECUTE PROCEDURE public.notify_on_enrollment();
-- =============================================
-- TRIGGER: Notify on certificate issued
-- =============================================
CREATE OR REPLACE FUNCTION public.notify_on_certificate() RETURNS TRIGGER AS $$
DECLARE v_title TEXT;
BEGIN
SELECT title INTO v_title
FROM public.courses
WHERE id = NEW.course_id;
PERFORM public.send_notification(
    NEW.user_id,
    'certificate_issued',
    'Certificate earned! 🎉',
    'Congratulations! You completed "' || v_title || '" and earned a certificate.',
    '/student/certificates',
    NEW.course_id
);
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE TRIGGER on_certificate_issued
AFTER
INSERT ON public.certificates FOR EACH ROW EXECUTE PROCEDURE public.notify_on_certificate();