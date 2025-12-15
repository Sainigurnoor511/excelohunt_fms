"use client";

import { useParams } from "next/navigation";
import { useInstance, useInstanceTasks } from "@/lib/hooks/use-instances";
import { formatDate, getTimeRemaining } from "@/lib/utils/date-calculator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function InstanceDetail() {
  const params = useParams<{ id: string }>();
  const id = params?.id?.toString() || "";

  const { data: instance, isLoading: instanceLoading } = useInstance(id);
  const { data: tasks, isLoading: tasksLoading } = useInstanceTasks(id);

  if (instanceLoading || tasksLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!instance) {
    return <div className="p-8">Instance not found</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{instance.name}</h1>
        <div className="mt-2 flex items-center gap-4">
          <Badge
            variant={
              instance.status === "active"
                ? "success"
                : instance.status === "completed"
                ? "default"
                : "secondary"
            }
          >
            {instance.status}
          </Badge>
          <span className="text-gray-600">Progress: {instance.progress}%</span>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          {tasks && tasks.length > 0 ? (
            <div className="space-y-4">
              {tasks.map((task: any, index: number) => {
                const templateTask = task.template_tasks;
                const timeRemaining = task.due_date ? getTimeRemaining(new Date(task.due_date)) : null;

                return (
                  <div
                    key={task.id}
                    className="flex items-start justify-between border-b border-gray-200 pb-4 last:border-0"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">{templateTask?.name || "Task"}</h3>
                            <Badge
                              variant={
                                task.status === "completed"
                                  ? "success"
                                  : task.status === "pending_approval"
                                  ? "warning"
                                  : task.status === "in_progress"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {task.status.replace("_", " ")}
                            </Badge>
                          </div>
                          {templateTask?.description && (
                            <p className="text-sm text-gray-600 mt-1">{templateTask.description}</p>
                          )}
                          <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                            {task.assigned_to_user_id && <span>Assigned to: {task.assigned_to_user_id}</span>}
                            {task.due_date && (
                              <span>
                                Due: {formatDate(task.due_date)}
                                {timeRemaining && (
                                  <span
                                    className={`ml-2 ${timeRemaining.isOverdue ? "text-red-600 font-semibold" : ""}`}
                                  >
                                    ({timeRemaining.formatted})
                                  </span>
                                )}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No tasks found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

