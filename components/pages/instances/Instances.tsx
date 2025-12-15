"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { useInstances } from "@/lib/hooks/use-instances";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function Instances() {
  const { data: instances, isLoading, refetch } = useInstances();
  const router = useRouter();
  const supabase = createClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Delete this instance? It will be marked as deleted.");
    if (!confirmDelete) return;
    setDeletingId(id);
    try {
      const { error } = await supabase.from("process_instances").update({ is_deleted: true }).eq("id", id);
      if (error) throw error;
      await refetch();
    } catch (err) {
      console.error("Failed to delete instance", err);
      alert("Failed to delete instance.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Instances</h1>
          <p className="mt-2 text-gray-600">Manage workflow instances</p>
        </div>
        <Link href="/instances/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Instance
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : instances && instances.length > 0 ? (
        <div className="flex flex-col gap-4">
          {instances.map((instance) => (
            <Card
              key={instance.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/instances/${instance.id}`)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{instance.name}</CardTitle>
                  <div className="flex items-center gap-2">
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
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(instance.id);
                      }}
                      disabled={deletingId === instance.id}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Progress: {instance.progress}%</span>
                  <span>Current Task: {instance.current_task_index + 1}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No instances found. Create your first instance to get started.</p>
            <Link href="/instances/new">
              <Button className="mt-4">Create Instance</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

