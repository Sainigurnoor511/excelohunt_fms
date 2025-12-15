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

      // First, try to find the user by auth_id (preferred)
      const { data: byAuthId, error: byAuthError } = await supabase
        .from("users")
        .select("*")
        .eq("auth_id", authUser.id)
        .eq("is_active", true)
        .maybeSingle();

      if (byAuthError) throw byAuthError;
      if (byAuthId) return byAuthId as User;

      // Fallback: for users created by admin via email (auth_id still null),
      // try to match on email so roles like BDE work correctly.
      if (!authUser.email) return null;

      const { data: byEmail, error: byEmailError } = await supabase
        .from("users")
        .select("*")
        .eq("email", authUser.email)
        .eq("is_active", true)
        .maybeSingle();

      if (byEmailError) throw byEmailError;
      return (byEmail as User) ?? null;
    },
  });
}

