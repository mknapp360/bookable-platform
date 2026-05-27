-- Add cover_image_url to posts table
-- Run in Supabase SQL editor

alter table public.posts
  add column if not exists cover_image_url text;

comment on column public.posts.cover_image_url is 'Optional hero image URL shown at the top of the blog post';
