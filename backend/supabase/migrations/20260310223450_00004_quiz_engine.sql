-- =============================================
-- QUIZ ENGINE
-- =============================================
CREATE TYPE question_type AS ENUM ('multiple_choice', 'true_false', 'short_answer');
CREATE TABLE public.quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE
    SET NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        time_limit_minutes INT,
        -- NULL = no limit
        passing_score_percent INT DEFAULT 70,
        max_attempts INT DEFAULT 3,
        randomize_questions BOOLEAN DEFAULT false,
        show_correct_answers BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE TABLE public.quiz_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type question_type DEFAULT 'multiple_choice',
    points INT DEFAULT 1,
    order_index INT DEFAULT 0,
    explanation TEXT,
    -- Explanation shown after answer
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE TABLE public.quiz_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
    answer_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT false,
    order_index INT DEFAULT 0
);
-- Student Attempts
CREATE TABLE public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    enrollment_id UUID REFERENCES public.enrollments(id),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    score_percent DECIMAL(5, 2),
    passed BOOLEAN,
    answers_json JSONB -- { question_id: answer_id } map
);
-- =============================================
-- RLS
-- =============================================
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Instructors manage quizzes" ON public.quizzes FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.courses
        WHERE id = quizzes.course_id
            AND instructor_id = auth.uid()
    )
);
CREATE POLICY "Enrolled students can view quizzes" ON public.quizzes FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.enrollments
            WHERE course_id = quizzes.course_id
                AND user_id = auth.uid()
        )
    );
CREATE POLICY "Instructors manage questions" ON public.quiz_questions FOR ALL USING (
    EXISTS (
        SELECT 1
        FROM public.quizzes q
            JOIN public.courses c ON c.id = q.course_id
        WHERE q.id = quiz_questions.quiz_id
            AND c.instructor_id = auth.uid()
    )
);
CREATE POLICY "Enrolled students can view questions" ON public.quiz_questions FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.quizzes q
                JOIN public.enrollments e ON e.course_id = q.course_id
            WHERE q.id = quiz_questions.quiz_id
                AND e.user_id = auth.uid()
        )
    );
CREATE POLICY "Enrolled students can view answers" ON public.quiz_answers FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.quiz_questions qq
                JOIN public.quizzes q ON q.id = qq.quiz_id
                JOIN public.enrollments e ON e.course_id = q.course_id
            WHERE qq.id = quiz_answers.question_id
                AND e.user_id = auth.uid()
        )
    );
CREATE POLICY "Students manage own attempts" ON public.quiz_attempts FOR ALL USING (user_id = auth.uid());
-- =============================================
-- LIVE CLASSES
-- =============================================
CREATE TYPE live_class_status AS ENUM ('scheduled', 'live', 'ended', 'cancelled');
CREATE TABLE public.live_classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    instructor_id UUID NOT NULL REFERENCES public.user_profiles(id),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INT DEFAULT 60,
    status live_class_status DEFAULT 'scheduled',
    meeting_url TEXT,
    -- Zoom / Google Meet link
    recording_url TEXT,
    -- Post-session recording
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.live_classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Instructors manage live classes" ON public.live_classes FOR ALL USING (instructor_id = auth.uid());
CREATE POLICY "Enrolled students view live classes" ON public.live_classes FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.enrollments
            WHERE course_id = live_classes.course_id
                AND user_id = auth.uid()
        )
    );
-- Trigger
CREATE TRIGGER update_quizzes_modtime BEFORE
UPDATE ON public.quizzes FOR EACH ROW EXECUTE PROCEDURE update_modified_column();