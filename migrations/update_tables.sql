-- Add user_id column to medical_records if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'medical_records' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE medical_records 
    ADD COLUMN user_id UUID REFERENCES auth.users(id) NOT NULL DEFAULT auth.uid();
  END IF;
END $$;

-- Add user_id column to invoices if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'invoices' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE invoices 
    ADD COLUMN user_id UUID REFERENCES auth.users(id) NOT NULL DEFAULT auth.uid();
  END IF;
END $$;
