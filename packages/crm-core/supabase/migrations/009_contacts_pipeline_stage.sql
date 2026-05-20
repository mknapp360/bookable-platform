-- ============================================================
-- bookable-crm  |  Contacts pipeline stage + pipeline_stages phase
-- Adds pipeline_stage_id FK to contacts so contacts can be placed
-- on the pipeline board, and adds a phase column to pipeline_stages
-- for grouping stages into workflow phases.
-- ============================================================

-- ─── PIPELINE STAGES — add phase column ─────────────────────
alter table public.pipeline_stages
  add column if not exists phase integer not null default 0;

-- ─── CONTACTS — add pipeline_stage_id FK ────────────────────
alter table public.contacts
  add column if not exists pipeline_stage_id uuid
    references public.pipeline_stages(id) on delete set null;

create index if not exists contacts_pipeline_stage
  on contacts(tenant_id, pipeline_stage_id);
