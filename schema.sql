-- ============================================
-- PRODUCTION-READY SCHEMA
-- M. Sean Agnew Website
-- ============================================

-- ============================================
-- ROLE TYPE ENUM
-- ============================================
DO $$ BEGIN
  CREATE TYPE admin_role AS ENUM ('owner', 'admin', 'viewer');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- HELPER FUNCTIONS (for RLS policies)
-- Must be created before tables that use them
-- ============================================

-- Check if current user is an admin (any role)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid()
  );
$$;

-- Check if current user is an owner
CREATE OR REPLACE FUNCTION is_owner()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid() AND role = 'owner'
  );
$$;

-- Check if current user can write (owner or admin, not viewer)
CREATE OR REPLACE FUNCTION can_write()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM admin_users WHERE id = auth.uid() AND role IN ('owner', 'admin')
  );
$$;

-- ============================================
-- ADMIN USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  email text NOT NULL,
  display_name text NOT NULL,
  role admin_role NOT NULL DEFAULT 'admin'
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Self-read (no circular dependency)
CREATE POLICY "Users can read own admin record" ON admin_users
  FOR SELECT
  USING (auth.uid() = id);

-- Admins can read all admin records
CREATE POLICY "Admins can read all admin_users" ON admin_users
  FOR SELECT
  USING (is_admin());

-- Only owners can update admin_users
CREATE POLICY "Owners can update admin_users" ON admin_users
  FOR UPDATE
  USING (is_owner())
  WITH CHECK (is_owner());

-- Only owners can insert new admin_users
CREATE POLICY "Owners can insert admin_users" ON admin_users
  FOR INSERT
  WITH CHECK (is_owner());

-- Only owners can delete admin_users
CREATE POLICY "Owners can delete admin_users" ON admin_users
  FOR DELETE
  USING (is_owner());

-- ============================================
-- CONTACT FORM TABLE (inbox)
-- ============================================
CREATE TABLE IF NOT EXISTS "contact-form" (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  email text NOT NULL,
  company text,
  message text NOT NULL,
  is_read boolean NOT NULL DEFAULT false
);

ALTER TABLE "contact-form" ENABLE ROW LEVEL SECURITY;

-- Public can submit contact forms
CREATE POLICY "Allow insert for contact form" ON "contact-form"
  FOR INSERT
  WITH CHECK (true);

-- Admins can read contacts
CREATE POLICY "Admins can read contacts" ON "contact-form"
  FOR SELECT
  USING (is_admin());

-- Owners/Admins can update contacts (mark as read)
CREATE POLICY "Writers can update contacts" ON "contact-form"
  FOR UPDATE
  USING (can_write())
  WITH CHECK (can_write());

-- Owners/Admins can delete contacts
CREATE POLICY "Writers can delete contacts" ON "contact-form"
  FOR DELETE
  USING (can_write());

-- ============================================
-- LEADS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  email text NOT NULL,
  name text,
  source text,
  status text NOT NULL DEFAULT 'new'
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX IF NOT EXISTS leads_email_unique ON leads (email);

-- Public can create leads
CREATE POLICY "Allow insert for leads" ON leads
  FOR INSERT
  WITH CHECK (true);

-- Public can update leads (for status changes from public forms)
CREATE POLICY "Allow update for leads" ON leads
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Admins can read leads
CREATE POLICY "Admins can read leads" ON leads
  FOR SELECT
  USING (is_admin());

-- Owners/Admins can delete leads
CREATE POLICY "Writers can delete leads" ON leads
  FOR DELETE
  USING (can_write());

-- ============================================
-- QUESTION GROUPS TABLE (for ordering)
-- ============================================
CREATE TABLE IF NOT EXISTS question_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  sort_order int NOT NULL DEFAULT 0
);

ALTER TABLE question_groups ENABLE ROW LEVEL SECURITY;

-- Public can read question groups
CREATE POLICY "Allow read for question_groups" ON question_groups
  FOR SELECT
  USING (true);

-- Owners/Admins can insert question groups
CREATE POLICY "Writers can insert question_groups" ON question_groups
  FOR INSERT
  WITH CHECK (can_write());

