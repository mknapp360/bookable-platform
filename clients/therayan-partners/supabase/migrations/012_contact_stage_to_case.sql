-- ============================================================
-- bookable-crm  |  Auto-create case when contact reaches conversion stage
-- When a contact's pipeline_stage_id is updated to match the
-- tenant's case_conversion_stage_id, a case is automatically
-- created (if one doesn't already exist for that contact).
-- ============================================================

create or replace function public.contact_stage_to_case()
returns trigger language plpgsql as $$
declare
  v_conversion_stage_id uuid;
  v_existing_case_id    uuid;
begin
  -- Only act when pipeline_stage_id actually changes
  if new.pipeline_stage_id is not distinct from old.pipeline_stage_id then
    return new;
  end if;

  -- Look up the tenant's configured conversion stage
  select case_conversion_stage_id
    into v_conversion_stage_id
    from public.tenants
   where id = new.tenant_id;

  -- Nothing to do if tenant hasn't configured a conversion stage
  if v_conversion_stage_id is null then
    return new;
  end if;

  -- Only act when moving INTO the conversion stage
  if new.pipeline_stage_id = v_conversion_stage_id then

    -- Don't create a second case if one already exists for this contact
    select id into v_existing_case_id
      from public.cases
     where contact_id = new.id
       and tenant_id  = new.tenant_id
     limit 1;

    if v_existing_case_id is null then
      insert into public.cases (tenant_id, contact_id, title, stage_id)
      values (
        new.tenant_id,
        new.id,
        new.first_name || ' ' || new.last_name,
        new.pipeline_stage_id
      );
    end if;

  end if;

  return new;
end;
$$;

create trigger contact_stage_to_case
  after update of pipeline_stage_id on public.contacts
  for each row execute function public.contact_stage_to_case();
