CREATE TABLE legal_concepts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  subject text NOT NULL,
  category text NOT NULL DEFAULT 'その他',
  title text NOT NULL,
  summary text,
  framework text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE legal_concepts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own concepts"
  ON legal_concepts FOR ALL USING (auth.uid() = user_id);