-- Owners/Admins can update question groups
CREATE POLICY "Writers can update question_groups" ON question_groups
  FOR UPDATE
  USING (can_write())
  WITH CHECK (can_write());

-- Owners/Admins can delete question groups
CREATE POLICY "Writers can delete question_groups" ON question_groups
  FOR DELETE
  USING (can_write());

-- ============================================
-- QUESTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_group text NOT NULL,
  question_order int NOT NULL,
  question_text text NOT NULL
);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Public can read questions
CREATE POLICY "Allow read for questions" ON questions
  FOR SELECT
  USING (true);

-- Owners/Admins can insert questions
CREATE POLICY "Writers can insert questions" ON questions
  FOR INSERT
  WITH CHECK (can_write());

-- Owners/Admins can update questions
CREATE POLICY "Writers can update questions" ON questions
  FOR UPDATE
  USING (can_write())
  WITH CHECK (can_write());

-- Owners/Admins can delete questions
CREATE POLICY "Writers can delete questions" ON questions
  FOR DELETE
  USING (can_write());

-- ============================================
-- SURVEY RESPONSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS survey_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  email text NOT NULL,
  name text NOT NULL,
  responses jsonb NOT NULL
);

ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- Public can submit survey responses
CREATE POLICY "Allow insert for survey responses" ON survey_responses
  FOR INSERT
  WITH CHECK (true);

-- Admins can read survey responses
CREATE POLICY "Admins can read survey_responses" ON survey_responses
  FOR SELECT
  USING (is_admin());

-- Owners/Admins can delete survey responses
CREATE POLICY "Writers can delete survey_responses" ON survey_responses
  FOR DELETE
  USING (can_write());

-- ============================================
-- TESTIMONIALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  name text NOT NULL,
  title text NOT NULL,
  quote text NOT NULL,
  image_url text,
  sort_order int NOT NULL
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Public can read testimonials
CREATE POLICY "Allow read for testimonials" ON testimonials
  FOR SELECT
  USING (true);

-- Owners/Admins can insert testimonials
CREATE POLICY "Writers can insert testimonials" ON testimonials
  FOR INSERT
  WITH CHECK (can_write());

-- Owners/Admins can update testimonials
CREATE POLICY "Writers can update testimonials" ON testimonials
  FOR UPDATE
  USING (can_write())
  WITH CHECK (can_write());

-- Owners/Admins can delete testimonials
CREATE POLICY "Writers can delete testimonials" ON testimonials
  FOR DELETE
  USING (can_write());

-- ============================================
-- NEWSLETTER SUBSCRIBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  email text NOT NULL UNIQUE
);

ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

-- Public can subscribe
CREATE POLICY "Allow insert for subscribers" ON subscribers
  FOR INSERT
  WITH CHECK (true);

-- Admins can read subscribers
CREATE POLICY "Admins can read subscribers" ON subscribers
  FOR SELECT
  USING (is_admin());

-- Owners/Admins can delete subscribers
CREATE POLICY "Writers can delete subscribers" ON subscribers
  FOR DELETE
  USING (can_write());

-- ============================================
-- STORAGE BUCKETS
-- Run this section in Supabase SQL Editor
-- ============================================

-- Create media-kit bucket (public, single PDF)
INSERT INTO storage.buckets (id, name, public)
VALUES ('media-kit', 'media-kit', true)
ON CONFLICT (id) DO NOTHING;

-- Create testimonial-images bucket (public, multiple images)
INSERT INTO storage.buckets (id, name, public)
VALUES ('testimonial-images', 'testimonial-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies for media-kit
CREATE POLICY "Public read access for media-kit" ON storage.objects
  FOR SELECT USING (bucket_id = 'media-kit');

CREATE POLICY "Admin upload for media-kit" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'media-kit' AND can_write());

CREATE POLICY "Admin update for media-kit" ON storage.objects
  FOR UPDATE USING (bucket_id = 'media-kit' AND can_write());

CREATE POLICY "Admin delete for media-kit" ON storage.objects
  FOR DELETE USING (bucket_id = 'media-kit' AND can_write());

