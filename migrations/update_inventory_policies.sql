-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their inventory items" ON inventory_items;
DROP POLICY IF EXISTS "Users can insert their inventory items" ON inventory_items;
DROP POLICY IF EXISTS "Users can update their inventory items" ON inventory_items;
DROP POLICY IF EXISTS "Users can delete their inventory items" ON inventory_items;

-- Create new policies that allow all authenticated users to view all items
CREATE POLICY "Authenticated users can view all inventory items"
    ON inventory_items
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Allow users to insert items (will be associated with their user_id)
CREATE POLICY "Users can insert inventory items"
    ON inventory_items
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Allow all authenticated users to update any inventory item
CREATE POLICY "Authenticated users can update any inventory item"
    ON inventory_items
    FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Allow all authenticated users to delete any inventory item
CREATE POLICY "Authenticated users can delete any inventory item"
    ON inventory_items
    FOR DELETE
    USING (auth.role() = 'authenticated');
