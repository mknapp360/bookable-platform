-- ============================================================
-- bookable-crm  |  Tasks
-- Tenant-scoped tasks tied to contacts, cases, and pipeline stages
-- ============================================================

-- ─── ENUMS ──────────────────────────────────────────────────
create type task_status   as enum ('open', 'in_progress', 'completed');
create type task_priority as enum ('low', 'medium', 'high');

-- ─── TASKS TABLE ────────────────────────────────────────────
create table tasks (
  id                uuid primary key default gen_random_uuid(),
  tenant_id         uuid not null references tenants(id) on delete cascade,
  title             text not null,
  description       text,
  status            task_status   not null default 'open',
  priority          task_priority not null default 'medium',
  due_date          date,
  contact_id        uuid references contacts(id) on delete cascade,
  case_id           uuid references cases(id) on delete cascade,
  pipeline_stage_id uuid references pipeline_stages(id) on delete set null,
  assigned_to       uuid references auth.users(id) on delete set null,
  created_by        uuid references auth.users(id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ─── INDEXES ────────────────────────────────────────────────
create index on tasks(tenant_id);
create index on tasks(tenant_id, status);
create index on tasks(tenant_id, pipeline_stage_id);
create index on tasks(contact_id);
create index on tasks(case_id);
create index on tasks(assigned_to);
create index on tasks(due_date);

-- ─── UPDATED_AT TRIGGER ─────────────────────────────────────
create trigger tasks_updated_at
  before update on tasks
  for each row execute function update_updated_at();

-- ─── ROW LEVEL SECURITY ─────────────────────────────────────
alter table tasks enable row level security;

create policy "Tenant members can view tasks"
  on tasks for select
  using (tenant_id in (select public.tenant_ids()));

create policy "Tenant members can create tasks"
  on tasks for insert
  with check (tenant_id in (select public.tenant_ids()));

create policy "Tenant members can update tasks"
  on tasks for update
  using (tenant_id in (select public.tenant_ids()));

create policy "Tenant admins can delete tasks"
  on tasks for delete
  using (
    tenant_id in (
      select tenant_id from tenant_users
      where user_id = auth.uid() and role = 'admin'
    )
  );
