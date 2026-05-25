-- ============================================================
-- bookable-crm  |  Auto-assign first pipeline stage to new contacts
-- When a contact is inserted with a tenant_id and no explicit
-- pipeline_stage_id, place it in the tenant's first stage
-- (lowest "order" value).  Mirrors enquiry_auto_stage (migration 003).
-- ============================================================

create or replace function public.contact_auto_stage()
returns trigger language plpgsql as $$
begin
  if new.tenant_id is not null and new.pipeline_stage_id is null then
    select id into new.pipeline_stage_id
    from public.pipeline_stages
    where tenant_id = new.tenant_id
    order by "order" asc
    limit 1;
  end if;
  return new;
end;
$$;

create trigger contact_auto_stage
  before insert on public.contacts
  for each row execute function public.contact_auto_stage();
