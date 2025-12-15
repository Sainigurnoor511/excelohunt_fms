"use client";

import { useParams } from "next/navigation";
import { useTemplate, useTemplateTasks } from "@/lib/hooks/use-templates";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TemplateDetail() {
  const params = useParams<{ id: string }>();
  const id = params?.id?.toString() || "";

  const { data: template, isLoading: templateLoading } = useTemplate(id);
  const { data: tasks, isLoading: tasksLoading } = useTemplateTasks(id);

  if (templateLoading || tasksLoading) {
    return <div className="p-8">Loading...</div>;
  }

  if (!template) {
    return <div className="p-8">Template not found</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{template.name}</h1>
        <div className="mt-2 flex items-center gap-4">
          {template.category && <span className="text-gray-600">Category: {template.category}</span>}
          <Badge variant={template.is_active ? "success" : "secondary"}>
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
                        <Badge variant="warning" className="text-xs">
                          Requires Approval
                        </Badge>
                      )}
                    </div>
                  </div>
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

