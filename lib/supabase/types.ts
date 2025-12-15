// This will be generated from Supabase, but for now we'll define it manually
// In production, use: npx supabase gen types typescript --project-id <project-id> > lib/supabase/types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          auth_id: string | null;
          email: string;
          name: string;
          role: "admin" | "controller" | "member" | "bde";
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          auth_id?: string | null;
          email: string;
          name: string;
          role: "admin" | "controller" | "member" | "bde";
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          auth_id?: string | null;
          email?: string;
          name?: string;
          role?: "admin" | "controller" | "member" | "bde";
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      clients: {
        Row: {
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
        };
        Insert: {
          id?: string;
          client_name: string;
          company_name?: string | null;
          contact_person?: string | null;
          email?: string | null;
          phone_number?: string | null;
          address?: string | null;
          location?: string | null;
          timezone?: string;
          website?: string | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_name?: string;
          company_name?: string | null;
          contact_person?: string | null;
          email?: string | null;
          phone_number?: string | null;
          address?: string | null;
          location?: string | null;
          timezone?: string;
          website?: string | null;
          notes?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      process_templates: {
        Row: {
          id: string;
          name: string;
          category: string | null;
          description: string | null;
          is_active: boolean;
          owner_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          category?: string | null;
          description?: string | null;
          is_active?: boolean;
          owner_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          category?: string | null;
          description?: string | null;
          is_active?: boolean;
          owner_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      template_tasks: {
        Row: {
          id: string;
          template_id: string;
          name: string;
          description: string | null;
          order: number;
          task_duration_minutes: number;
          sla_hours: number;
          requires_approval: boolean;
          default_role: string | null;
          checklist: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          template_id: string;
          name: string;
          description?: string | null;
          order: number;
          task_duration_minutes?: number;
          sla_hours?: number;
          requires_approval?: boolean;
          default_role?: string | null;
          checklist?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          template_id?: string;
          name?: string;
          description?: string | null;
          order?: number;
          task_duration_minutes?: number;
          sla_hours?: number;
          requires_approval?: boolean;
          default_role?: string | null;
          checklist?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      process_instances: {
        Row: {
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
        };
        Insert: {
          id?: string;
          template_id: string;
          client_id: string;
          name: string;
          status?: "active" | "completed" | "archived";
          current_task_index?: number;
          progress?: number;
          started_at?: string;
          completed_at?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          template_id?: string;
          client_id?: string;
          name?: string;
          status?: "active" | "completed" | "archived";
          current_task_index?: number;
          progress?: number;
          started_at?: string;
          completed_at?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      instance_task_statuses: {
        Row: {
          id: string;
          instance_id: string;
          template_task_id: string;
          assigned_to_user_id: string | null;
          approver_id: string | null;
          status: "not_started" | "pending" | "in_progress" | "pending_approval" | "completed" | "rejected";
          due_date: string | null;
          estimated_hours: number | null;
          started_at: string | null;
          completed_at: string | null;
          checklist_values: Json;
          comments: Json;
          deliverable_link: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          instance_id: string;
          template_task_id: string;
          assigned_to_user_id?: string | null;
          approver_id?: string | null;
          status?: "not_started" | "pending" | "in_progress" | "pending_approval" | "completed" | "rejected";
          due_date?: string | null;
          estimated_hours?: number | null;
          started_at?: string | null;
          completed_at?: string | null;
          checklist_values?: Json;
          comments?: Json;
          deliverable_link?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          instance_id?: string;
          template_task_id?: string;
          assigned_to_user_id?: string | null;
          approver_id?: string | null;
          status?: "not_started" | "pending" | "in_progress" | "pending_approval" | "completed" | "rejected";
          due_date?: string | null;
          estimated_hours?: number | null;
          started_at?: string | null;
          completed_at?: string | null;
          checklist_values?: Json;
          comments?: Json;
          deliverable_link?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

