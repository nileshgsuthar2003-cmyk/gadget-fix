CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    starting_price DECIMAL(10, 2) NOT NULL,
    icon VARCHAR(50) DEFAULT 'smartphone'
);

CREATE TABLE repairs (
    id VARCHAR(50) PRIMARY KEY,
    user_id INT NOT NULL,
    device VARCHAR(255) NOT NULL,
    service VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    estimate DECIMAL(10, 2) NOT NULL,
    appointment_date DATETIME,
    method VARCHAR(50),
    payment_status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Seed Data
INSERT INTO users (id, name, phone) VALUES (1, 'Rahul Sharma', '+91 98765 43210');

INSERT INTO services (name, starting_price, icon) VALUES 
('Screen Replacement', 999.00, 'smartphone'),
('Battery Replacement', 799.00, 'battery'),
('Charging Repair', 499.00, 'plug');

INSERT INTO repairs (id, user_id, device, service, status, estimate, appointment_date, method, payment_status) VALUES
('REP-2026-9823A', 1, 'iPhone 13 Pro', 'Screen Replacement', 'Repairing', 4500.00, '2026-08-23 14:00:00', 'In-Store', 'Pending');
