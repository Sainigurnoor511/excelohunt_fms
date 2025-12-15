-- Add soft delete column to key entities
ALTER TABLE process_templates ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
ALTER TABLE process_instances ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;

-- Indexes for soft delete filters
CREATE INDEX IF NOT EXISTS idx_process_templates_is_deleted ON process_templates(is_deleted);
CREATE INDEX IF NOT EXISTS idx_process_instances_is_deleted ON process_instances(is_deleted);
CREATE INDEX IF NOT EXISTS idx_clients_is_deleted ON clients(is_deleted);

