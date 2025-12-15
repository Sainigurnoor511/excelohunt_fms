"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/lib/hooks/use-user";
import type { User, UserRole } from "@/lib/types/database";

const ROLE_OPTIONS: UserRole[] = ["admin", "controller", "member", "bde"];

export function Users() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { data: currentUser, isLoading: isCurrentUserLoading } = useUser();

  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<UserRole>("member");

  const {
    data: users,
    isLoading: isUsersLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data as User[];
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (payload: {
      name: string;
      email: string;
      role: UserRole;
    }) => {
      const { data, error } = await supabase
        .from("users")
        .insert({
          name: payload.name,
          email: payload.email,
          role: payload.role,
          is_active: true,
        } as never)
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      return data as User;
    },
    onSuccess: () => {
      setNewUserName("");
      setNewUserEmail("");
      setNewUserRole("member");
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async (payload: { userId: string; role: UserRole }) => {
      const { error } = await supabase
        .from("users")
        .update({ role: payload.role } as never)
        .eq("id", payload.userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const handleCreateUser = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;
    if (createUserMutation.isPending) return;

    createUserMutation.mutate({
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
    });
  };

  const isAdmin = currentUser?.role === "admin";

  if (isUsersLoading || isCurrentUserLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (isError) {
    return (
      <div className="p-8 text-sm text-red-600">
        Failed to load users: {(error as Error)?.message ?? "Unknown error"}
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
        <p className="mt-2 text-gray-600">
          System users and their roles. Only admins can create and update users.
        </p>
      </div>

      {isAdmin ? (
        <Card>
          <CardHeader>
            <CardTitle>Add new user</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              className="grid gap-4 md:grid-cols-[2fr,2fr,1.5fr,auto] items-end"
              onSubmit={handleCreateUser}
            >
              <div className="space-y-1">
                <Label htmlFor="new-user-name">Name</Label>
                <Input
                  id="new-user-name"
                  placeholder="John Doe"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="new-user-email">Email</Label>
                <Input
                  id="new-user-email"
                  type="email"
                  placeholder="john@example.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="new-user-role">Role</Label>
                <Select
                  value={newUserRole}
                  onValueChange={(value) => setNewUserRole(value as UserRole)}
                >
                  <SelectTrigger id="new-user-role" className="w-full">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((role) => (
                      <SelectItem key={role} value={role}>
                        <span className="capitalize">{role}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-end">
                <Button type="submit" disabled={createUserMutation.isPending}>
                  {createUserMutation.isPending ? "Creating..." : "Add user"}
                </Button>
              </div>
            </form>
            <p className="mt-2 text-xs text-gray-500">
              New users are created as active. Their Supabase login will be
              connected later when they sign up with this email.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-4 text-sm text-gray-600">
            You can view users, but only admins can create or update them.
          </CardContent>
        </Card>
      )}

      {users && users.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => {
            const isCurrentUser = currentUser && user.id === currentUser.id;

            return (
              <Card key={user.id}>
                <CardHeader>
                  <CardTitle>{user.name}</CardTitle>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </CardHeader>
                <CardContent className="flex items-center justify-between gap-4">
                  {isAdmin && !isCurrentUser ? (
                    <div className="space-y-1">
                      <Label className="text-xs text-gray-500">Role</Label>
                      <Select
                        defaultValue={user.role}
                        onValueChange={(value) =>
                          updateRoleMutation.mutate({
                            userId: user.id,
                            role: value as UserRole,
                          })
                        }
                      >
                        <SelectTrigger className="min-w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLE_OPTIONS.map((role) => (
                            <SelectItem key={role} value={role}>
                              <span className="capitalize">{role}</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : (
                    <Badge variant="default" className="capitalize">
                      {user.role}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No users found.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
