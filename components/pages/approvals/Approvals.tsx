"use client";

import { useState } from "react";
import { useUser } from "@/lib/hooks/use-user";
import { usePendingApprovals, useUpdateTaskStatus } from "@/lib/hooks/use-tasks";
import { formatDate } from "@/lib/utils/date-calculator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function Approvals() {
  const { data: user } = useUser();
  const { data: approvals, isLoading } = usePendingApprovals(user?.id || null);
  const updateTaskStatus = useUpdateTaskStatus();
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");

  const handleApprove = async (taskId: string) => {
    try {
      await updateTaskStatus.mutateAsync({
        taskId,
        status: "completed",
      });
      setSelectedTask(null);
      setFeedback("");
    } catch (error) {
      console.error("Failed to approve task:", error);
      alert("Failed to approve task. Please try again.");
    }
  };

  const handleReject = async (taskId: string) => {
    if (!feedback.trim()) {
      alert("Please provide feedback for rejection.");
      return;
    }

    try {
      const comments = [
        {
          id: crypto.randomUUID(),
          user_id: user?.id || "",
          user_name: user?.name || "",
          text: feedback,
          created_at: new Date().toISOString(),
        },
      ];

      await updateTaskStatus.mutateAsync({
        taskId,
        status: "rejected",
        comments,
      });
      setSelectedTask(null);
      setFeedback("");
    } catch (error) {
      console.error("Failed to reject task:", error);
      alert("Failed to reject task. Please try again.");
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pending Approvals</h1>
        <p className="mt-2 text-gray-600">Tasks waiting for your approval</p>
      </div>

      {approvals && approvals.length > 0 ? (
        <div className="space-y-4">
          {approvals.map((task: any) => {
            const instance = task.process_instances;
            const client = instance?.clients;
            const templateTask = task.template_tasks;
            const assignedUser = task.assigned_user;

            return (
              <Card key={task.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{templateTask?.name || "Task"}</CardTitle>
                    <Badge variant="warning">Pending Approval</Badge>
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
                    {assignedUser && (
                      <p>
                        <span className="font-medium">Assigned to:</span> {assignedUser.name}
                      </p>
                    )}
                    {task.completed_at && (
                      <p>
                        <span className="font-medium">Submitted:</span> {formatDate(task.completed_at)}
                      </p>
                    )}
                  </div>

                  {task.checklist_values && task.checklist_values.length > 0 && (
                    <div className="mt-4">
                      <p className="font-medium text-sm mb-2">Checklist:</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                        {task.checklist_values.map((cv: any, idx: number) => (
                          <li key={idx}>
                            {cv.checked ? "✓" : "✗"} {cv.text || `Item ${idx + 1}`}
                            {cv.inputValue && ` - ${cv.inputValue}`}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {task.comments && task.comments.length > 0 && (
                    <div className="mt-4">
                      <p className="font-medium text-sm mb-2">Comments:</p>
                      {task.comments.map((comment: any) => (
                        <p key={comment.id} className="text-sm text-gray-600">
                          {comment.user_name}: {comment.text}
                        </p>
                      ))}
                    </div>
                  )}

                  {task.deliverable_link && (
                    <div className="mt-4">
                      <p className="font-medium text-sm mb-2">Deliverable:</p>
                      <a
                        href={task.deliverable_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        {task.deliverable_link}
                      </a>
                    </div>
                  )}

                  {selectedTask === task.id ? (
                    <div className="mt-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Feedback (required for rejection)
                        </label>
                        <textarea
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          className="flex min-h-[100px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                          placeholder="Add feedback..."
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => handleApprove(task.id)} disabled={updateTaskStatus.isPending}>
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleReject(task.id)}
                          disabled={updateTaskStatus.isPending}
                        >
                          Reject
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedTask(null);
                            setFeedback("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 flex gap-2">
                      <Button onClick={() => setSelectedTask(task.id)}>Review & Approve/Reject</Button>
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
            <p className="text-gray-500">No pending approvals.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

