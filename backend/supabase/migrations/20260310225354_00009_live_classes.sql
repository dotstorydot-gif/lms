-- Live classes table already created in 00004_quiz_engine.sql
-- This migration adds RSVP/attendance tracking
CREATE TABLE public.live_class_attendees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    live_class_id UUID NOT NULL REFERENCES public.live_classes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE,
    left_at TIMESTAMP WITH TIME ZONE,
    rsvp BOOLEAN DEFAULT false,
    -- True = student registered to attend
    rsvp_at TIMESTAMP WITH TIME ZONE,
    attended BOOLEAN DEFAULT false,
    UNIQUE(live_class_id, user_id)
);
ALTER TABLE public.live_class_attendees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students manage own RSVP" ON public.live_class_attendees FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Instructors view attendees" ON public.live_class_attendees FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.live_classes lc
            WHERE lc.id = live_class_attendees.live_class_id
                AND lc.instructor_id = auth.uid()
        )
    );
-- Trigger: notify enrolled students when a live class is scheduled
CREATE OR REPLACE FUNCTION public.notify_live_class_scheduled() RETURNS TRIGGER AS $$ BEGIN
INSERT INTO public.notifications (
        user_id,
        type,
        title,
        body,
        action_url,
        related_id
    )
SELECT e.user_id,
    'live_class_reminder',
    'New Live Class Scheduled! 📹',
    'Join "' || NEW.title || '" on ' || TO_CHAR(NEW.scheduled_at, 'Mon DD at HH:MI AM'),
    '/student/live-classes',
    NEW.id
FROM public.enrollments e
WHERE e.course_id = NEW.course_id
    AND e.is_active = true;
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
CREATE TRIGGER on_live_class_scheduled
AFTER
INSERT ON public.live_classes FOR EACH ROW EXECUTE PROCEDURE public.notify_live_class_scheduled();