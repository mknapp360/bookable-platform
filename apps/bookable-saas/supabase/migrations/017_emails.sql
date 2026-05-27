-- ============================================================
-- bookable-crm  |  Create emails table
-- Stores inbound and outbound email messages per tenant/contact.
-- ============================================================

create table if not exists public.emails (
  id            uuid primary key default gen_random_uuid(),
  tenant_id     uuid not null references tenants(id) on delete cascade,
  contact_id    uuid references contacts(id) on delete set null,
  direction     text not null check (direction in ('inbound', 'outbound')),
  from_email    text not null,
  from_name     text,
  to_email      text not null,
  to_name       text,
  subject       text,
  body_text     text,
  body_html     text,
  message_id    text,
  in_reply_to   text,
  metadata      jsonb not null default '{}',
  created_at    timestamptz not null default now()
);

create index if not exists idx_emails_tenant on emails(tenant_id);
create index if not exists idx_emails_contact on emails(contact_id);
create index if not exists idx_emails_tenant_contact_created on emails(tenant_id, contact_id, created_at);

alter table public.emails enable row level security;

create policy "Tenant members can view emails"
  on public.emails for select
  using (tenant_id in (select public.tenant_ids()));

create policy "Tenant members can insert emails"
  on public.emails for insert
  with check (tenant_id in (select public.tenant_ids()));
