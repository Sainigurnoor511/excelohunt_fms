export type UserRole = "admin" | "controller" | "member" | "bde";

export interface User {
  id: string;
  auth_id: string | null;
  email: string;
  name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  client_name: string;
  company_name: string | null;
  contact_person: string | null;
  email: string | null;
  phone_number: string | null;
  address: string | null;
  location: string | null;
  timezone: string;
  website: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProcessTemplate {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  is_active: boolean;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface TemplateTask {
  id: string;
  template_id: string;
  name: string;
  description: string | null;
  order: number;
  task_duration_minutes: number;
  sla_hours: number;
  requires_approval: boolean;
  default_role: string | null;
  checklist: ChecklistItem[];
  created_at: string;
  updated_at: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  required: boolean;
  hasInput?: boolean;
  inputLabel?: string;
}

export interface ProcessInstance {
  id: string;
  template_id: string;
  client_id: string;
  name: string;
  status: "active" | "completed" | "archived";
  current_task_index: number;
  progress: number;
  started_at: string;
  completed_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type TaskStatus =
  | "not_started"
  | "pending"
  | "in_progress"
  | "pending_approval"
  | "completed"
  | "rejected";

export interface InstanceTaskStatus {
  id: string;
  instance_id: string;
  template_task_id: string;
  assigned_to_user_id: string | null;
  approver_id: string | null;
  status: TaskStatus;
  due_date: string | null;
  estimated_hours: number | null;
  started_at: string | null;
  completed_at: string | null;
  checklist_values: ChecklistValue[];
  comments: Comment[];
  deliverable_link: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChecklistValue {
  checklistItemId: string;
  checked: boolean;
  inputValue?: string;
}

export interface Comment {
  id: string;
  user_id: string;
  user_name: string;
  text: string;
  created_at: string;
}

