-- Create clients table if it doesn't exist
CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid()
);

-- Enable Row Level Security
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read their own clients
CREATE POLICY "Users can view their own clients"
ON clients FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create policy for authenticated users to insert their own clients
CREATE POLICY "Users can insert their own clients"
ON clients FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create policy for authenticated users to update their own clients
CREATE POLICY "Users can update their own clients"
ON clients FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create policy for authenticated users to delete their own clients
CREATE POLICY "Users can delete their own clients"
ON clients FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS clients_user_id_idx ON clients(user_id);
CREATE INDEX IF NOT EXISTS clients_email_idx ON clients(email);
