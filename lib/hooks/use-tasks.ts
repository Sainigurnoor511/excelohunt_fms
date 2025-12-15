"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { InstanceTaskStatus } from "@/lib/types/database";

export function useMyTasks(userId: string | null) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["my-tasks", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("instance_task_statuses")
        .select(`
          *,
          process_instances:instance_id (
            id,
            name,
            clients:client_id (
              id,
              client_name,
              company_name
            )
          ),
          template_tasks:template_task_id (
            id,
            name,
            description,
            order
          )
        `)
        .eq("assigned_to_user_id", userId)
        .order("due_date", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as any[];
    },
    enabled: !!userId,
  });
}

export function usePendingApprovals(userId: string | null) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["pending-approvals", userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("instance_task_statuses")
        .select(`
          *,
          process_instances:instance_id (
            id,
            name,
            clients:client_id (
              id,
              client_name,
              company_name
            )
          ),
          template_tasks:template_task_id (
            id,
            name,
            description
          ),
          assigned_user:assigned_to_user_id (
            id,
            name,
            email
          )
        `)
        .eq("approver_id", userId)
        .eq("status", "pending_approval")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as any[];
    },
    enabled: !!userId,
  });
}

export function useUpdateTaskStatus() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      status,
      checklistValues,
      comments,
      deliverableLink,
      approverId,
    }: {
      taskId: string;
      status: string;
      checklistValues?: any[];
      comments?: any[];
      deliverableLink?: string;
      approverId?: string;
    }) => {
      const updateData: any = { status, updated_at: new Date().toISOString() };

      if (checklistValues) updateData.checklist_values = checklistValues;
      if (comments) updateData.comments = comments;
      if (deliverableLink) updateData.deliverable_link = deliverableLink;
      if (approverId) updateData.approver_id = approverId;

      if (status === "in_progress" && !updateData.started_at) {
        updateData.started_at = new Date().toISOString();
      }

      if (status === "completed" || status === "pending_approval") {
        updateData.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from("instance_task_statuses")
        .update(updateData as never)
        .eq("id", taskId)
        .select()
        .single();

      if (error) throw error;
      return data as InstanceTaskStatus;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["pending-approvals"] });
      queryClient.invalidateQueries({ queryKey: ["instance-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["instances"] });
    },
  });
}

export function useDeleteTask() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from("instance_task_statuses")
        .delete()
        .eq("id", taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["pending-approvals"] });
      queryClient.invalidateQueries({ queryKey: ["instance-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["instances"] });
    },
  });
}

