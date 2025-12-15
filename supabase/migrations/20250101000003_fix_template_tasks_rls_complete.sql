-- Complete fix for template_tasks RLS policies
-- Drop ALL existing policies on template_tasks to avoid conflicts

DROP POLICY IF EXISTS "Users can view template tasks" ON template_tasks;
DROP POLICY IF EXISTS "Controllers+ can manage template tasks" ON template_tasks;
DROP POLICY IF EXISTS "Controllers+ can insert template tasks" ON template_tasks;
DROP POLICY IF EXISTS "Controllers+ can update template tasks" ON template_tasks;
DROP POLICY IF EXISTS "Controllers+ can delete template tasks" ON template_tasks;

-- Recreate all policies with correct syntax

-- Template Tasks: SELECT (view) - All authenticated users can view
CREATE POLICY "Users can view template tasks" ON template_tasks
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Template Tasks: INSERT (create) - Controllers+ can create
CREATE POLICY "Controllers+ can insert template tasks" ON template_tasks
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_id = auth.uid() 
      AND role IN ('admin', 'controller')
      AND is_active = true
    )
  );

-- Template Tasks: UPDATE (edit) - Controllers+ can update
CREATE POLICY "Controllers+ can update template tasks" ON template_tasks
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_id = auth.uid() 
      AND role IN ('admin', 'controller')
      AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_id = auth.uid() 
      AND role IN ('admin', 'controller')
      AND is_active = true
    )
  );

-- Template Tasks: DELETE (remove) - Controllers+ can delete
CREATE POLICY "Controllers+ can delete template tasks" ON template_tasks
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_id = auth.uid() 
      AND role IN ('admin', 'controller')
      AND is_active = true
    )
  );

