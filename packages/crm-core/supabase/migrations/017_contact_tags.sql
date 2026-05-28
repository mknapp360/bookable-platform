-- Contact tags: user-defined tags that can be applied to contacts
create table if not exists public.contact_tags (
  id         uuid primary key default gen_random_uuid(),
  tenant_id  uuid not null references public.tenants(id) on delete cascade,
  name       text not null,
  color      text not null default '#6366f1',
  created_at timestamptz not null default now()
);

-- Junction table linking contacts to tags
create table if not exists public.contact_tag_links (
  id         uuid primary key default gen_random_uuid(),
  contact_id uuid not null references public.contacts(id) on delete cascade,
  tag_id     uuid not null references public.contact_tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (contact_id, tag_id)
);

-- Indexes
create index if not exists idx_contact_tags_tenant on public.contact_tags(tenant_id);
create index if not exists idx_contact_tag_links_contact on public.contact_tag_links(contact_id);
create index if not exists idx_contact_tag_links_tag on public.contact_tag_links(tag_id);

-- RLS
alter table public.contact_tags enable row level security;
alter table public.contact_tag_links enable row level security;

-- contact_tags policies
create policy "Tenant members can view their tags"
  on public.contact_tags for select
  using (tenant_id in (select public.tenant_ids()));

create policy "Tenant members can insert tags"
  on public.contact_tags for insert
  with check (tenant_id in (select public.tenant_ids()));

create policy "Tenant members can update their tags"
  on public.contact_tags for update
  using (tenant_id in (select public.tenant_ids()));

create policy "Tenant members can delete their tags"
  on public.contact_tags for delete
  using (tenant_id in (select public.tenant_ids()));

-- contact_tag_links policies (join through contact_tags to check tenant)
create policy "Tenant members can view tag links"
  on public.contact_tag_links for select
  using (tag_id in (select id from public.contact_tags where tenant_id in (select public.tenant_ids())));

create policy "Tenant members can insert tag links"
  on public.contact_tag_links for insert
  with check (tag_id in (select id from public.contact_tags where tenant_id in (select public.tenant_ids())));

create policy "Tenant members can delete tag links"
  on public.contact_tag_links for delete
  using (tag_id in (select id from public.contact_tags where tenant_id in (select public.tenant_ids())));
