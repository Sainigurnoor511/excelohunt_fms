export type UserRole = "admin" | "controller" | "member" | "bde";

/**
 * Check if user has required role
 */
export function hasRole(userRole: UserRole | null, requiredRole: UserRole): boolean {
  if (!userRole) return false;
  
  const roleHierarchy: Record<UserRole, number> = {
    admin: 4,
    controller: 3,
    bde: 2,
    member: 1,
  };
  
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

/**
 * Check if user can perform action
 */
export function canAccess(
  userRole: UserRole | null,
  resource: string,
  action: string
): boolean {
  if (!userRole) return false;
  
  // Admin has full access
  if (userRole === "admin") return true;
  
  // Controller permissions
  if (userRole === "controller") {
    if (resource === "templates" && ["view", "create", "edit"].includes(action)) return true;
    if (resource === "instances" && ["view", "create", "edit", "assign"].includes(action)) return true;
    if (resource === "clients" && ["view", "create", "edit"].includes(action)) return true;
    if (resource === "approvals" && ["view", "approve", "reject"].includes(action)) return true;
    if (resource === "tasks" && ["view"].includes(action)) return true;
  }
  
  // Member permissions
  if (userRole === "member") {
    if (resource === "tasks" && ["view", "execute", "complete"].includes(action)) return true;
    if (resource === "instances" && ["view"].includes(action)) return true;
    if (resource === "templates" && ["view"].includes(action)) return true;
  }
  
  // BDE permissions
  if (userRole === "bde") {
    if (resource === "clients" && ["view", "create", "edit"].includes(action)) return true;
    if (resource === "instances" && ["view"].includes(action)) return true;
  }
  
  return false;
}

