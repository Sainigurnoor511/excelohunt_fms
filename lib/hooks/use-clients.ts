"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Client } from "@/lib/types/database";

export function useClients() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("is_active", true)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Client[];
    },
  });
}

export function useCreateClient() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (client: {
      client_name: string;
      company_name?: string;
      contact_person?: string;
      email?: string;
      phone_number?: string;
      address?: string;
      location?: string;
      timezone?: string;
      website?: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from("clients")
        .insert(client)
        .select()
        .single();

      if (error) throw error;
      return data as Client;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });
}

