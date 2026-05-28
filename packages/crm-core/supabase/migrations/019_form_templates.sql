-- Online Form Builder: form definitions and submissions

-- ─── FORM TEMPLATES ─────────────────────────────────────────
create table if not exists public.form_templates (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  name        text not null,
  schema      jsonb not null default '{"pages":[]}',
  status      text not null default 'draft' check (status in ('draft', 'published')),
  created_by  uuid,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists idx_form_templates_tenant on public.form_templates(tenant_id);

alter table public.form_templates enable row level security;

create policy "Tenant members can view form templates"
  on public.form_templates for select
  using (tenant_id in (select public.tenant_ids()));

create policy "Tenant members can insert form templates"
  on public.form_templates for insert
  with check (tenant_id in (select public.tenant_ids()));

create policy "Tenant members can update form templates"
  on public.form_templates for update
  using (tenant_id in (select public.tenant_ids()));

create policy "Tenant members can delete form templates"
  on public.form_templates for delete
  using (tenant_id in (select public.tenant_ids()));

-- ─── FORM SUBMISSIONS ──────────────────────────────────────
create table if not exists public.form_submissions (
  id               uuid primary key default gen_random_uuid(),
  tenant_id        uuid not null references public.tenants(id) on delete cascade,
  form_template_id uuid not null references public.form_templates(id) on delete cascade,
  contact_id       uuid references public.contacts(id) on delete set null,
  token            text not null unique,
  status           text not null default 'pending' check (status in ('pending', 'completed')),
  responses        jsonb not null default '{}',
  sent_at          timestamptz,
  completed_at     timestamptz,
  created_at       timestamptz not null default now()
);

create index if not exists idx_form_submissions_tenant on public.form_submissions(tenant_id);
create index if not exists idx_form_submissions_token on public.form_submissions(token);
create index if not exists idx_form_submissions_contact on public.form_submissions(contact_id);
create index if not exists idx_form_submissions_form on public.form_submissions(form_template_id);

alter table public.form_submissions enable row level security;

create policy "Tenant members can view form submissions"
  on public.form_submissions for select
  using (tenant_id in (select public.tenant_ids()));

create policy "Tenant members can insert form submissions"
  on public.form_submissions for insert
  with check (tenant_id in (select public.tenant_ids()));

create policy "Tenant members can update form submissions"
  on public.form_submissions for update
  using (tenant_id in (select public.tenant_ids()));

create policy "Tenant members can delete form submissions"
  on public.form_submissions for delete
  using (tenant_id in (select public.tenant_ids()));
