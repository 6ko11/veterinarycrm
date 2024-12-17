-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Policy for selecting invoices
CREATE POLICY "Users can view invoices"
  ON invoices
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy for inserting invoices
CREATE POLICY "Users can insert invoices"
  ON invoices
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Policy for updating invoices
CREATE POLICY "Users can update invoices"
  ON invoices
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Policy for deleting invoices
CREATE POLICY "Users can delete invoices"
  ON invoices
  FOR DELETE
  USING (auth.role() = 'authenticated');
