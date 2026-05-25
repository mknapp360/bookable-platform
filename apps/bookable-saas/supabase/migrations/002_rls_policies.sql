-- ============================================================
-- bookable-crm  |  Row Level Security Policies
-- Users can only see data belonging to their tenant(s)
-- ============================================================

-- Helper function in public schema (auth schema is locked in Supabase)
create or replace function public.tenant_ids()
returns setof uuid language sql security definer stable as $$
  select tenant_id from tenant_users where user_id = auth.uid();
$$;

-- ─── ENABLE RLS ─────────────────────────────────────────────
alter table tenants          enable row level security;
alter table tenant_users     enable row level security;
alter table pipeline_stages  enable row level security;
alter table document_types   enable row level security;
alter table contacts         enable row level security;
alter table cases            enable row level security;
alter table case_documents   enable row level security;
alter table activities       enable row level security;

-- ─── TENANTS ────────────────────────────────────────────────
create policy "Users can view their own tenant"
  on tenants for select
  using (id in (select public.tenant_ids()));

-- ─── TENANT USERS ───────────────────────────────────────────
create policy "Users can view tenant_users for their tenant"
  on tenant_users for select
  using (tenant_id in (select public.tenant_ids()));

-- ─── PIPELINE STAGES ────────────────────────────────────────
create policy "Tenant members can view pipeline stages"
  on pipeline_stages for select
  using (tenant_id in (select public.tenant_ids()));

create policy "Tenant admins can manage pipeline stages"
  on pipeline_stages for all
  using (
    tenant_id in (
      select tenant_id from tenant_users
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- ─── DOCUMENT TYPES ─────────────────────────────────────────
create policy "Tenant members can view document types"
  on document_types for select
  using (tenant_id in (select public.tenant_ids()));

create policy "Tenant admins can manage document types"
  on document_types for all
  using (
    tenant_id in (
      select tenant_id from tenant_users
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- ─── CONTACTS ───────────────────────────────────────────────
create policy "Tenant members can view contacts"
  on contacts for select
  using (tenant_id in (select public.tenant_ids()));

create policy "Tenant members can create contacts"
  on contacts for insert
  with check (tenant_id in (select public.tenant_ids()));

create policy "Tenant members can update contacts"
  on contacts for update
  using (tenant_id in (select public.tenant_ids()));

create policy "Tenant admins can delete contacts"
  on contacts for delete
  using (
    tenant_id in (
      select tenant_id from tenant_users
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- ─── CASES ──────────────────────────────────────────────────
create policy "Tenant members can view cases"
  on cases for select
  using (tenant_id in (select public.tenant_ids()));

create policy "Tenant members can create cases"
  on cases for insert
  with check (tenant_id in (select public.tenant_ids()));

create policy "Tenant members can update cases"
  on cases for update
  using (tenant_id in (select public.tenant_ids()));

create policy "Tenant admins can delete cases"
  on cases for delete
  using (
    tenant_id in (
      select tenant_id from tenant_users
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- ─── CASE DOCUMENTS ─────────────────────────────────────────
create policy "Tenant members can view case documents"
  on case_documents for select
  using (
    case_id in (
      select id from cases where tenant_id in (select public.tenant_ids())
    )
  );

create policy "Tenant members can upload case documents"
  on case_documents for insert
  with check (
    case_id in (
      select id from cases where tenant_id in (select public.tenant_ids())
    )
  );

create policy "Tenant admins can delete case documents"
  on case_documents for delete
  using (
    case_id in (
      select id from cases where tenant_id in (
        select tenant_id from tenant_users
        where user_id = auth.uid() and role = 'admin'
      )
    )
  );

-- ─── ACTIVITIES ─────────────────────────────────────────────
create policy "Tenant members can view activities"
  on activities for select
  using (tenant_id in (select public.tenant_ids()));

create policy "Tenant members can create activities"
  on activities for insert
  with check (tenant_id in (select public.tenant_ids()));