-- Storage RLS policies for testimonial-images
CREATE POLICY "Public read access for testimonial-images" ON storage.objects
  FOR SELECT USING (bucket_id = 'testimonial-images');

CREATE POLICY "Admin upload for testimonial-images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'testimonial-images' AND can_write());

CREATE POLICY "Admin update for testimonial-images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'testimonial-images' AND can_write());

CREATE POLICY "Admin delete for testimonial-images" ON storage.objects
  FOR DELETE USING (bucket_id = 'testimonial-images' AND can_write());

-- ============================================
-- SEED DATA: Question Groups
-- ============================================
INSERT INTO question_groups (name, sort_order) VALUES
  ('Clarity of Direction', 1),
  ('Sales Communication Confidence', 2),
  ('Execution and Leverage', 3)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- SEED DATA: Questions
-- ============================================
INSERT INTO questions (question_group, question_order, question_text) VALUES
  ('Clarity of Direction', 1, 'Do you know exactly what your top business priority is right now?'),
  ('Clarity of Direction', 2, 'Can you clearly describe your main goal for the next 90 days?'),
  ('Clarity of Direction', 3, 'Do your daily actions feel aligned with your long-term vision?'),
  ('Clarity of Direction', 4, 'Does your business direction feel intentional rather than accidental?'),
  ('Clarity of Direction', 5, 'Do you feel focused rather than pulled in multiple directions?'),
  ('Sales Communication Confidence', 1, 'When people ask what you do, do they usually understand quickly?'),
  ('Sales Communication Confidence', 2, 'Do sales conversations feel more collaborative than uncomfortable?'),
  ('Sales Communication Confidence', 3, 'Does selling your services feel aligned with who you are?'),
  ('Sales Communication Confidence', 4, 'Do you feel confident discussing your services without feeling salesy?'),
  ('Sales Communication Confidence', 5, 'Are you comfortable asking for the business when it''s a good fit?'),
  ('Execution and Leverage', 1, 'Do you have systems or processes that support your day-to-day operations?'),
  ('Execution and Leverage', 2, 'If you stepped away for two weeks, would the business mostly continue?'),
  ('Execution and Leverage', 3, 'Does your current pace feel sustainable long-term?'),
  ('Execution and Leverage', 4, 'Are your results driven more by systems than sheer effort?'),
  ('Execution and Leverage', 5, 'Do you have margin to step back without things falling apart?');

-- ============================================
-- SEED DATA: Testimonials
-- ============================================
INSERT INTO testimonials (name, title, quote, image_url, sort_order) VALUES
  ('Michael Howard', 'CEO, AI Growth Consulting', 'Thank you for inspiring me to take my sales game to the next level, Sean!', '/testimonials/michael-howard.png', 1),
  ('John Misiag', 'CEO, NexxVia AI Consulting', 'If you want become more visible, valuable and connected in your industry, this will give you your baseline.', '/testimonials/john-misiag.png', 2),
  ('Saam Golgoon', 'Philanthropist/Entrepreneur', 'I gained and learned tremendous amount of information from him and consider him a mentor!', '/testimonials/saam-golgoon.png', 3),
  ('Nicole Torres', 'UX Designer/Creative Consultant', 'Sean was not only knowledgeable but was also energetic, witty, and engaging. I plan to consult him on upcoming projects.', '/testimonials/nicole-torres.png', 4),
  ('Mike Rizkalla', 'CEO/Co-Founder, Snorble', 'Sean is a great guy, with fantastic insight and an ability to bring big players to the table.', '/testimonials/mike-rizkalla.png', 5),
  ('Thaddeus Rex', 'CEO, iTeam', 'Every time I find the opportunity to work with Sean, I find myself learning. His coaching is powerful!', '/testimonials/thaddeus-rex.png', 6),
  ('Tina Dowd', 'Founder, Sundance Vacations', 'Sean has exceptional sales skills. He thoroughly understands the sales process and contributes greatly to the success of Sundance Vacations.', '/testimonials/tina-dowd.png', 7);
