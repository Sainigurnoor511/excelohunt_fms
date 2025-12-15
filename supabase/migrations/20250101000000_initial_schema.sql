-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (synced with Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'controller', 'member', 'bde')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clients
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name VARCHAR(255) NOT NULL,
  company_name VARCHAR(255),
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone_number VARCHAR(50),
  address TEXT,
  location VARCHAR(255),
  timezone VARCHAR(100) DEFAULT 'Asia/Kolkata',
  website VARCHAR(255),
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Process Templates
CREATE TABLE process_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  owner_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Template Tasks (ordered tasks within templates)
CREATE TABLE template_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES process_templates(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  "order" INTEGER NOT NULL,
  task_duration_minutes INTEGER DEFAULT 30,
  sla_hours INTEGER DEFAULT 24,
  requires_approval BOOLEAN DEFAULT false,
  default_role VARCHAR(50),
  checklist JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(template_id, "order")
);

-- Process Instances
CREATE TABLE process_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES process_templates(id),
  client_id UUID REFERENCES clients(id),
  name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  current_task_index INTEGER DEFAULT 0,
  progress DECIMAL(5,2) DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Instance Task Statuses (task assignments and execution)
CREATE TABLE instance_task_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID REFERENCES process_instances(id) ON DELETE CASCADE,
  template_task_id UUID REFERENCES template_tasks(id),
  assigned_to_user_id UUID REFERENCES users(id),
  approver_id UUID REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'not_started' 
    CHECK (status IN ('not_started', 'pending', 'in_progress', 'pending_approval', 'completed', 'rejected')),
  due_date TIMESTAMP WITH TIME ZONE,
  estimated_hours DECIMAL(5,2),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  checklist_values JSONB DEFAULT '[]'::jsonb,
  comments JSONB DEFAULT '[]'::jsonb,
  deliverable_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(instance_id, template_task_id)
);

-- Indexes for performance
CREATE INDEX idx_users_auth_id ON users(auth_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_template_tasks_template_id ON template_tasks(template_id);
CREATE INDEX idx_instance_task_statuses_instance_id ON instance_task_statuses(instance_id);
CREATE INDEX idx_instance_task_statuses_assigned_to ON instance_task_statuses(assigned_to_user_id);
CREATE INDEX idx_instance_task_statuses_approver_id ON instance_task_statuses(approver_id);
CREATE INDEX idx_instance_task_statuses_status ON instance_task_statuses(status);
CREATE INDEX idx_process_instances_template_id ON process_instances(template_id);
CREATE INDEX idx_process_instances_client_id ON process_instances(client_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE instance_task_statuses ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users: All authenticated users can view, only admins can modify
CREATE POLICY "Users can view all active users" ON users
  FOR SELECT USING (auth.uid() IS NOT NULL AND is_active = true);

CREATE POLICY "Only admins can insert users" ON users
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Only admins can update users" ON users
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role = 'admin')
  );

-- Clients: All authenticated users can view, controllers+ can modify
CREATE POLICY "Users can view all clients" ON clients
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Controllers+ can manage clients" ON clients
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_id = auth.uid() 
      AND role IN ('admin', 'controller', 'bde')
    )
  );

-- Templates: All can view, controllers+ can modify
CREATE POLICY "Users can view templates" ON process_templates
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Controllers+ can manage templates" ON process_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_id = auth.uid() 
      AND role IN ('admin', 'controller')
    )
  );

-- Template Tasks: Same as templates
CREATE POLICY "Users can view template tasks" ON template_tasks
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Controllers+ can manage template tasks" ON template_tasks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_id = auth.uid() 
      AND role IN ('admin', 'controller')
    )
  );

-- Instances: All can view, controllers+ can create
CREATE POLICY "Users can view instances" ON process_instances
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Controllers+ can manage instances" ON process_instances
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_id = auth.uid() 
      AND role IN ('admin', 'controller')
    )
  );

-- Task Statuses: Users can view their assigned tasks, controllers can view all
CREATE POLICY "Users can view assigned tasks" ON instance_task_statuses
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      assigned_to_user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
      OR approver_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
      OR EXISTS (
        SELECT 1 FROM users 
        WHERE auth_id = auth.uid() 
        AND role IN ('admin', 'controller')
      )
    )
  );

CREATE POLICY "Users can update their tasks" ON instance_task_statuses
  FOR UPDATE USING (
    assigned_to_user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "Controllers+ can assign tasks" ON instance_task_statuses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_id = auth.uid() 
      AND role IN ('admin', 'controller')
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_process_templates_updated_at BEFORE UPDATE ON process_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_template_tasks_updated_at BEFORE UPDATE ON template_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_process_instances_updated_at BEFORE UPDATE ON process_instances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_instance_task_statuses_updated_at BEFORE UPDATE ON instance_task_statuses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

