"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { ProcessTemplate, TemplateTask } from "@/lib/types/database";

export function useTemplates() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("process_templates")
        .select("*")
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ProcessTemplate[];
    },
  });
}

export function useTemplate(id: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["templates", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("process_templates")
        .select("*")
        .eq("is_deleted", false)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as ProcessTemplate;
    },
    enabled: !!id,
  });
}

export function useTemplateTasks(templateId: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["template-tasks", templateId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("template_tasks")
        .select("*")
        .eq("template_id", templateId)
        .order("order", { ascending: true });

      if (error) throw error;
      return data as TemplateTask[];
    },
    enabled: !!templateId,
  });
}

export function useCreateTemplate() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (template: {
      name: string;
      category?: string;
      description?: string;
      owner_id?: string;
    }) => {
      const { data, error } = await supabase
        .from("process_templates")
        .insert(template)
        .select()
        .single();

      if (error) throw error;
      return data as ProcessTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });
}

export function useCreateTemplateTask() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (task: {
      template_id: string;
      name: string;
      description?: string;
      order: number;
      task_duration_minutes: number;
      sla_hours: number;
      requires_approval: boolean;
      checklist?: any[];
    }) => {
      const { data, error } = await supabase
        .from("template_tasks")
        .insert(task)
        .select()
        .single();

      if (error) throw error;
      return data as TemplateTask;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["template-tasks", variables.template_id],
      });
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });
}

export function useDeleteTemplateTask() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { id: string; template_id: string }) => {
      const { error } = await supabase
        .from("template_tasks")
        .delete()
        .eq("id", payload.id);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["template-tasks", variables.template_id],
      });
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });
}

