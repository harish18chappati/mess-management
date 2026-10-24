CREATE TABLE IF NOT EXISTS public.ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT NOT NULL,
    campus_date DATE NOT NULL,
    meal_type TEXT NOT NULL CHECK (meal_type IN ('Breakfast', 'Lunch', 'Snacks', 'Dinner')),
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review TEXT CHECK (review IS NULL OR char_length(review) <= 500),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_student_date_meal UNIQUE (student_id, campus_date, meal_type)
);

CREATE INDEX IF NOT EXISTS idx_ratings_date_meal
    ON public.ratings (campus_date, meal_type);
CREATE INDEX IF NOT EXISTS idx_ratings_student
    ON public.ratings (student_id);

ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

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

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_ratings_updated_at ON public.ratings;
CREATE TRIGGER trigger_ratings_updated_at
    BEFORE UPDATE ON public.ratings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

NOTIFY pgrst, 'reload schema';
