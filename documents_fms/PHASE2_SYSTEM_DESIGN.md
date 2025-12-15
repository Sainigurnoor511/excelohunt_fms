# PHASE 2: System Design

## 1. Next.js App Router Folder Structure

```
excelohunt_fms/
├── app/
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Dashboard layout with sidebar
│   │   ├── page.tsx                 # Dashboard home
│   │   ├── templates/
│   │   │   ├── page.tsx             # Template list
│   │   │   ├── new/
│   │   │   │   └── page.tsx         # Create template
│   │   │   └── [id]/
│   │   │       └── page.tsx         # Edit template
│   │   ├── instances/
│   │   │   ├── page.tsx             # Instance list
│   │   │   ├── new/
│   │   │   │   └── page.tsx         # Create instance
│   │   │   └── [id]/
│   │   │       └── page.tsx         # View instance details
│   │   ├── clients/
│   │   │   ├── page.tsx             # Client list
│   │   │   └── new/
│   │   │       └── page.tsx         # Create client
│   │   ├── tasks/
│   │   │   ├── page.tsx             # My tasks (Member view)
│   │   │   └── [id]/
│   │   │       └── page.tsx         # Task detail/execution
│   │   ├── approvals/
│   │   │   └── page.tsx             # Approval queue (Controller view)
│   │   └── users/
│   │       └── page.tsx             # User list (Admin view)
│   ├── api/
│   │   └── auth/
│   │       └── callback/
│   │           └── route.ts         # Supabase auth callback
│   ├── layout.tsx                   # Root layout
│   └── globals.css                  # Global styles
├── components/
│   ├── ui/                          # shadcn/ui components
│   ├── auth/
│   │   └── login-form.tsx
│   ├── dashboard/
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   └── stats-card.tsx
│   ├── templates/
│   │   ├── template-form.tsx
│   │   ├── template-list.tsx
│   │   ├── task-builder.tsx
│   │   └── task-item.tsx
│   ├── instances/
│   │   ├── instance-form.tsx
│   │   ├── instance-list.tsx
│   │   ├── assignment-form.tsx
│   │   └── instance-details.tsx
│   ├── tasks/
│   │   ├── task-card.tsx
│   │   ├── task-filters.tsx
│   │   ├── task-completion-form.tsx
│   │   └── checklist-item.tsx
│   ├── approvals/
│   │   ├── approval-queue.tsx
│   │   └── approval-review-dialog.tsx
│   └── clients/
│       ├── client-form.tsx
│       └── client-list.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts                # Supabase client
│   │   ├── server.ts                # Server-side client
│   │   └── middleware.ts            # Auth middleware
│   ├── hooks/
│   │   ├── use-templates.ts
│   │   ├── use-instances.ts
│   │   ├── use-tasks.ts
│   │   ├── use-clients.ts
│   │   ├── use-approvals.ts
│   │   └── use-realtime.ts
│   ├── utils/
│   │   ├── date-calculator.ts       # Due date calculations
│   │   ├── role-checker.ts          # Role-based permissions
│   │   └── cn.ts                    # Tailwind class merger
│   └── types/
│       └── database.ts               # Generated Supabase types
├── supabase/
│   ├── migrations/
│   │   └── 20250101000000_initial_schema.sql
│   └── seed.sql
├── public/
├── .env.example
├── .env.local
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

## 2. Supabase Schema (MVP)

### Core Tables

```sql
-- Users table (synced with Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'controller', 'member', 'bde')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clients
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name VARCHAR(255) NOT NULL,
  company_name VARCHAR(255),
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone_number VARCHAR(50),
  address TEXT,
  location VARCHAR(255),
  timezone VARCHAR(100) DEFAULT 'Asia/Kolkata',
  website VARCHAR(255),
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Process Templates
CREATE TABLE process_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  owner_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Template Tasks (ordered tasks within templates)
CREATE TABLE template_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES process_templates(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  "order" INTEGER NOT NULL,
  task_duration_minutes INTEGER DEFAULT 30,
  sla_hours INTEGER DEFAULT 24,
  requires_approval BOOLEAN DEFAULT false,
  default_role VARCHAR(50),
  checklist JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(template_id, "order")
);

-- Process Instances
CREATE TABLE process_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES process_templates(id),
  client_id UUID REFERENCES clients(id),
  name VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  current_task_index INTEGER DEFAULT 0,
  progress DECIMAL(5,2) DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Instance Task Statuses (task assignments and execution)
CREATE TABLE instance_task_statuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id UUID REFERENCES process_instances(id) ON DELETE CASCADE,
  template_task_id UUID REFERENCES template_tasks(id),
  assigned_to_user_id UUID REFERENCES users(id),
  approver_id UUID REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'not_started' 
    CHECK (status IN ('not_started', 'pending', 'in_progress', 'pending_approval', 'completed', 'rejected')),
  due_date TIMESTAMP WITH TIME ZONE,
  estimated_hours DECIMAL(5,2),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  checklist_values JSONB DEFAULT '[]'::jsonb,
  comments JSONB DEFAULT '[]'::jsonb,
  deliverable_link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(instance_id, template_task_id)
);

