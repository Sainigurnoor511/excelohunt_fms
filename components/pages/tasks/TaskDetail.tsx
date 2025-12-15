"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useUpdateTaskStatus } from "@/lib/hooks/use-tasks";
import type { ChecklistItem, ChecklistValue, User } from "@/lib/types/database";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUser } from "@/lib/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TaskDetail() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const taskId = params?.id?.toString() || "";
  const supabase = createClient();
  const { data: currentUser } = useUser();
  const updateTaskStatus = useUpdateTaskStatus();

  const { data: task, isLoading } = useQuery({
    queryKey: ["task", taskId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("instance_task_statuses")
        .select(`
          *,
          template_tasks:template_task_id (
            id,
            name,
            description,
            requires_approval,
            checklist
          ),
          process_instances:instance_id (
            id,
            name,
            clients:client_id (
              client_name,
              company_name
            )
          )
        `)
        .eq("id", taskId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const [checklistValues, setChecklistValues] = useState<ChecklistValue[]>([]);
  const [comment, setComment] = useState("");
  const [deliverableLink, setDeliverableLink] = useState("");
  const [approverId, setApproverId] = useState<string | undefined>(undefined);

  const { data: controllers } = useQuery({
    queryKey: ["controllers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users")
        .select("id, name, email, role")
        .eq("role", "controller")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data as Pick<User, "id" | "name" | "email" | "role">[];
    },
    enabled: !!(task as any)?.template_tasks?.requires_approval,
  });

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!task) {
    return <div className="p-8">Task not found</div>;
  }

  type TemplateTask = {
    id: string;
    name: string;
    description: string;
    requires_approval?: boolean;
    checklist?: ChecklistItem[];
    // add more fields if necessary
  };

  // Fix for types: tell TypeScript that task is not never
  const templateTask = (task as { template_tasks?: TemplateTask }).template_tasks;
  const checklist: ChecklistItem[] = templateTask?.checklist || [];
  const requiresApproval = !!templateTask?.requires_approval;

  const handleChecklistChange = (itemId: string, checked: boolean, inputValue?: string) => {
    setChecklistValues((prev) => {
      const existing = prev.findIndex((v) => v.checklistItemId === itemId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { checklistItemId: itemId, checked, inputValue };
        return updated;
      }
      return [...prev, { checklistItemId: itemId, checked, inputValue }];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (requiresApproval && !approverId) {
      alert("Please select a controller to send this task for approval.");
      return;
    }
    const status = requiresApproval ? "pending_approval" : "completed";

    const comments = comment
      ? [
          {
            id: crypto.randomUUID(),
            user_id: currentUser?.id || (task as any).assigned_to_user_id,
            user_name: currentUser?.name || "Current User",
            text: comment,
            created_at: new Date().toISOString(),
          },
        ]
      : [];

    try {
      await updateTaskStatus.mutateAsync({
        taskId,
        status,
        checklistValues,
        comments,
        deliverableLink: deliverableLink || undefined,
        approverId: requiresApproval ? approverId : undefined,
      });

      router.push("/tasks");
    } catch (error: any) {
      console.error("Failed to complete task:", error);
      const friendly = error?.message || "Failed to complete task. Please try again.";
      alert(friendly);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{templateTask?.name || "Task"}</h1>
        <p className="mt-2 text-gray-600">
          {/* Safely access process instance and client info */}
          {(task as any)?.process_instances?.name || "No Process"} - {(task as any)?.process_instances?.clients?.client_name || "No Client"}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {templateTask?.requires_approval && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Approval</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-gray-600">
                This task requires approval. Select a controller to send this task to for approval.
              </p>
              <Select
                value={approverId}
                onValueChange={(value) => setApproverId(value)}
              >
                <SelectTrigger className="w-full max-w-sm">
                  <SelectValue placeholder="Select controller" />
                </SelectTrigger>
                <SelectContent>
                  {controllers && controllers.length > 0 ? (
                    controllers.map((controller) => (
                      <SelectItem key={controller.id} value={controller.id}>
                        <span className="font-medium">{controller.name}</span>
                        <span className="ml-2 text-xs text-gray-500">
                          {controller.email}
                        </span>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="">
                      <span className="text-gray-500 text-sm">
                        No controllers available. Please contact an admin.
                      </span>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Checklist</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {checklist.length > 0 ? (
              checklist.map((item) => {
                const value = checklistValues.find((v) => v.checklistItemId === item.id);
                return (
                  <div key={item.id} className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id={item.id}
                      checked={value?.checked || false}
                      onChange={(e) => handleChecklistChange(item.id, e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-gray-300"
                    />
                    <div className="flex-1">
                      <Label htmlFor={item.id} className="cursor-pointer">
                        {item.text}
                      </Label>
                      {item.hasInput && (
                        <Input
                          className="mt-2"
                          placeholder={item.inputLabel}
                          value={value?.inputValue || ""}
                          onChange={(e) =>
                            handleChecklistChange(item.id, value?.checked || false, e.target.value)
                          }
                        />
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500">No checklist items</p>
            )}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Comments (optional)</CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="flex min-h-[100px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
              placeholder="Add any comments or notes..."
            />
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Deliverable Link (optional)</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="url"
              value={deliverableLink}
              onChange={(e) => setDeliverableLink(e.target.value)}
              placeholder="https://..."
            />
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={updateTaskStatus.isPending}>
            {updateTaskStatus.isPending
              ? "Submitting..."
              : templateTask?.requires_approval
              ? "Submit for Approval"
              : "Mark Complete"}
          </Button>
        </div>
      </form>
    </div>
  );
}

