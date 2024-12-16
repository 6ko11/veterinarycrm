CREATE TABLE appointments (
    id INT PRIMARY KEY,
    patient_id INT,
    owner_name VARCHAR(255),
    date DATE,
    time TIME,
    notes TEXT
);
