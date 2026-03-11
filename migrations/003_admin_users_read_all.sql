-- Migration 003: Allow admins to read all admin_users records
-- The previous policy only let users read their own record.
-- For the team management page, admins need to see all team members.

DROP POLICY IF EXISTS "Users can read their own admin record" ON admin_users;

-- Any authenticated admin can read all admin_users records
CREATE POLICY "Admins can read all admin_users" ON admin_users
  FOR SELECT
  USING (auth.uid() IN (SELECT id FROM admin_users));

-- Allow owners to update any admin_users record
CREATE POLICY "Owners can update admin_users" ON admin_users
  FOR UPDATE
  USING (
    auth.uid() IN (SELECT id FROM admin_users WHERE role = 'owner')
  )
  WITH CHECK (
    auth.uid() IN (SELECT id FROM admin_users WHERE role = 'owner')
  );
