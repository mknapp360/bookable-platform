-- ============================================================
-- bookable-crm  |  Initial Schema
-- Multi-tenant lead-to-case CRM
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ─── TENANTS ────────────────────────────────────────────────
create table tenants (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,               -- used in URLs / lookups
  settings    jsonb not null default '{}',        -- feature flags, preferences
  branding    jsonb not null default '{}',        -- primaryColor, logoUrl, companyName
  created_at  timestamptz not null default now()
);

-- ─── TENANT USERS ───────────────────────────────────────────
-- Maps Supabase auth users to tenants with a role
create table tenant_users (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        text not null default 'staff' check (role in ('admin', 'staff')),
  created_at  timestamptz not null default now(),
  unique(tenant_id, user_id)
);

-- ─── PIPELINE STAGES ────────────────────────────────────────
-- Each tenant defines their own pipeline stages
create table pipeline_stages (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  name        text not null,
  "order"     integer not null default 0,
  color       text not null default '#6366f1',    -- hex color for the board
  description text,
  created_at  timestamptz not null default now()
);

-- ─── DOCUMENT TYPES ─────────────────────────────────────────
-- Each tenant defines what documents are expected (optionally at a specific stage)
create table document_types (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  name        text not null,
  required    boolean not null default false,
  stage_id    uuid references pipeline_stages(id) on delete set null,
  description text,
  created_at  timestamptz not null default now()
);

-- ─── CONTACTS ───────────────────────────────────────────────
create type contact_status as enum ('lead', 'active', 'inactive', 'closed');
create type contact_source as enum ('website', 'referral', 'manual', 'phone', 'email', 'other');

create table contacts (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  first_name  text not null,
  last_name   text not null,
  email       text,
  phone       text,
  source      contact_source not null default 'manual',
  status      contact_status not null default 'lead',
  assigned_to uuid references auth.users(id) on delete set null,
  notes       text,
  metadata    jsonb not null default '{}',        -- flexible: property value, DOB, etc.
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ─── CASES ──────────────────────────────────────────────────
create table cases (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  contact_id  uuid not null references contacts(id) on delete cascade,
  title       text not null,
  stage_id    uuid references pipeline_stages(id) on delete set null,
  opened_at   timestamptz not null default now(),
  closed_at   timestamptz,
  notes       text,
  metadata    jsonb not null default '{}',        -- flexible: loan amount, property address, etc.
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ─── CASE DOCUMENTS ─────────────────────────────────────────
create table case_documents (
  id               uuid primary key default gen_random_uuid(),
  case_id          uuid not null references cases(id) on delete cascade,
  document_type_id uuid references document_types(id) on delete set null,
  file_name        text not null,
  file_path        text not null,                 -- Supabase Storage path
  file_size        bigint,                        -- bytes
  mime_type        text,
  uploaded_by      uuid references auth.users(id) on delete set null,
  uploaded_at      timestamptz not null default now(),
  notes            text
);

-- ─── ACTIVITIES ─────────────────────────────────────────────
-- Full audit log: every note, call, email, status change, upload
create type activity_type as enum (
  'note',
  'call',
  'email',
  'meeting',
  'status_change',
  'document_uploaded',
  'case_created',
  'contact_created'
);

create table activities (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references tenants(id) on delete cascade,
  contact_id  uuid references contacts(id) on delete cascade,
  case_id     uuid references cases(id) on delete cascade,
  type        activity_type not null,
  body        text,
  created_by  uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now(),
  check (contact_id is not null or case_id is not null)
);

-- ─── INDEXES ────────────────────────────────────────────────
create index on contacts(tenant_id);
create index on contacts(tenant_id, status);
create index on contacts(assigned_to);
create index on cases(tenant_id);
create index on cases(tenant_id, stage_id);
create index on cases(contact_id);
create index on case_documents(case_id);
create index on activities(tenant_id);
create index on activities(contact_id);
create index on activities(case_id);
create index on pipeline_stages(tenant_id, "order");
create index on document_types(tenant_id);

-- ─── UPDATED_AT TRIGGER ─────────────────────────────────────
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger contacts_updated_at
  before update on contacts
  for each row execute function update_updated_at();

create trigger cases_updated_at
  before update on cases
  for each row execute function update_updated_at();
