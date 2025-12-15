-- Comprehensive fix for ALL template-related RLS policies
-- This ensures INSERT operations work correctly

-- ============================================
-- PROCESS_TEMPLATES TABLE
-- ============================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view templates" ON process_templates;
DROP POLICY IF EXISTS "Controllers+ can manage templates" ON process_templates;
DROP POLICY IF EXISTS "Controllers+ can insert templates" ON process_templates;
DROP POLICY IF EXISTS "Controllers+ can update templates" ON process_templates;
DROP POLICY IF EXISTS "Controllers+ can delete templates" ON process_templates;

-- Recreate policies with correct syntax

-- SELECT: All authenticated users can view
CREATE POLICY "Users can view templates" ON process_templates
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- INSERT: Controllers+ can create (WITH CHECK is required for INSERT)
CREATE POLICY "Controllers+ can insert templates" ON process_templates
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_id = auth.uid() 
      AND role IN ('admin', 'controller')
      AND is_active = true
    )
  );

-- UPDATE: Controllers+ can update (needs both USING and WITH CHECK)
CREATE POLICY "Controllers+ can update templates" ON process_templates
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

-- DELETE: Controllers+ can delete
CREATE POLICY "Controllers+ can delete templates" ON process_templates
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_id = auth.uid() 
      AND role IN ('admin', 'controller')
      AND is_active = true
    )
  );

-- ============================================
-- TEMPLATE_TASKS TABLE
-- ============================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view template tasks" ON template_tasks;
DROP POLICY IF EXISTS "Controllers+ can manage template tasks" ON template_tasks;
DROP POLICY IF EXISTS "Controllers+ can insert template tasks" ON template_tasks;
DROP POLICY IF EXISTS "Controllers+ can update template tasks" ON template_tasks;
DROP POLICY IF EXISTS "Controllers+ can delete template tasks" ON template_tasks;

-- Recreate policies with correct syntax

-- SELECT: All authenticated users can view
CREATE POLICY "Users can view template tasks" ON template_tasks
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- INSERT: Controllers+ can create (WITH CHECK is required for INSERT)
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

-- UPDATE: Controllers+ can update (needs both USING and WITH CHECK)
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

-- DELETE: Controllers+ can delete
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

