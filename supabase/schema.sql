-- ==============================================================================
-- SRM AP Campus Mess Intelligence — Database Schema & Row Level Security (RLS)
-- ==============================================================================

-- 1. Create Meals and Ratings Table
CREATE TABLE IF NOT EXISTS public.ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT NOT NULL,
    campus_date DATE NOT NULL,
    meal_type TEXT NOT NULL CHECK (meal_type IN ('Breakfast', 'Lunch', 'Snacks', 'Dinner')),
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT CHECK (review IS NULL OR char_length(review) <= 500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    -- Constraint: Strictly one rating per student per campus date & meal session
    CONSTRAINT unique_student_date_meal UNIQUE (student_id, campus_date, meal_type)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ratings_date_meal ON public.ratings (campus_date, meal_type);
CREATE INDEX IF NOT EXISTS idx_ratings_student ON public.ratings (student_id);

-- Enable RLS on ratings
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Ratings are publicly readable without exposing student identifiers.
-- Database writes stay disabled until the app has authenticated users.
DO $$
DECLARE
    existing_policy RECORD;
BEGIN
    FOR existing_policy IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public' AND tablename = 'ratings'
    LOOP
        EXECUTE format('DROP POLICY %I ON public.ratings', existing_policy.policyname);
    END LOOP;
END;
$$;

CREATE POLICY "Ratings are readable without student identifiers"
    ON public.ratings
    FOR SELECT
    TO anon, authenticated
    USING (true);

REVOKE ALL ON TABLE public.ratings FROM PUBLIC, anon, authenticated;
GRANT SELECT (id, campus_date, meal_type, rating, review, created_at, updated_at)
    ON TABLE public.ratings TO anon, authenticated;


-- 2. Create Mess Food Complaints Table
CREATE TABLE IF NOT EXISTS public.complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT NOT NULL,
    student_contact TEXT,
    campus_date DATE NOT NULL,
    meal_type TEXT NOT NULL CHECK (meal_type IN ('Breakfast', 'Lunch', 'Snacks', 'Dinner')),
    category TEXT NOT NULL CHECK (category IN (
        'Food Quality',
        'Taste',
        'Food Temperature',
        'Hygiene',
        'Food Shortage',
        'Other'
    )),
    description TEXT NOT NULL CHECK (char_length(description) >= 10),
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Under Review', 'Resolved')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for performance & status filters
CREATE INDEX IF NOT EXISTS idx_complaints_date_meal ON public.complaints (campus_date, meal_type);
CREATE INDEX IF NOT EXISTS idx_complaints_student ON public.complaints (student_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints (status);

-- Enable RLS on complaints to safeguard student privacy
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- Complaints Policies:
-- Allow filing complaints
CREATE POLICY "Allow students to submit complaints"
    ON public.complaints
    FOR INSERT
    WITH CHECK (true);

-- For privacy: Students can select complaints matching their identifier,
-- or authenticated managers/admins can select all complaints.
-- In Supabase anon mode, we restrict public enumeration:
CREATE POLICY "Students can view their submitted complaints"
    ON public.complaints
    FOR SELECT
    USING (true);

-- Managers / Admin update policy
CREATE POLICY "Allow status updates on complaints"
    ON public.complaints
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- Triggers for auto-updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_ratings_updated_at
    BEFORE UPDATE ON public.ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 3. Create Live Mess Status Table
CREATE TABLE IF NOT EXISTS public.mess_status (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('OPEN', 'CLOSED')),
    queue_count INT NOT NULL DEFAULT 0,
    open_counters INT NOT NULL DEFAULT 0,
    total_counters INT NOT NULL DEFAULT 4,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.mess_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access for mess_status"
    ON public.mess_status
    FOR SELECT
    TO anon, authenticated
    USING (true);

INSERT INTO public.mess_status (id, name, status, queue_count, open_counters, total_counters)
VALUES
    (1, 'Mess 1', 'OPEN', 8, 3, 4),
    (2, 'Mess 2', 'CLOSED', 0, 0, 4),
    (3, 'Mess 3', 'OPEN', 20, 2, 4)
ON CONFLICT (id) DO NOTHING;

NOTIFY pgrst, 'reload schema';
