-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create inventory items table
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('medication', 'vaccine', 'supply')),
    description TEXT,
    sku VARCHAR(50) UNIQUE,
    quantity INTEGER NOT NULL DEFAULT 0,
    minimum_quantity INTEGER NOT NULL DEFAULT 5,
    purchase_price DECIMAL(10,2) NOT NULL,
    sale_price DECIMAL(10,2) NOT NULL,
    expiry_date DATE,
    manufacturer VARCHAR(255),
    supplier VARCHAR(255),
    storage_conditions VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id UUID REFERENCES auth.users(id) NOT NULL
);

-- Add RLS policies
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their inventory items"
    ON inventory_items
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their inventory items"
    ON inventory_items
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their inventory items"
    ON inventory_items
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their inventory items"
    ON inventory_items
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_inventory_items_updated_at
    BEFORE UPDATE ON inventory_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
