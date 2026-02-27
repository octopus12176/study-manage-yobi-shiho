-- Fix RLS policy for legal_concepts: add explicit WITH CHECK clause
-- This ensures consistency with essay_templates policy and explicit write protection

DROP POLICY IF EXISTS "Users can manage own concepts" ON legal_concepts;

CREATE POLICY "Users can manage own concepts"
  ON legal_concepts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
