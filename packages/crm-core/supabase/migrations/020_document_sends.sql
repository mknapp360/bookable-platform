-- Track when a document (brochure) is sent to a contact
create table if not exists public.document_sends (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  document_id uuid not null references public.documents(id) on delete cascade,
  contact_id  uuid not null references public.contacts(id) on delete cascade,
  sent_at     timestamptz not null default now(),
  unique (document_id, contact_id)
);

create index if not exists idx_document_sends_contact on public.document_sends(contact_id);

alter table public.document_sends enable row level security;

create policy "Tenant members can view document sends"
  on public.document_sends for select
  using (tenant_id in (select public.tenant_ids()));

create policy "Tenant members can insert document sends"
  on public.document_sends for insert
  with check (tenant_id in (select public.tenant_ids()));

create policy "Tenant members can delete document sends"
  on public.document_sends for delete
  using (tenant_id in (select public.tenant_ids()));
