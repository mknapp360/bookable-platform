-- ============================================================
-- bookable-crm  |  Create enquiries table
-- Base table for website contact-form submissions.
-- 003_enquiries_pipeline.sql adds tenant + pipeline columns.
-- ============================================================

create table if not exists public.enquiries (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text,
  phone       text,
  message     text,
  source      text,
  created_at  timestamptz not null default now()
);

-- Allow anonymous inserts from the public website (contact form)
alter table public.enquiries enable row level security;

create policy "Anyone can insert enquiries"
  on public.enquiries for insert
  with check (true);
