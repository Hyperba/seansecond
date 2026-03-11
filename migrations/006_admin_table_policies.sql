-- Migration 006: Add RLS policies for admin CRUD operations
-- Fixes: questions insert/update/delete, testimonials insert/update/delete, contacts read/update/delete

-- ============================================
-- QUESTIONS TABLE - Admin full CRUD
-- ============================================
CREATE POLICY "Admins can insert questions" ON questions
  FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update questions" ON questions
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete questions" ON questions
  FOR DELETE
  USING (is_admin());

-- ============================================
-- TESTIMONIALS TABLE - Admin full CRUD
-- ============================================
CREATE POLICY "Admins can insert testimonials" ON testimonials
  FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update testimonials" ON testimonials
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete testimonials" ON testimonials
  FOR DELETE
  USING (is_admin());

-- ============================================
-- CONTACT-FORM TABLE (inbox) - Admin read/update/delete
-- ============================================
CREATE POLICY "Admins can read contacts" ON "contact-form"
  FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can update contacts" ON "contact-form"
  FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete contacts" ON "contact-form"
  FOR DELETE
  USING (is_admin());

-- ============================================
-- SURVEY_RESPONSES TABLE - Admin read/delete
-- ============================================
CREATE POLICY "Admins can read survey responses" ON survey_responses
  FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can delete survey responses" ON survey_responses
  FOR DELETE
  USING (is_admin());

-- ============================================
-- LEADS TABLE - Admin delete (already has read/update)
-- ============================================
CREATE POLICY "Admins can delete leads" ON leads
  FOR DELETE
  USING (is_admin());
