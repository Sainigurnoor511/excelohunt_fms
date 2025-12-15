# Flow Management System (FMS)

A web-based workflow automation platform for managing email marketing operations, task assignments, and team performance tracking.

## 🚀 Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict mode)
- **UI**: React 18+, Tailwind CSS, shadcn/ui components
- **State Management**: TanStack React Query
- **Backend/Database**: Supabase (PostgreSQL + Auth + Real-time)
- **Deployment**: Vercel-ready

## 📋 Features (MVP)

### ✅ Implemented

- **Authentication & User Management**
  - Email/password login via Supabase Auth
  - Role-based access control (Admin, Controller, Member, BDE)
  - Session management with auto-refresh
  - Protected routes based on roles

- **Client Management**
  - CRUD operations for clients
  - Client list with search/filter
  - Active/Inactive status

- **Template Management**
  - Create/edit workflow templates
  - Add/remove/reorder tasks within templates
  - Task configuration (name, description, duration, SLA, approval flag)
  - Basic checklist support
  - Template list view with status

- **Instance Management**
  - Create instances from templates
  - Select client for instance
  - Assign team members to tasks
  - Assign approvers for tasks requiring approval
  - Calculate due dates (working days only)
  - Instance list view with progress tracking

- **Task Execution (Member View)**
  - View assigned tasks with filters
  - Task cards with due dates and time remaining
  - Complete task workflow:
    - Fill checklist items
    - Add comments/deliverable links
    - Submit for approval or mark complete
  - Status updates (not_started → pending → in_progress → pending_approval → completed)

- **Approval Workflow (Controller View)**
  - View tasks pending approval
  - Review completed work (checklist, comments, deliverables)
  - Approve or reject with comments
  - Status transitions on approval/rejection

- **Basic Real-time**
  - Supabase Realtime subscriptions for task status changes
  - Live badge indicator
  - Toast notifications for updates

### ⚠️ Stubbed/Skipped (Post-MVP)

- **Manual Tasks**: Table exists in schema, but no UI/functionality
- **Holidays & Business Calendar**: Schema exists, but due dates calculated without holiday consideration (Mon-Fri only)
- **Performance Metrics Dashboard**: Basic instance/task counts only, no detailed metrics
- **Advanced Notifications**: Toast notifications only, no sounds/browser push
- **User Management UI (Admin)**: Basic user list, no full CRUD UI
- **BDE Role Specific Features**: BDE role exists but uses same UI as other roles

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project

### 1. Clone and Install

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the migration file:
   ```sql
   -- Run: supabase/migrations/20250101000000_initial_schema.sql
   ```
3. Get your Supabase URL and anon key from Project Settings → API

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Create Initial User

1. Go to Supabase Dashboard → Authentication → Users
2. Create a new user manually or via the Auth UI
3. Go to SQL Editor and run:

```sql
-- Replace 'user-email@example.com' and 'user-uuid-from-auth' with actual values
INSERT INTO users (auth_id, email, name, role, is_active)
VALUES (
  'user-uuid-from-auth',
  'user-email@example.com',
  'Admin User',
  'admin',
  true
);
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
excelohunt_fms/
├── app/
│   ├── (auth)/              # Auth routes
│   │   └── login/
│   ├── (dashboard)/         # Dashboard routes (protected)
│   │   ├── templates/       # Template management
│   │   ├── instances/       # Instance management
│   │   ├── tasks/           # Task execution
│   │   ├── approvals/       # Approval workflow
│   │   ├── clients/         # Client management
│   │   └── users/           # User management
│   ├── api/                 # API routes
│   └── providers.tsx        # React Query provider
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── dashboard/           # Dashboard components
│   └── ...                  # Feature components
├── lib/
│   ├── supabase/            # Supabase client setup
│   ├── hooks/               # React Query hooks
│   ├── utils/               # Utility functions
│   └── types/               # TypeScript types
├── supabase/
│   └── migrations/          # Database migrations
└── documents_fms/            # SRS and design documents
```

## 🔐 Role Permissions

- **Admin**: Full access to all features
- **Controller**: Can create templates, instances, assign tasks, approve work
- **Member**: Can view and execute assigned tasks
- **BDE**: Can manage clients (onboarding)

## 🗄️ Database Schema

The database includes the following core tables:

- `users` - User accounts synced with Supabase Auth
- `clients` - Client information
- `process_templates` - Workflow templates
- `template_tasks` - Tasks within templates
- `process_instances` - Workflow instances
- `instance_task_statuses` - Task assignments and execution status

See `supabase/migrations/20250101000000_initial_schema.sql` for the complete schema.

## 🚢 Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

### Supabase Configuration

Update your Supabase project settings:
- Go to Authentication → URL Configuration
- Add your Vercel domain to "Redirect URLs"
- Add `https://your-domain.vercel.app/api/auth/callback` to allowed redirect URLs

## 📝 Development Notes

### Type Safety

- All database types are defined in `lib/types/database.ts`
- Supabase types are in `lib/supabase/types.ts`
- Strict TypeScript mode enabled

### Data Fetching

- Uses TanStack React Query for all data fetching
- Custom hooks in `lib/hooks/` for each resource
- Automatic cache invalidation on mutations

### Component Structure

- Reusable UI components in `components/ui/`
- Feature-specific components in respective folders
- Server components where possible, client components when needed

## 🔄 Next Steps / Extensions

### Phase 2 Enhancements

1. **Manual Tasks**
   - Create ad-hoc tasks UI
   - Independent task tracking
   - Priority management

2. **Holidays & Business Calendar**
   - Holiday management UI
   - Working days configuration
   - Enhanced due date calculations

3. **Performance Metrics**
   - Team performance dashboard
   - SLA tracking and reporting
   - Task completion analytics

4. **Advanced Notifications**
   - Browser push notifications
   - Sound alerts
   - Email notifications

5. **User Management**
   - Full CRUD UI for users
   - Role assignment interface
   - Password reset flow

6. **Real-time Enhancements**
   - Live progress updates
   - Real-time collaboration features
   - Activity feed

## 🐛 Known Issues / Limitations

- Due date calculations don't account for holidays (Mon-Fri only)
- No manual task creation UI
- Basic user management (list only)
- No performance metrics dashboard
- Toast notifications only (no sounds/push)

## 📄 License

This project is built for evaluation purposes.

## 👤 Author

Built as a 72-hour practical evaluation prototype for a Full-Stack + AI role.

---

**Note**: This is a Day-1/Week-1 foundation. It demonstrates correct architecture, sensible data modeling, clean folder structure, and realistic UI flows. The system is designed to be extended incrementally.
