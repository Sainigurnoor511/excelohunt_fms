"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useTemplates } from "@/lib/hooks/use-templates";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function Templates() {
  const { data: templates, isLoading, refetch } = useTemplates();
  const router = useRouter();
  const supabase = createClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Delete this template? It will be marked as deleted.");
    if (!confirmDelete) return;
    setDeletingId(id);
    try {
      // @ts-ignore
      const { error } = await supabase.from("process_templates").update({ is_deleted: true }).eq("id", id);
      if (error) throw error;
      await refetch();
      toast.success("Template deleted");
    } catch (err) {
      console.error("Failed to delete template", err);
      toast.error("Failed to delete template");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Templates</h1>
          <p className="mt-2 text-gray-600">Manage workflow templates</p>
        </div>
        <Link href="/templates/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : templates && templates.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card
              key={template.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/templates/${template.id}`)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{template.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant={template.is_active ? "default" : "secondary"}>
                      {template.is_active ? "Active" : "Inactive"}
                    </Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(template.id);
                      }}
                      disabled={deletingId === template.id}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {template.category && (
                  <p className="text-sm text-gray-500 mb-2">Category: {template.category}</p>
                )}
                {template.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {template.description}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No templates found. Create your first template to get started.</p>
            <Link href="/templates/new">
              <Button className="mt-4">Create Template</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

