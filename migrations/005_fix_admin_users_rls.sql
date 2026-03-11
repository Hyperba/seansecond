-- Migration 005: Fix admin_users RLS circular dependency
-- The previous policy created a circular check that blocks all reads.
-- This fix allows users to read their own record first, then read all if they're an admin.

-- Drop the problematic policies
DROP POLICY IF EXISTS "Admins can read all admin_users" ON admin_users;
DROP POLICY IF EXISTS "Users can read their own admin record" ON admin_users;

-- Step 1: Allow users to read their OWN record (no circular dependency)
CREATE POLICY "Users can read own admin record" ON admin_users
  FOR SELECT
  USING (auth.uid() = id);

-- Step 2: Allow admins to read ALL records (uses security definer function to avoid recursion)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  );
$$;

CREATE POLICY "Admins can read all admin_users" ON admin_users
  FOR SELECT
  USING (is_admin());

-- Recreate update policy using the function
DROP POLICY IF EXISTS "Owners can update admin_users" ON admin_users;

CREATE OR REPLACE FUNCTION is_owner()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'owner'
  );
$$;

CREATE POLICY "Owners can update admin_users" ON admin_users
  FOR UPDATE
  USING (is_owner())
  WITH CHECK (is_owner());
