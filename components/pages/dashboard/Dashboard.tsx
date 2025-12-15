"use client";

import { useQuery } from "@tanstack/react-query";
import { useInstances } from "@/lib/hooks/use-instances";
import { useMyTasks } from "@/lib/hooks/use-tasks";
import { useUser } from "@/lib/hooks/use-user";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function Dashboard() {
  const supabase = createClient();
  const { data: user, isLoading: isUserLoading } = useUser();
  const {
    data: instances,
    isLoading: isInstancesLoading,
  } = useInstances();
  const {
    data: myTasks,
    isLoading: isTasksLoading,
  } = useMyTasks(user?.id || null);

  const { data: usersCount, isLoading: isUsersCountLoading } = useQuery({
    queryKey: ["users-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      if (error) throw error;
      return count ?? 0;
    },
  });

  const isLoading =
    isUserLoading ||
    isInstancesLoading ||
    isUsersCountLoading ||
    (user?.id ? isTasksLoading : false);

  const activeInstances = instances?.filter((i) => i.status === "active") || [];
  const pendingTasks =
    myTasks?.filter((t) => t.status === "pending" || t.status === "in_progress") || [];
  const recentTasks = myTasks?.slice(0, 5) || [];

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-sm text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div>
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
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usersCount ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-600">
            Recent Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentTasks.length > 0 ? (
            <div className="space-y-2 text-sm text-gray-700">
              {recentTasks.map((task: any) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">
                      {task.template_tasks?.name || "Task"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(task.process_instances as any)?.name || "Instance"}
                    </p>
                  </div>
                  <span className="text-xs capitalize px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                    {task.status.replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No recent tasks.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

