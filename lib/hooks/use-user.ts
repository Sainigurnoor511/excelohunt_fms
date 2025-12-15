"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@/lib/types/database";

export function useUser() {
  const supabase = createClient();

  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) return null;

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("auth_id", authUser.id)
        .eq("is_active", true)
        .single();

      if (error) throw error;
      return data as User | null;
    },
  });
}

