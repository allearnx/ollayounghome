-- Lock down public INSERT into students.
-- Public consultation should go through /api/students (server-side service role).

BEGIN;

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Remove permissive policy if present
DROP POLICY IF EXISTS "Anyone can insert students" ON students;

COMMIT;

