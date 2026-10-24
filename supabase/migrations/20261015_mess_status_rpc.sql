-- ==============================================================================
-- Phase 2: Stored Procedure for Updating Mess Status with Staff PIN
-- Run this in your Supabase Project -> SQL Editor
-- ==============================================================================

-- 1. Ensure public read access remains open for students
ALTER TABLE public.mess_status ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
          AND tablename = 'mess_status' 
          AND policyname = 'Allow public read access for mess_status'
    ) THEN
        CREATE POLICY "Allow public read access for mess_status"
            ON public.mess_status
            FOR SELECT
            TO anon, authenticated
            USING (true);
    END IF;
END;
$$;

-- 2. Stored Procedure for validated staff updates (Default PIN: 1234)
CREATE OR REPLACE FUNCTION public.update_mess_queue_status(
    p_mess_id INT,
    p_status TEXT,
    p_queue_count INT,
    p_open_counters INT,
    p_staff_pin TEXT
)
RETURNS public.mess_status
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_updated public.mess_status;
BEGIN
    -- Verify simple staff PIN for college demo (Default: 1234)
    IF p_staff_pin IS NULL OR p_staff_pin <> '1234' THEN
        RAISE EXCEPTION 'Invalid Staff PIN. Unauthorized update attempt.';
    END IF;

    -- Validate status
    IF p_status NOT IN ('OPEN', 'CLOSED') THEN
        RAISE EXCEPTION 'Status must be either OPEN or CLOSED.';
    END IF;

    -- Validate queue count
    IF p_queue_count < 0 OR p_queue_count > 500 THEN
        RAISE EXCEPTION 'Queue count must be between 0 and 500.';
    END IF;

    -- Validate open counters
    IF p_open_counters < 0 OR p_open_counters > 4 THEN
        RAISE EXCEPTION 'Open counters must be between 0 and 4.';
    END IF;

    -- Automatically set open counters to 0 if mess is closed
    IF p_status = 'CLOSED' THEN
        p_open_counters := 0;
    END IF;

    -- Execute update
    UPDATE public.mess_status
    SET 
        status = p_status,
        queue_count = p_queue_count,
        open_counters = p_open_counters,
        updated_at = timezone('utc'::text, now())
    WHERE id = p_mess_id
    RETURNING * INTO v_updated;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Mess with ID % not found.', p_mess_id;
    END IF;

    RETURN v_updated;
END;
$$;

-- 3. Grant execute privilege to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.update_mess_queue_status TO anon, authenticated;

-- 4. Enable Realtime on mess_status (if publication exists)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_publication_tables 
            WHERE pubname = 'supabase_realtime' 
              AND schemaname = 'public' 
              AND tablename = 'mess_status'
        ) THEN
            ALTER PUBLICATION supabase_realtime ADD TABLE public.mess_status;
        END IF;
    END IF;
END;
$$;

NOTIFY pgrst, 'reload schema';

