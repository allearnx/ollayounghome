-- Lock down payments table RLS for production safety.
-- Assumes all payments CRUD is handled by server-side service role only.

BEGIN;

-- Ensure RLS enabled
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Drop permissive policies (if they exist)
DROP POLICY IF EXISTS "Anyone can view payments by order_id" ON payments;
DROP POLICY IF EXISTS "Anyone can insert payments" ON payments;
DROP POLICY IF EXISTS "Anyone can update payments" ON payments;

-- Optional: explicitly revoke privileges from anon/authenticated roles
REVOKE ALL ON TABLE payments FROM anon;
REVOKE ALL ON TABLE payments FROM authenticated;

COMMIT;

