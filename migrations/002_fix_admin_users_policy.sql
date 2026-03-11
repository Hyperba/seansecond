-- Migration 002: Fix admin_users RLS policy circular dependency
-- The original policy prevented users from reading their own admin_users record
-- because they had to be in admin_users to read admin_users (catch-22).

-- Drop the broken policy
DROP POLICY IF EXISTS "Admins can read admin_users" ON admin_users;

-- New policy: authenticated users can read their own admin_users record
CREATE POLICY "Users can read their own admin record" ON admin_users
  FOR SELECT
  USING (auth.uid() = id);

-- This allows the admin layout to check if the authenticated user
-- has a corresponding admin_users entry.
