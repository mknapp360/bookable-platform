-- ============================================================
-- bookable-crm  |  Self-serve signup trigger
-- Auto-provisions tenant + pipeline stages when a new user registers
-- ============================================================

-- ─── FUNCTION ───────────────────────────────────────────────
-- Fires after a new row is inserted into auth.users.
-- Reads full_name and business_name from user metadata passed
-- at signup, creates the tenant, wires up the user as admin,
-- and seeds a sensible default pipeline.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_tenant_id  uuid;
  business_name  text;
  base_slug      text;
  final_slug     text;
begin
  -- Pull metadata passed from the client at signUp()
  business_name := coalesce(
    nullif(trim(new.raw_user_meta_data->>'business_name'), ''),
    'My Business'
  );

  -- Build a URL-safe slug from the business name
  base_slug := lower(regexp_replace(business_name, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  -- Append 8 chars of a UUID to guarantee uniqueness
  final_slug := base_slug || '-' || substring(gen_random_uuid()::text, 1, 8);

  -- ─── Create tenant ───────────────────────────────────────
  insert into public.tenants (name, slug, settings, branding)
  values (
    business_name,
    final_slug,
    '{}'::jsonb,
    jsonb_build_object('companyName', business_name)
  )
  returning id into new_tenant_id;

  -- ─── Add user as admin ───────────────────────────────────
  insert into public.tenant_users (tenant_id, user_id, role)
  values (new_tenant_id, new.id, 'admin');

  -- ─── Seed default pipeline stages ───────────────────────
  insert into public.pipeline_stages (tenant_id, name, "order", color, description)
  values
    (new_tenant_id, 'New',          1, '#6366f1', 'Brand new contact or enquiry'),
    (new_tenant_id, 'Contacted',    2, '#3b82f6', 'Initial contact made'),
    (new_tenant_id, 'Interested',   3, '#f59e0b', 'Has expressed interest'),
    (new_tenant_id, 'Following Up', 4, '#f97316', 'Active follow-up in progress'),
    (new_tenant_id, 'Customer',     5, '#22c55e', 'Converted to customer');

  return new;
end;
$$;

-- ─── TRIGGER ────────────────────────────────────────────────
-- Drop first so re-running the migration is idempotent
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();
