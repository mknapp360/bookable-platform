-- Create posts table for Bookable blog / content management
-- Run this in the Supabase SQL editor

create table if not exists public.posts (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  slug        text not null unique,
  content     text,          -- HTML from Tiptap editor
  excerpt     text,          -- Short description for blog list / meta tags
  status      text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,  -- Set when status changes to published
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-update updated_at on every row change
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

-- Index for slug lookups (blog detail pages)
create index if not exists posts_slug_idx on public.posts (slug);

-- Index for listing published posts by date
create index if not exists posts_published_idx on public.posts (published_at desc)
  where status = 'published';

-- Row Level Security: public can read published posts, service role has full access
alter table public.posts enable row level security;

create policy "Published posts are publicly readable"
  on public.posts for select
  using (status = 'published');

-- Allow authenticated users (admin) to do everything
create policy "Authenticated users can manage posts"
  on public.posts for all
  to authenticated
  using (true)
  with check (true);

comment on table public.posts is 'Blog posts and content managed via Bookable admin';
