"use client";

import Link from "next/link";
import { useUser } from "@/lib/hooks/use-user";
import { useMyTasks, useUpdateTaskStatus } from "@/lib/hooks/use-tasks";
import { formatDate, getTimeRemaining } from "@/lib/utils/date-calculator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function Tasks() {
  const { data: user } = useUser();
  const { data: tasks, isLoading } = useMyTasks(user?.id || null);
  const updateTaskStatus = useUpdateTaskStatus();

  const handleStartTask = async (taskId: string) => {
    try {
      await updateTaskStatus.mutateAsync({
        taskId,
        status: "in_progress",
      });
    } catch (error) {
      console.error("Failed to start task:", error);
      alert("Failed to start task. Please try again.");
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Tasks</h1>
        <p className="mt-2 text-gray-600">Tasks assigned to you</p>
      </div>

      {tasks && tasks.length > 0 ? (
        <div className="space-y-4">
          {tasks.map((task: any) => {
            const instance = task.process_instances;
            const client = instance?.clients;
            const templateTask = task.template_tasks;
            const timeRemaining = task.due_date ? getTimeRemaining(new Date(task.due_date)) : null;

            const isCompleted = task.status === "completed";

            return (
              <Card key={task.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{templateTask?.name || "Task"}</CardTitle>
                    <Badge
                      variant={
                        task.status === "completed"
                          ? "default"
                          : task.status === "pending_approval"
                          ? "secondary"
                          : task.status === "in_progress"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {task.status.replace("_", " ")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    {instance && (
                      <p>
                        <span className="font-medium">Instance:</span> {instance.name}
                      </p>
                    )}
                    {client && (
                      <p>
                        <span className="font-medium">Client:</span> {client.client_name}
                        {client.company_name && ` (${client.company_name})`}
                      </p>
                    )}
                    {task.due_date && (
                      <p>
                        <span className="font-medium">Due:</span> {formatDate(task.due_date)}
                        {timeRemaining && (
                          <span
                            className={`ml-2 ${
                              timeRemaining.isOverdue && !isCompleted ? "text-red-600 font-semibold" : ""
                            }`}
                          >
                            {timeRemaining.formatted}
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                  {templateTask?.description && (
                    <p className="mt-3 text-sm text-gray-700">{templateTask.description}</p>
                  )}
                  {!isCompleted && (
                    <div className="mt-4 flex gap-2">
                      {task.status === "pending" && (
                        <Button onClick={() => handleStartTask(task.id)} disabled={updateTaskStatus.isPending}>
                          Start Task
                        </Button>
                      )}
                      {task.status === "in_progress" && (
                        <Link href={`/tasks/${task.id}`}>
                          <Button>Complete Task</Button>
                        </Link>
                      )}
                      {task.status === "pending_approval" && (
                        <span className="text-sm text-gray-600">Waiting for approval</span>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No tasks assigned to you.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

