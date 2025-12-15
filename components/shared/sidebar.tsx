"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/lib/hooks/use-user";
import { cn } from "@/lib/utils/cn";
import {
  LayoutDashboard,
  FileText,
  PlayCircle,
  CheckSquare,
  Users,
  Building2,
  LogOut,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Templates", href: "/templates", icon: FileText },
  { name: "Instances", href: "/instances", icon: PlayCircle },
  { name: "My Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Approvals", href: "/approvals", icon: CheckSquare },
  { name: "Clients", href: "/clients", icon: Building2 },
  { name: "Users", href: "/users", icon: Users },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: user } = useUser();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  // Filter navigation based on role
  const filteredNav = navigation.filter((item) => {
    if (item.href === "/users" && user?.role !== "admin") return false;
    if (item.href === "/approvals" && !["admin", "controller"].includes(user?.role || "")) return false;
    return true;
  });

  return (
    <div className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white">
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <h1 className="text-xl font-semibold text-gray-900">FMS</h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {filteredNav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-gray-200 p-4">
        <div className="mb-2 px-3 text-sm text-gray-600">
          <div className="font-medium">{user?.name}</div>
          <div className="text-xs text-gray-500">{user?.role}</div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <LogOut className="h-5 w-5" />
          Sign out
        </button>
      </div>
    </div>
  );
}

