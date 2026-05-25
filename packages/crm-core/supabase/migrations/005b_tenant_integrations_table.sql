-- ============================================================
-- bookable-crm  |  Create tenant_integrations table
-- Stores third-party integration config per tenant (e.g. Google, SendGrid).
-- 006_tenant_integrations_metadata.sql adds the metadata column.
-- ============================================================

create table if not exists public.tenant_integrations (
  id              uuid primary key default gen_random_uuid(),
  tenant_id       uuid not null references tenants(id) on delete cascade,
  provider        text not null,
  connected_email text,
  calendar_id     text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique(tenant_id, provider)
);

alter table public.tenant_integrations enable row level security;

create policy "Tenant members can view integrations"
  on public.tenant_integrations for select
  using (tenant_id in (select public.tenant_ids()));

create policy "Tenant admins can manage integrations"
  on public.tenant_integrations for all
  using (tenant_id in (select public.tenant_ids()));

create trigger tenant_integrations_updated_at
  before update on public.tenant_integrations
  for each row execute function update_updated_at();
