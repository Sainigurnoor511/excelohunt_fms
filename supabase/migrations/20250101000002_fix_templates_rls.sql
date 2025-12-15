-- Fix RLS policies for templates to allow INSERT operations
-- Drop existing policies
DROP POLICY IF EXISTS "Controllers+ can manage templates" ON process_templates;
DROP POLICY IF EXISTS "Controllers+ can manage template tasks" ON template_tasks;

-- Create separate policies for SELECT, INSERT, UPDATE, DELETE
-- This ensures INSERT operations work correctly with WITH CHECK clause

-- Templates: SELECT (view)
CREATE POLICY "Users can view templates" ON process_templates
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Templates: INSERT (create)
CREATE POLICY "Controllers+ can insert templates" ON process_templates
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_id = auth.uid() 
      AND role IN ('admin', 'controller')
    )
  );

-- Templates: UPDATE (edit)
CREATE POLICY "Controllers+ can update templates" ON process_templates
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_id = auth.uid() 
      AND role IN ('admin', 'controller')
    )
  );

-- Templates: DELETE (remove)
CREATE POLICY "Controllers+ can delete templates" ON process_templates
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_id = auth.uid() 
      AND role IN ('admin', 'controller')
    )
  );

-- Template Tasks: SELECT (view)
CREATE POLICY "Users can view template tasks" ON template_tasks
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Template Tasks: INSERT (create)
CREATE POLICY "Controllers+ can insert template tasks" ON template_tasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_id = auth.uid() 
      AND role IN ('admin', 'controller')
    )
  );

-- Template Tasks: UPDATE (edit)
CREATE POLICY "Controllers+ can update template tasks" ON template_tasks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_id = auth.uid() 
      AND role IN ('admin', 'controller')
    )
  );

-- Template Tasks: DELETE (remove)
CREATE POLICY "Controllers+ can delete template tasks" ON template_tasks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_id = auth.uid() 
      AND role IN ('admin', 'controller')
    )
  );

