-- ============================================================
-- bookable-crm  |  Fact Finds
-- Equity release fact-find per contact, scoped to tenant.
-- Optional case_id link for future crm-core integration.
-- ============================================================

create table fact_finds (
  id                  uuid primary key default gen_random_uuid(),
  tenant_id           uuid not null references tenants(id) on delete cascade,
  contact_id          uuid not null references contacts(id) on delete cascade,
  case_id             uuid references cases(id) on delete set null,
  status              text not null default 'draft' check (status in ('draft', 'complete')),
  created_by          uuid references auth.users(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  -- Section data (JSONB — one column per fact-find section)
  client_details      jsonb not null default '{}',
  personal_details    jsonb not null default '{}',
  medical             jsonb not null default '{}',
  occupation_income   jsonb not null default '{}',
  post_retirement     jsonb not null default '{}',
  benefits            jsonb not null default '{}',
  mortgages           jsonb not null default '{}',
  unsecured_debts     jsonb not null default '{}',
  expenditure         jsonb not null default '{}',
  savings_investments jsonb not null default '{}',
  protection          jsonb not null default '{}',
  objectives          jsonb not null default '{}',
  property_details    jsonb not null default '{}',
  vulnerability       jsonb not null default '{}',
  marketing_prefs     jsonb not null default '{}',
  equity_release_1    jsonb not null default '{}',
  equity_release_2    jsonb not null default '{}',
  equity_release_3    jsonb not null default '{}',
  id_requirements     jsonb not null default '{}',
  admin_details       jsonb not null default '{}',
  erc_checklist       jsonb not null default '{}',
  application_docs    jsonb not null default '{}'
);

-- One fact-find per contact (can be relaxed later if multiple products needed)
create unique index fact_finds_contact_id_unique on fact_finds(contact_id);

create index on fact_finds(tenant_id);
create index on fact_finds(contact_id);
create index on fact_finds(case_id);

create trigger fact_finds_updated_at
  before update on fact_finds
  for each row execute function update_updated_at();

-- ─── ROW LEVEL SECURITY ─────────────────────────────────────
alter table fact_finds enable row level security;

create policy "Tenant members can view fact finds"
  on fact_finds for select
  using (tenant_id in (select public.tenant_ids()));

create policy "Tenant members can create fact finds"
  on fact_finds for insert
  with check (tenant_id in (select public.tenant_ids()));

create policy "Tenant members can update fact finds"
  on fact_finds for update
  using (tenant_id in (select public.tenant_ids()));

create policy "Tenant admins can delete fact finds"
  on fact_finds for delete
  using (
    tenant_id in (
      select tenant_id from tenant_users
      where user_id = auth.uid() and role = 'admin'
    )
  );
