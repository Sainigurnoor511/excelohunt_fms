"use client";

import { useInstances } from "@/lib/hooks/use-instances";
import { useMyTasks } from "@/lib/hooks/use-tasks";
import { useUser } from "@/lib/hooks/use-user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function Dashboard() {
  const { data: user } = useUser();
  const { data: instances } = useInstances();
  const { data: myTasks } = useMyTasks(user?.id || null);

  const activeInstances = instances?.filter((i) => i.status === "active") || [];
  const pendingTasks =
    myTasks?.filter((t) => t.status === "pending" || t.status === "in_progress") || [];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Welcome back, {user?.name}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Instances
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeInstances.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              My Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Instances
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{instances?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              Role
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{user?.role}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

