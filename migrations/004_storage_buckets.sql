-- Create storage buckets for media kit and testimonial images
-- Run this in Supabase SQL Editor or via CLI

-- Create media-kit bucket (public, single PDF)
insert into storage.buckets (id, name, public)
values ('media-kit', 'media-kit', true)
on conflict (id) do nothing;

-- Create testimonial-images bucket (public, multiple images)
insert into storage.buckets (id, name, public)
values ('testimonial-images', 'testimonial-images', true)
on conflict (id) do nothing;

-- RLS policies for media-kit bucket
-- Anyone can read (public download)
create policy "Public read access for media-kit"
on storage.objects for select
using (bucket_id = 'media-kit');

-- Only authenticated admins can upload/update/delete
create policy "Admin upload for media-kit"
on storage.objects for insert
with check (
  bucket_id = 'media-kit'
  and auth.uid() in (select id from admin_users)
);

create policy "Admin update for media-kit"
on storage.objects for update
using (
  bucket_id = 'media-kit'
  and auth.uid() in (select id from admin_users)
);

create policy "Admin delete for media-kit"
on storage.objects for delete
using (
  bucket_id = 'media-kit'
  and auth.uid() in (select id from admin_users)
);

-- RLS policies for testimonial-images bucket
-- Anyone can read (public display on site)
create policy "Public read access for testimonial-images"
on storage.objects for select
using (bucket_id = 'testimonial-images');

-- Only authenticated admins can upload/update/delete
create policy "Admin upload for testimonial-images"
on storage.objects for insert
with check (
  bucket_id = 'testimonial-images'
  and auth.uid() in (select id from admin_users)
);

create policy "Admin update for testimonial-images"
on storage.objects for update
using (
  bucket_id = 'testimonial-images'
  and auth.uid() in (select id from admin_users)
);

create policy "Admin delete for testimonial-images"
on storage.objects for delete
using (
  bucket_id = 'testimonial-images'
  and auth.uid() in (select id from admin_users)
);
