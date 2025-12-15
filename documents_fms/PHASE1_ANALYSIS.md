# PHASE 1: SRS Analysis & MVP Planning

## 1. SRS Summary

The Flow Management System (FMS) is a role-based workflow automation platform for managing email marketing operations. The system enables organizations to:

- **Create reusable workflow templates** with sequential, ordered tasks
- **Spawn process instances** from templates for specific clients/campaigns
- **Assign tasks** to team members with SLA tracking and due date calculations
- **Track real-time progress** with status updates and notifications
- **Manage approvals** through a controller review workflow
- **Monitor team performance** with metrics and reporting

The system uses a 4-tier role hierarchy: **Admin** (full access) → **Controller** (team manager, approvals) → **Member** (task execution) → **BDE** (client onboarding). Each role has specific permissions for user management, client management, template management, task assignment, execution, and approvals.

## 2. Core Entities for MVP

For a credible Day-1/Week-1 foundation, we need these core entities:

### Essential Entities (MVP):
1. **Users** - Authentication, roles (admin, controller, member, bde)
2. **Clients** - Client information for instances
3. **Process Templates** - Reusable workflow definitions
4. **Template Tasks** - Ordered tasks within templates
5. **Process Instances** - Specific executions of templates for clients
6. **Instance Task Statuses** - Task assignments, status tracking, due dates

### Deferred Entities (Post-MVP):
- Manual Tasks (can be added later)
- Holidays & Company Settings (can use simple defaults initially)
- Performance Metrics (can be calculated on-the-fly for MVP)

## 3. MVP Feature Scope

### ✅ WILL BE IMPLEMENTED:

#### Authentication & User Management
- Email/password login via Supabase Auth
- Role-based access control (4 roles)
- Session management
- Basic user profile display
- Protected routes based on roles

#### Client Management
- CRUD operations for clients
- Client list with search/filter
- Active/Inactive status

#### Template Management
- Create/edit workflow templates
- Add/remove/reorder tasks within templates
- Task configuration (name, description, duration, SLA, approval flag)
- Basic checklist support (simple JSON structure)
- Template list view with status

#### Instance Management
- Create instances from templates
- Select client for instance
- Assign team members to tasks
- Assign approvers for tasks requiring approval
- Calculate due dates (simplified: working days only, no holidays initially)
- Instance list view with progress tracking

#### Task Execution (Member View)
- View assigned tasks with filters (status, date range)
- Task cards with due dates and time remaining
- Complete task workflow:
  - Fill checklist items
  - Add comments/deliverable links
  - Submit for approval or mark complete
- Status updates (not_started → pending → in_progress → pending_approval → completed)

#### Approval Workflow (Controller View)
- View tasks pending approval
- Review completed work (checklist, comments, deliverables)
- Approve or reject with comments
- Status transitions on approval/rejection

#### Basic Real-time
- Supabase Realtime subscriptions for task status changes
- Live badge indicator
- Toast notifications for updates

### ⚠️ WILL BE STUBBED/SKIPPED:

#### Manual Tasks
- **Why**: Not core to the workflow engine. Can be added as Phase 2.
- **Stub**: Table exists in schema, but no UI/functionality

#### Holidays & Business Calendar
- **Why**: Complex date calculation logic. For MVP, use simple working days (Mon-Fri).
- **Stub**: Schema exists, but due dates calculated without holiday consideration

#### Performance Metrics Dashboard
- **Why**: Analytics can be built after core flows work. Not blocking.
- **Stub**: Basic instance/task counts only, no detailed metrics

#### Advanced Notifications
- **Why**: Sound alerts and browser push require additional setup.
- **Stub**: Toast notifications only, no sounds/browser push

#### User Management UI (Admin)
- **Why**: Can use Supabase dashboard initially. Focus on core workflow.
- **Stub**: Basic user list, no full CRUD UI

#### BDE Role Specific Features
- **Why**: Client onboarding can be handled through regular client management.
- **Stub**: BDE role exists but uses same UI as other roles

### 🎯 Trade-off Rationale:

1. **Focus on Core Flow**: Template → Instance → Task Assignment → Execution → Approval
   - This demonstrates the entire workflow engine
   - Everything else is peripheral

2. **Realistic 72-Hour Scope**: 
   - One complete vertical flow is achievable
   - Adding all features would result in incomplete/buggy code

3. **Foundation First**:
   - Get architecture right
   - Get data model right
   - Get one flow working perfectly
   - Extend incrementally

4. **Interview-Ready Decisions**:
   - Clear separation of concerns
   - Type-safe, maintainable code
   - Reusable patterns
   - Documented trade-offs

## 4. MVP User Flows to Implement

### Flow 1: Template Creation & Management
1. Admin/Controller creates a template
2. Adds tasks in order
3. Configures each task (duration, SLA, approval)
4. Saves template
5. Views template list

### Flow 2: Instance Creation & Task Assignment
1. Controller selects template
2. Selects client
3. Enters instance name
4. System creates instance with all tasks
5. Controller assigns members to each task
6. Controller assigns approvers (if needed)
7. System calculates due dates
8. Instance is active

### Flow 3: Task Execution (End-to-End)
1. Member views assigned tasks
2. Member starts a task (status: in_progress)
3. Member completes checklist
4. Member adds comments/deliverable
5. Member submits for approval
6. Task status: pending_approval
7. Controller sees task in approval queue
8. Controller reviews and approves
9. Task status: completed
10. Next task in sequence becomes pending
11. Real-time updates reflect changes

This single flow demonstrates:
- Template → Instance creation
- Task assignment
- Status transitions
- Approval workflow
- Real-time updates
- Due date calculations

---

**Next Steps**: Proceed to PHASE 2 (System Design)

