-- Create enquiries table for the contact form
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  source text default 'contact_form',
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.enquiries enable row level security;

-- Allow anonymous users to insert (public contact form)
create policy "Anyone can submit an enquiry"
  on public.enquiries
  for insert
  with check (true);