-- Indexes for performance
CREATE INDEX idx_users_auth_id ON users(auth_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_template_tasks_template_id ON template_tasks(template_id);
CREATE INDEX idx_instance_task_statuses_instance_id ON instance_task_statuses(instance_id);
CREATE INDEX idx_instance_task_statuses_assigned_to ON instance_task_statuses(assigned_to_user_id);
CREATE INDEX idx_instance_task_statuses_approver_id ON instance_task_statuses(approver_id);
CREATE INDEX idx_instance_task_statuses_status ON instance_task_statuses(status);
CREATE INDEX idx_process_instances_template_id ON process_instances(template_id);
CREATE INDEX idx_process_instances_client_id ON process_instances(client_id);
```

### Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE instance_task_statuses ENABLE ROW LEVEL SECURITY;

-- Users: All authenticated users can view, only admins can modify
CREATE POLICY "Users can view all active users" ON users
  FOR SELECT USING (auth.uid() IS NOT NULL AND is_active = true);

CREATE POLICY "Only admins can insert users" ON users
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role = 'admin')
  );

-- Clients: All authenticated users can view, controllers+ can modify
CREATE POLICY "Users can view all clients" ON clients
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Controllers+ can manage clients" ON clients
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_id = auth.uid() 
      AND role IN ('admin', 'controller', 'bde')
    )
  );

-- Templates: All can view, controllers+ can modify
CREATE POLICY "Users can view templates" ON process_templates
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Controllers+ can manage templates" ON process_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_id = auth.uid() 
      AND role IN ('admin', 'controller')
    )
  );

-- Instances: All can view, controllers+ can create
CREATE POLICY "Users can view instances" ON process_instances
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Controllers+ can manage instances" ON process_instances
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_id = auth.uid() 
      AND role IN ('admin', 'controller')
    )
  );

-- Task Statuses: Users can view their assigned tasks, controllers can view all
CREATE POLICY "Users can view assigned tasks" ON instance_task_statuses
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND (
      assigned_to_user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
      OR approver_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
      OR EXISTS (
        SELECT 1 FROM users 
        WHERE auth_id = auth.uid() 
        AND role IN ('admin', 'controller')
      )
    )
  );

CREATE POLICY "Users can update their tasks" ON instance_task_statuses
  FOR UPDATE USING (
    assigned_to_user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "Controllers+ can assign tasks" ON instance_task_statuses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_id = auth.uid() 
      AND role IN ('admin', 'controller')
    )
  );
```

## 3. Auth + Role Handling Strategy

### Authentication Flow
1. User logs in via Supabase Auth (email/password)
2. On successful login, Supabase returns session with JWT
3. Client-side: Store session in React Query cache
4. Server-side: Validate session via Supabase server client
5. Middleware: Protect routes based on authentication

### Role Handling
- Roles stored in `users` table, synced with `auth.users`
- Role checked via helper functions:
  - `getUserRole(userId)` - Fetch role from database
  - `hasRole(userId, requiredRole)` - Check if user has required role
  - `canAccess(userId, resource, action)` - Check permissions
- Protected routes use middleware to check auth + role
- UI components conditionally render based on role

### Session Management
- Use Supabase client-side session management
- Auto-refresh handled by Supabase SDK
- Logout clears session and redirects to login

## 4. Data Fetching Strategy (React Query)

### Query Hooks Pattern
```typescript
// Example: use-templates.ts
export function useTemplates() {
  return useQuery({
    queryKey: ['templates'],
    queryFn: () => fetchTemplates(),
  });
}

export function useTemplate(id: string) {
  return useQuery({
    queryKey: ['templates', id],
    queryFn: () => fetchTemplate(id),
    enabled: !!id,
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
  });
}
```

### Real-time Integration
- Use Supabase Realtime subscriptions
- On change event, invalidate relevant React Query cache
- React Query refetches automatically
- UI updates seamlessly

### Optimistic Updates
- For status changes (task completion, approval)
- Update UI immediately
- Rollback on error

## 5. Minimal Real-time Usage

### Subscriptions
1. **Task Status Changes**: Subscribe to `instance_task_statuses` table
   - Filter by `assigned_to_user_id` or `approver_id`
   - Update React Query cache on change
   - Show toast notification

2. **Instance Progress**: Subscribe to `process_instances` table
   - Update progress bars in real-time
   - Show live badge indicator

### Implementation
- Custom hook: `useRealtimeTaskUpdates(userId)`
- Cleanup subscriptions on unmount
- Handle connection state (show "Live" badge when connected)

---

**Next Steps**: Proceed to PHASE 3 (Implementation)

