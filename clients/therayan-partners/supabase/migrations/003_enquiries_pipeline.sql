-- ============================================================
-- bookable-crm  |  Connect enquiries to pipeline
-- Adds tenant + pipeline stage link so enquiries appear on the board
-- ============================================================

-- ─── ADD COLUMNS ────────────────────────────────────────────
alter table public.enquiries
  add column if not exists tenant_id          uuid references tenants(id) on delete cascade,
  add column if not exists pipeline_stage_id  uuid references pipeline_stages(id) on delete set null,
  add column if not exists status             text not null default 'new' check (status in ('new', 'contacted', 'converted', 'dismissed'));

-- ─── INDEXES ────────────────────────────────────────────────
create index if not exists enquiries_tenant_id on enquiries(tenant_id);
create index if not exists enquiries_pipeline_stage on enquiries(tenant_id, pipeline_stage_id);

-- ─── AUTO-ASSIGN first pipeline stage on insert ─────────────
-- When an enquiry arrives with a tenant_id, automatically place it
-- in the tenant's first pipeline stage (lowest "order" value)
create or replace function public.enquiry_auto_stage()
returns trigger language plpgsql as $$
begin
  if new.tenant_id is not null and new.pipeline_stage_id is null then
    select id into new.pipeline_stage_id
    from pipeline_stages
    where tenant_id = new.tenant_id
    order by "order" asc
    limit 1;
  end if;
  return new;
end;
$$;

create trigger enquiry_auto_stage
  before insert on enquiries
  for each row execute function public.enquiry_auto_stage();

-- ─── RLS — tenant members can read & update enquiries ───────
create policy "Tenant members can view enquiries"
  on enquiries for select
  using (tenant_id in (select public.tenant_ids()));

create policy "Tenant members can update enquiries"
  on enquiries for update
  using (tenant_id in (select public.tenant_ids()));
