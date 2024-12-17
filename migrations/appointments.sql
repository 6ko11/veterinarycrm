-- Drop the existing table if it exists
DROP TABLE IF EXISTS appointments;

-- Create the appointments table with the updated schema
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    start TIMESTAMP WITH TIME ZONE NOT NULL,
    "end" TIMESTAMP WITH TIME ZONE NOT NULL,
    pet VARCHAR(255) NOT NULL,
    owner VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    notes TEXT,
    recurring BOOLEAN DEFAULT false,
    recurrence_pattern VARCHAR(50)
);
