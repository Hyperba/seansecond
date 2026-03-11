-- Migration 001: Admin portal support
-- Run this against your Supabase SQL editor in production.

-- ============================================================
-- 1. Admin users table (references Supabase Auth)
-- ============================================================
create table if not exists admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  email text not null,
  display_name text not null,
  role text not null default 'admin' check (role in ('owner', 'admin', 'viewer'))
);

alter table admin_users enable row level security;

create policy "Admins can read admin_users" on admin_users
  for select
  using (auth.uid() in (select id from admin_users));

-- ============================================================
-- 2. Add is_read to contact-form for inbox tracking
-- ============================================================
alter table "contact-form"
  add column if not exists is_read boolean not null default false;

-- ============================================================
-- 3. Add status to leads for lead management
-- ============================================================
alter table leads
  add column if not exists status text not null default 'new';

-- ============================================================
-- 4. Admin RLS policies — allow authenticated admins full access
-- ============================================================

-- contact-form: admins can read, update, delete
create policy "Admins can read contact-form" on "contact-form"
  for select
  using (auth.uid() in (select id from admin_users));

create policy "Admins can update contact-form" on "contact-form"
  for update
  using (auth.uid() in (select id from admin_users))
  with check (auth.uid() in (select id from admin_users));

create policy "Admins can delete contact-form" on "contact-form"
  for delete
  using (auth.uid() in (select id from admin_users));

-- leads: admins can manage (insert/update/delete already exist for anon;
-- add explicit admin policies for full CRUD)
create policy "Admins can manage leads" on leads
  for all
  using (auth.uid() in (select id from admin_users))
  with check (auth.uid() in (select id from admin_users));

-- questions: admins can insert, update, delete
-- (public read policy already exists)
create policy "Admins can insert questions" on questions
  for insert
  with check (auth.uid() in (select id from admin_users));

create policy "Admins can update questions" on questions
  for update
  using (auth.uid() in (select id from admin_users))
  with check (auth.uid() in (select id from admin_users));

create policy "Admins can delete questions" on questions
  for delete
  using (auth.uid() in (select id from admin_users));

-- survey_responses: admins can read and delete
create policy "Admins can read survey_responses" on survey_responses
  for select
  using (auth.uid() in (select id from admin_users));

create policy "Admins can delete survey_responses" on survey_responses
  for delete
  using (auth.uid() in (select id from admin_users));

-- testimonials: admins can insert, update, delete
-- (public read policy already exists)
create policy "Admins can insert testimonials" on testimonials
  for insert
  with check (auth.uid() in (select id from admin_users));

create policy "Admins can update testimonials" on testimonials
  for update
  using (auth.uid() in (select id from admin_users))
  with check (auth.uid() in (select id from admin_users));

create policy "Admins can delete testimonials" on testimonials
  for delete
  using (auth.uid() in (select id from admin_users));

-- ============================================================
-- 5. HOW TO CREATE YOUR FIRST ADMIN USER
-- ============================================================
-- Step 1: Go to Supabase Dashboard → Authentication → Users → Add User
--         Create a user with email + password.
--
-- Step 2: Copy the user's UUID from the dashboard, then run:
--
--   INSERT INTO admin_users (id, email, display_name, role)
--   VALUES ('<user-uuid>', 'admin@example.com', 'Sean Agnew', 'owner');
--
-- Repeat for each team member.
