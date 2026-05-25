-- Add metadata column to tenant_integrations for provider-specific config
-- e.g. SendGrid: { from_name: 'Martin at Viva' }
alter table tenant_integrations
  add column if not exists metadata jsonb not null default '{}';
