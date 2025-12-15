"use client";

import { useParams } from "next/navigation";
import { useTemplate, useTemplateTasks, useDeleteTemplateTask } from "@/lib/hooks/use-templates";
import { useUser } from "@/lib/hooks/use-user";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";

export function TemplateDetail() {
  const params = useParams<{ id: string }>();
  const id = params?.id?.toString() || "";

  const { data: template, isLoading: templateLoading } = useTemplate(id);
  const { data: tasks, isLoading: tasksLoading } = useTemplateTasks(id);
  const { data: user } = useUser();
  const deleteTask = useDeleteTemplateTask();

  const canManageTasks = user && ["admin", "controller"].includes(user.role);

  if (templateLoading || tasksLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!template) {
    return <div className="p-8">Template not found</div>;
  }

  const handleDeleteTask = (taskId: string) => {
    if (!id || !canManageTasks) return;
    const confirmed = window.confirm("Are you sure you want to delete this task from the template?");
    if (!confirmed) return;

    deleteTask.mutate({ id: taskId, template_id: id });
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{template.name}</h1>
        <div className="mt-2 flex items-center gap-4">
          {template.category && <span className="text-gray-600">Category: {template.category}</span>}
          <Badge variant={template.is_active ? "default" : "secondary"}>
            {template.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>
      </div>

      {template.description && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{template.description}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Tasks ({tasks?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {tasks && tasks.length > 0 ? (
            <div className="space-y-4">
              {tasks.map((task, index) => (
                <div
                  key={task.id}
                  className="flex items-start justify-between border-b border-gray-200 pb-4 last:border-0"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-semibold">
                        {index + 1}
                      </span>
                      <div>
                        <h3 className="font-semibold text-gray-900">{task.name}</h3>
                        {task.description && (
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 ml-11 flex flex-wrap gap-4 text-sm text-gray-600">
                      <span>Duration: {task.task_duration_minutes} min</span>
                      <span>SLA: {task.sla_hours} hours</span>
                      {task.requires_approval && (
                        <Badge variant="secondary" className="text-xs">
                          Requires Approval
                        </Badge>
                      )}
                    </div>
                  </div>
                  {canManageTasks && (
                    <div className="ml-4">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDeleteTask(task.id)}
                        disabled={deleteTask.isPending}
                        aria-label="Delete task"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No tasks defined</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

