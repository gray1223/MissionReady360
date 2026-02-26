-- Allow users to create custom aircraft types
ALTER TABLE aircraft_types
  ADD COLUMN is_custom BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX idx_aircraft_types_created_by ON aircraft_types(created_by);

-- RLS: users can insert their own custom aircraft
CREATE POLICY "Users can insert custom aircraft"
  ON aircraft_types FOR INSERT
  WITH CHECK (is_custom = true AND created_by = auth.uid());

-- RLS: users can update their own custom aircraft
CREATE POLICY "Users can update own custom aircraft"
  ON aircraft_types FOR UPDATE
  USING (is_custom = true AND created_by = auth.uid());

-- RLS: users can delete their own custom aircraft
CREATE POLICY "Users can delete own custom aircraft"
  ON aircraft_types FOR DELETE
  USING (is_custom = true AND created_by = auth.uid());
