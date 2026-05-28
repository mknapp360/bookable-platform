-- User-created documents (brochures, etc.) that can be attached to contacts or cases
create table if not exists public.documents (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  name        text not null,
  type        text not null default 'brochure',
  file_name   text not null,
  file_path   text not null,
  file_size   bigint,
  mime_type   text,
  contact_id  uuid references public.contacts(id) on delete set null,
  case_id     uuid references public.cases(id) on delete set null,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);

create index if not exists idx_documents_tenant on public.documents(tenant_id);
create index if not exists idx_documents_contact on public.documents(contact_id);
create index if not exists idx_documents_case on public.documents(case_id);

-- RLS
alter table public.documents enable row level security;

create policy "Tenant members can view their documents"
  on public.documents for select
  using (tenant_id in (select public.tenant_ids()));

create policy "Tenant members can insert documents"
  on public.documents for insert
  with check (tenant_id in (select public.tenant_ids()));

create policy "Tenant members can update their documents"
  on public.documents for update
  using (tenant_id in (select public.tenant_ids()));

create policy "Tenant members can delete their documents"
  on public.documents for delete
  using (tenant_id in (select public.tenant_ids()));

-- Storage bucket for document files
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

-- Storage RLS: authenticated users can upload/read/delete from their tenant folder
create policy "Authenticated users can upload documents"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'documents');

create policy "Authenticated users can read documents"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'documents');

create policy "Authenticated users can delete documents"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'documents');
