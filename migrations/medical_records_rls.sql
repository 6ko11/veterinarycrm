-- Enable RLS
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;

-- Policy for selecting medical records
CREATE POLICY "Users can view medical records"
  ON medical_records
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy for inserting medical records
CREATE POLICY "Users can insert medical records"
  ON medical_records
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Policy for updating medical records
CREATE POLICY "Users can update medical records"
  ON medical_records
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Policy for deleting medical records
CREATE POLICY "Users can delete medical records"
  ON medical_records
  FOR DELETE
  USING (auth.role() = 'authenticated');
