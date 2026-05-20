-- ============================================================
-- bookable-crm  |  Tenant case conversion stage
-- Each tenant nominates the pipeline stage at which a contact
-- is considered ready to become a case.  When a contact is moved
-- to this stage the UI surfaces a "Create case" prompt.
-- ============================================================

alter table public.tenants
  add column if not exists case_conversion_stage_id uuid
    references public.pipeline_stages(id) on delete set null;
