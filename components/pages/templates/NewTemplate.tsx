"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { useCreateTemplate, useCreateTemplateTask } from "@/lib/hooks/use-templates";
import { useUser } from "@/lib/hooks/use-user";
import type { ChecklistItem } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TaskForm {
  name: string;
  description: string;
  order: number;
  task_duration_minutes: number;
  sla_hours: number;
  requires_approval: boolean;
  checklist: ChecklistItem[];
}

export function NewTemplate() {
  const router = useRouter();
  const { data: user } = useUser();
  const createTemplate = useCreateTemplate();
  const createTask = useCreateTemplateTask();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [tasks, setTasks] = useState<TaskForm[]>([]);

  const addTask = () => {
    setTasks([
      ...tasks,
      {
        name: "",
        description: "",
        order: tasks.length,
        task_duration_minutes: 30,
        sla_hours: 24,
        requires_approval: false,
        checklist: [],
      },
    ]);
  };

  const removeTask = (index: number) => {
    const newTasks = tasks.filter((_, i) => i !== index).map((t, i) => ({ ...t, order: i }));
    setTasks(newTasks);
  };

  const moveTask = (index: number, direction: "up" | "down") => {
    if ((direction === "up" && index === 0) || (direction === "down" && index === tasks.length - 1)) {
      return;
    }

    const newTasks = [...tasks];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newTasks[index], newTasks[targetIndex]] = [newTasks[targetIndex], newTasks[index]];
    newTasks.forEach((t, i) => (t.order = i));
    setTasks(newTasks);
  };

  const updateTask = (index: number, field: keyof TaskForm, value: any) => {
    const newTasks = [...tasks];
    (newTasks[index] as any)[field] = value;
    setTasks(newTasks);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert("Please sign in to create a template.");
      return;
    }

    // Check if user has permission
    if (!["admin", "controller"].includes(user.role)) {
      alert(
        `You don't have permission to create templates. Your role is '${user.role}'. ` +
          "You need 'controller' or 'admin' role. Please contact an administrator."
      );
      return;
    }

    try {
      // Create template
      const template = await createTemplate.mutateAsync({
        name,
        category: category || undefined,
        description: description || undefined,
        owner_id: user.id,
      });

      // Create tasks
      for (const task of tasks) {
        await createTask.mutateAsync({
          template_id: template.id,
          name: task.name,
          description: task.description || undefined,
          order: task.order,
          task_duration_minutes: task.task_duration_minutes,
          sla_hours: task.sla_hours,
          requires_approval: task.requires_approval,
          checklist: task.checklist,
        });
      }

      router.push(`/templates/${template.id}`);
    } catch (error: any) {
      console.error("Failed to create template:", error);
      const errorMessage = error?.message || error?.error?.message || JSON.stringify(error) || "Unknown error";
      console.error("Full error details:", {
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code,
        error: error?.error,
      });
      alert(`Failed to create template: ${errorMessage}`);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create Template</h1>
        <p className="mt-2 text-gray-600">Define a new workflow template</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Template Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Template Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g., Email Campaign Workflow"
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Email Marketing"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                placeholder="Describe the workflow..."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Tasks</CardTitle>
              <Button type="button" onClick={addTask} variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {tasks.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No tasks yet. Click "Add Task" to get started.
              </p>
            ) : (
              tasks.map((task, index) => (
                <Card key={index} className="border-gray-200">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-500">Task {index + 1}</span>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => moveTask(index, "up")}
                            disabled={index === 0}
                            className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                          >
                            <ArrowUp className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveTask(index, "down")}
                            disabled={index === tasks.length - 1}
                            className="p-1 hover:bg-gray-100 rounded disabled:opacity-50"
                          >
                            <ArrowDown className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <Button type="button" onClick={() => removeTask(index)} variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div>
                      <Label>Task Name *</Label>
                      <Input
                        value={task.name}
                        onChange={(e) => updateTask(index, "name", e.target.value)}
                        required
                        placeholder="e.g., Content Writing"
                      />
                    </div>

                    <div>
                      <Label>Description</Label>
                      <textarea
                        value={task.description}
                        onChange={(e) => updateTask(index, "description", e.target.value)}
                        className="flex min-h-[60px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                        placeholder="Task description..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Duration (minutes) *</Label>
                        <Input
                          type="number"
                          value={task.task_duration_minutes}
                          onChange={(e) => updateTask(index, "task_duration_minutes", parseInt(e.target.value))}
                          required
                          min="1"
                        />
                      </div>
                      <div>
                        <Label>SLA (hours) *</Label>
                        <Input
                          type="number"
                          value={task.sla_hours}
                          onChange={(e) => updateTask(index, "sla_hours", parseInt(e.target.value))}
                          required
                          min="1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`approval-${index}`}
                        checked={task.requires_approval}
                        onChange={(e) => updateTask(index, "requires_approval", e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <Label htmlFor={`approval-${index}`} className="cursor-pointer">
                        Requires approval
                      </Label>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        </Card>

        <div className="mt-6 flex gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={createTemplate.isPending || tasks.length === 0}>
            {createTemplate.isPending ? "Creating..." : "Create Template"}
          </Button>
        </div>
      </form>
    </div>
  );
}

