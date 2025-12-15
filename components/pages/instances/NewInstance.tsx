"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useTemplates, useTemplateTasks } from "@/lib/hooks/use-templates";
import { useClients } from "@/lib/hooks/use-clients";
import { useCreateInstance } from "@/lib/hooks/use-instances";
import { useUser } from "@/lib/hooks/use-user";
import { calculateDueDate } from "@/lib/utils/date-calculator";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function NewInstance() {
  const router = useRouter();
  const { data: user } = useUser();
  const { data: templates } = useTemplates();
  const { data: clients } = useClients();
  const createInstance = useCreateInstance();
  const supabase = createClient();

  const [step, setStep] = useState(1);
  const [templateId, setTemplateId] = useState("");
  const [clientId, setClientId] = useState("");
  const [name, setName] = useState("");
  const [assignments, setAssignments] = useState<Record<string, { assignee: string; approver?: string }>>({});

  const { data: templateTasks } = useTemplateTasks(templateId);

  const handleNext = () => {
    if (step === 1 && templateId) {
      setStep(2);
    } else if (step === 2 && clientId) {
      setStep(3);
    } else if (step === 3 && name) {
      setStep(4);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !templateId || !clientId || !name) return;

    try {
      // Create instance
      const instance = await createInstance.mutateAsync({
        template_id: templateId,
        client_id: clientId,
        name,
        created_by: user.id,
      });

      // Create task statuses and assign
      if (templateTasks) {
        const startDate = new Date();
        let currentDate = new Date(startDate);

        for (const templateTask of templateTasks) {
          const assignment = assignments[templateTask.id];
          if (!assignment || !assignment.assignee) continue;

          const dueDate = calculateDueDate(
            currentDate,
            templateTask.task_duration_minutes,
            templateTask.sla_hours
          );

          await supabase.from("instance_task_statuses").insert({
            instance_id: instance.id,
            template_task_id: templateTask.id,
            assigned_to_user_id: assignment.assignee,
            approver_id: templateTask.requires_approval ? assignment.approver : null,
            status: templateTask.order === 0 ? "pending" : "not_started",
            due_date: dueDate.toISOString(),
            estimated_hours: templateTask.task_duration_minutes / 60,
          });

          // Update current date for next task
          currentDate = new Date(dueDate);
        }
      }

      router.push(`/instances/${instance.id}`);
    } catch (error) {
      console.error("Failed to create instance:", error);
      alert("Failed to create instance. Please try again.");
    }
  };

  // Fetch users for assignment
  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create Instance</h1>
        <p className="mt-2 text-gray-600">Create a new workflow instance from a template</p>
      </div>

      <div className="mb-6 flex gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className={`flex-1 h-2 rounded ${s <= step ? "bg-blue-600" : "bg-gray-200"}`} />
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Select Template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="template">Template *</Label>
                <Select id="template" value={templateId} onChange={(e) => setTemplateId(e.target.value)} required>
                  <option value="">Select a template</option>
                  {templates
                    ?.filter((t) => t.is_active)
                    .map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                </Select>
              </div>
              <Button type="button" onClick={handleNext} disabled={!templateId}>
                Next
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 2: Select Client</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="client">Client *</Label>
                <Select id="client" value={clientId} onChange={(e) => setClientId(e.target.value)} required>
                  <option value="">Select a client</option>
                  {clients?.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.client_name} {client.company_name && `(${client.company_name})`}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button type="button" onClick={handleNext} disabled={!clientId}>
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 3: Instance Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Instance Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g., Black Friday Campaign 2025"
                />
              </div>
              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button type="button" onClick={handleNext} disabled={!name}>
                  Next
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Step 4: Assign Tasks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {templateTasks && templateTasks.length > 0 ? (
                <div className="space-y-4">
                  {templateTasks.map((task) => (
                    <div key={task.id} className="border-b border-gray-200 pb-4">
                      <h3 className="font-semibold mb-2">{task.name}</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Assign To *</Label>
                          <Select
                            value={assignments[task.id]?.assignee || ""}
                            onChange={(e) =>
                              setAssignments({
                                ...assignments,
                                [task.id]: {
                                  ...assignments[task.id],
                                  assignee: e.target.value,
                                },
                              })
                            }
                            required
                          >
                            <option value="">Select assignee</option>
                            {users
                              ?.filter((u) => ["member", "controller"].includes(u.role))
                              .map((user) => (
                                <option key={user.id} value={user.id}>
                                  {user.name} ({user.role})
                                </option>
                              ))}
                          </Select>
                        </div>
                        {task.requires_approval && (
                          <div>
                            <Label>Approver *</Label>
                            <Select
                              value={assignments[task.id]?.approver || ""}
                              onChange={(e) =>
                                setAssignments({
                                  ...assignments,
                                  [task.id]: {
                                    ...assignments[task.id],
                                    approver: e.target.value,
                                  },
                                })
                              }
                              required
                            >
                              <option value="">Select approver</option>
                              {users
                                ?.filter((u) => ["admin", "controller"].includes(u.role))
                                .map((user) => (
                                  <option key={user.id} value={user.id}>
                                    {user.name} ({user.role})
                                  </option>
                                ))}
                            </Select>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No tasks in template</p>
              )}
              <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => setStep(3)}>
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createInstance.isPending ||
                    !templateTasks?.every(
                      (task) =>
                        assignments[task.id]?.assignee &&
                        (!task.requires_approval || assignments[task.id]?.approver)
                    )
                  }
                >
                  {createInstance.isPending ? "Creating..." : "Create Instance"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </form>
    </div>
  );
}

