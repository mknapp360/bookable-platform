-- ============================================================
-- Tenant admins can update their own tenant record
-- Fixes: settings, branding saves were silently blocked by RLS
-- ============================================================

create policy "Tenant admins can update their tenant"
  on tenants for update
  using (
    id in (
      select tenant_id from tenant_users
      where user_id = auth.uid() and role = 'admin'
    )
  );
