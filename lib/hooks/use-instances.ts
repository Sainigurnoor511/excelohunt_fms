"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { ProcessInstance, InstanceTaskStatus } from "@/lib/types/database";

export function useInstances() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["instances"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("process_instances")
        .select("*")
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ProcessInstance[];
    },
  });
}

export function useInstance(id: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["instances", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("process_instances")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as ProcessInstance;
    },
    enabled: !!id,
  });
}

export function useInstanceTasks(instanceId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["instance-tasks", instanceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("instance_task_statuses")
        .select(`
          *,
          template_tasks:template_task_id (
            id,
            name,
            description,
            order,
            task_duration_minutes,
            sla_hours,
            requires_approval,
            checklist
          )
        `)
        .eq("instance_id", instanceId)
        .order("order", { foreignTable: "template_tasks", ascending: true });

      if (error) throw error;
      return data as any[];
    },
    enabled: !!instanceId,
  });
}

export function useCreateInstance() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (instance: {
      template_id: string;
      client_id: string;
      name: string;
      created_by: string;
    }) => {
      const { data, error } = await supabase
        .from("process_instances")
        .insert(instance)
        .select()
        .single();

      if (error) throw error;
      return data as ProcessInstance;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instances"] });
    },
  });
}

