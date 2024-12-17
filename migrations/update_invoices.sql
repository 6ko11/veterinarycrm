-- Enable RLS for invoice_items
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Create policies for invoice_items
CREATE POLICY "Users can view their own invoice items"
    ON invoice_items
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM invoices
            WHERE invoices.id = invoice_items.invoice_id
            AND invoices.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create their own invoice items"
    ON invoice_items
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM invoices
            WHERE invoices.id = invoice_items.invoice_id
            AND invoices.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own invoice items"
    ON invoice_items
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM invoices
            WHERE invoices.id = invoice_items.invoice_id
            AND invoices.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own invoice items"
    ON invoice_items
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM invoices
            WHERE invoices.id = invoice_items.invoice_id
            AND invoices.user_id = auth.uid()
        )
    );

-- Add trigger to update invoice total when items change
CREATE OR REPLACE FUNCTION update_invoice_total()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE invoices
    SET total = (
        SELECT COALESCE(SUM(quantity * unit_price), 0)
        FROM invoice_items
        WHERE invoice_id = COALESCE(NEW.invoice_id, OLD.invoice_id)
    )
    WHERE id = COALESCE(NEW.invoice_id, OLD.invoice_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_invoice_total_on_item_change ON invoice_items;

CREATE TRIGGER update_invoice_total_on_item_change
AFTER INSERT OR UPDATE OR DELETE ON invoice_items
FOR EACH ROW
EXECUTE FUNCTION update_invoice_total();
