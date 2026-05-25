-- Allow tenant members to delete enquiries
create policy "Tenant members can delete enquiries"
  on enquiries for delete
  using (tenant_id in (select tenant_id from tenant_users where user_id = auth.uid()));
