-- Drop existing tables if they exist
DROP TABLE IF EXISTS invoice_items CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP TABLE IF EXISTS medical_records CASCADE;
DROP TABLE IF EXISTS pets CASCADE;
DROP TABLE IF EXISTS clients CASCADE;

-- Create clients table
CREATE TABLE clients (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create pets table
CREATE TABLE pets (
    id BIGSERIAL PRIMARY KEY,
    client_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    species VARCHAR(100),
    breed VARCHAR(100),
    age INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_client
        FOREIGN KEY (client_id)
        REFERENCES clients(id)
        ON DELETE CASCADE
);

-- Create medical_records table
CREATE TABLE medical_records (
    id BIGSERIAL PRIMARY KEY,
    pet_id BIGINT NOT NULL,
    date DATE NOT NULL,
    diagnosis TEXT NOT NULL,
    treatment TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pet
        FOREIGN KEY (pet_id)
        REFERENCES pets(id)
        ON DELETE CASCADE
);

-- Create invoices table
CREATE TABLE invoices (
    id BIGSERIAL PRIMARY KEY,
    client_id BIGINT NOT NULL,
    pet_id BIGINT NOT NULL,
    date DATE NOT NULL,
    total DECIMAL(10,2) NOT NULL DEFAULT 0,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_client
        FOREIGN KEY (client_id)
        REFERENCES clients(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_pet
        FOREIGN KEY (pet_id)
        REFERENCES pets(id)
        ON DELETE CASCADE
);

-- Create invoice_items table
CREATE TABLE invoice_items (
    id BIGSERIAL PRIMARY KEY,
    invoice_id BIGINT NOT NULL,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_invoice
        FOREIGN KEY (invoice_id)
        REFERENCES invoices(id)
        ON DELETE CASCADE
);

-- Insert sample clients
INSERT INTO clients (name, email, phone) VALUES
('John Smith', 'john.smith@email.com', '555-0101'),
('Sarah Johnson', 'sarah.j@email.com', '555-0102'),
('Michael Brown', 'mbrown@email.com', '555-0103'),
('Emma Wilson', 'emma.w@email.com', '555-0104'),
('David Lee', 'david.lee@email.com', '555-0105');

-- Insert sample pets
INSERT INTO pets (client_id, name, species, breed, age) VALUES
(1, 'Max', 'Dog', 'Golden Retriever', 5),
(1, 'Luna', 'Cat', 'Siamese', 3),
(2, 'Bella', 'Dog', 'Labrador', 2),
(3, 'Charlie', 'Dog', 'French Bulldog', 4),
(3, 'Milo', 'Cat', 'Persian', 2),
(4, 'Lucy', 'Dog', 'Poodle', 6),
(5, 'Oliver', 'Cat', 'Maine Coon', 4);

-- Insert sample medical records
INSERT INTO medical_records (pet_id, date, diagnosis, treatment, notes) VALUES
(1, '2024-12-01', 'Annual Checkup', 'Vaccinations updated', 'Healthy overall, slight tartar buildup'),
(1, '2024-12-10', 'Ear Infection', 'Prescribed ear drops', 'Follow up in 2 weeks'),
(2, '2024-12-05', 'Dental Cleaning', 'Full dental cleaning performed', 'No complications'),
(3, '2024-12-07', 'Spaying', 'Routine spay surgery', 'Recovery normal'),
(4, '2024-12-08', 'Skin Allergy', 'Prescribed antihistamines', 'Recommend hypoallergenic diet'),
(5, '2024-12-09', 'Vaccination', 'Core vaccines administered', 'Due for booster in 3 months'),
(6, '2024-12-11', 'Injury', 'Wound cleaning and bandaging', 'Monitor for infection');

-- Insert sample invoices
INSERT INTO invoices (client_id, pet_id, date, total, status) VALUES
(1, 1, '2024-12-01', 150.00, 'paid'),
(1, 1, '2024-12-10', 85.00, 'pending'),
(2, 3, '2024-12-07', 300.00, 'paid'),
(3, 4, '2024-12-08', 75.00, 'paid'),
(4, 6, '2024-12-11', 120.00, 'pending');

-- Insert sample invoice items
INSERT INTO invoice_items (invoice_id, description, quantity, unit_price) VALUES
(1, 'Annual Checkup', 1, 75.00),
(1, 'Vaccinations', 3, 25.00),
(2, 'Consultation', 1, 50.00),
(2, 'Ear Drops Medication', 1, 35.00),
(3, 'Spay Surgery', 1, 250.00),
(3, 'Post-op Medication', 1, 50.00),
(4, 'Consultation', 1, 50.00),
(4, 'Antihistamine Prescription', 1, 25.00),
(5, 'Emergency Visit', 1, 100.00),
(5, 'Bandaging Supplies', 1, 20.00);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables
DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pets_updated_at ON pets;
CREATE TRIGGER update_pets_updated_at
    BEFORE UPDATE ON pets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_medical_records_updated_at ON medical_records;
CREATE TRIGGER update_medical_records_updated_at
    BEFORE UPDATE ON medical_records
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_invoice_items_updated_at ON invoice_items;
CREATE TRIGGER update_invoice_items_updated_at
    BEFORE UPDATE ON invoice_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users" ON clients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert access for all users" ON clients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON clients FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Enable delete access for all users" ON clients FOR DELETE TO authenticated USING (true);

CREATE POLICY "Enable read access for all users" ON pets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert access for all users" ON pets FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON pets FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Enable delete access for all users" ON pets FOR DELETE TO authenticated USING (true);

CREATE POLICY "Enable read access for all users" ON medical_records FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert access for all users" ON medical_records FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON medical_records FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Enable delete access for all users" ON medical_records FOR DELETE TO authenticated USING (true);

CREATE POLICY "Enable read access for all users" ON invoices FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert access for all users" ON invoices FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON invoices FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Enable delete access for all users" ON invoices FOR DELETE TO authenticated USING (true);

CREATE POLICY "Enable read access for all users" ON invoice_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable insert access for all users" ON invoice_items FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON invoice_items FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Enable delete access for all users" ON invoice_items FOR DELETE TO authenticated USING (true);

-- Create indexes for better performance
CREATE INDEX idx_pets_client_id ON pets(client_id);
CREATE INDEX idx_medical_records_pet_id ON medical_records(pet_id);
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_pet_id ON invoices(pet_id);
CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
