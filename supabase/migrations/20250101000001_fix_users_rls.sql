-- Fix RLS policy to allow users to insert their own record during sign-up
-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Only admins can insert users" ON users;

-- Create a new policy that allows:
-- 1. Users to insert their own record (auth_id matches their auth.uid())
--    This handles the sign-up case where a new user creates their own record
-- 2. Admins to insert any user record (but only if they already exist in users table)
CREATE POLICY "Users can insert their own record or admins can insert any" ON users
  FOR INSERT WITH CHECK (
    -- Allow if user is inserting their own record (sign-up case)
    (auth_id = auth.uid() AND auth.uid() IS NOT NULL)
    OR
    -- Allow if current user is an admin (for creating other users)
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_id = auth.uid() 
      AND role = 'admin'
    )
  );

