-- Lock down students table RLS for production safety.
-- All students CRUD is handled by server-side service role only.

BEGIN;

ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Drop all permissive policies
DROP POLICY IF EXISTS "Anyone can insert students" ON students;
DROP POLICY IF EXISTS "Authenticated users can view students" ON students;
DROP POLICY IF EXISTS "Authenticated users can update students" ON students;
DROP POLICY IF EXISTS "Authenticated users can delete students" ON students;

-- Revoke direct access from anon/authenticated roles
REVOKE ALL ON TABLE students FROM anon;
REVOKE ALL ON TABLE students FROM authenticated;

COMMIT;
