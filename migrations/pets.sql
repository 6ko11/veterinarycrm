-- Create pets table if it doesn't exist
CREATE TABLE IF NOT EXISTS pets (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  species TEXT NOT NULL,
  breed TEXT,
  age INTEGER,
  client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid()
);

-- Enable Row Level Security
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read their own pets
CREATE POLICY "Users can view their own pets"
ON pets FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create policy for authenticated users to insert their own pets
CREATE POLICY "Users can insert their own pets"
ON pets FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create policy for authenticated users to update their own pets
CREATE POLICY "Users can update their own pets"
ON pets FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create policy for authenticated users to delete their own pets
CREATE POLICY "Users can delete their own pets"
ON pets FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS pets_user_id_idx ON pets(user_id);
CREATE INDEX IF NOT EXISTS pets_client_id_idx ON pets(client_id);
