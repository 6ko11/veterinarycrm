-- Add user_id column to medical_records table
ALTER TABLE medical_records 
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Enable RLS
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for authenticated users" ON medical_records
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON medical_records
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update access for record owners" ON medical_records
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete access for record owners" ON medical_records
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
