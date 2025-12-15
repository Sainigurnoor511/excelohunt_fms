"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { useClients } from "@/lib/hooks/use-clients";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function Clients() {
  const { data: clients, isLoading, refetch } = useClients();
  const supabase = createClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("Delete this client? It will be marked as deleted.");
    if (!confirmDelete) return;
    setDeletingId(id);
    try {
      const { error } = await supabase.from("clients").update({ is_deleted: true }).eq("id", id);
      if (error) throw error;
      await refetch();
    } catch (err) {
      console.error("Failed to delete client", err);
      alert("Failed to delete client.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clients</h1>
          <p className="mt-2 text-gray-600">Manage clients</p>
        </div>
        <Link href="/clients/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Client
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-12">Loading...</div>
      ) : clients && clients.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <Card key={client.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{client.client_name}</CardTitle>
                    {client.company_name && <p className="text-sm text-gray-600">{client.company_name}</p>}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(client.id)}
                    disabled={deletingId === client.id}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm text-gray-600">
                  {client.contact_person && <p>Contact: {client.contact_person}</p>}
                  {client.email && <p>Email: {client.email}</p>}
                  {client.phone_number && <p>Phone: {client.phone_number}</p>}
                </div>
                <Badge variant={client.is_active ? "success" : "secondary"} className="mt-4">
                  {client.is_active ? "Active" : "Inactive"}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No clients found. Create your first client to get started.</p>
            <Link href="/clients/new">
              <Button className="mt-4">Create Client</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

