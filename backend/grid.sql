CREATE DATABASE IF NOT EXISTS grid;

USE grid;

-- BCNF step 1: Isolate device types to prevent duplication
CREATE TABLE IF NOT EXISTS device_types (
    type_id INT AUTO_INCREMENT PRIMARY KEY,
    type_name VARCHAR(50) UNIQUE NOT NULL
);

-- Pre-populate known types
INSERT IGNORE INTO device_types (type_name) VALUES ('Residential'), ('Commercial'), ('Industrial');

-- BCNF step 2: Devices only depend on the device_id
CREATE TABLE IF NOT EXISTS devices (
    device_id VARCHAR(50) PRIMARY KEY,
    device_name VARCHAR(100) NOT NULL,
    type_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (type_id) REFERENCES device_types(type_id) ON DELETE RESTRICT
);

-- BCNF step 3: Track authentication separately
CREATE TABLE IF NOT EXISTS authentication_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(50) NOT NULL,
    token TEXT NOT NULL,
    issued_at TIMESTAMP NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    FOREIGN KEY (device_id) REFERENCES devices(device_id) ON DELETE CASCADE
);

-- BCNF step 4: Energy readings independent of devices properties
CREATE TABLE IF NOT EXISTS energy_readings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(50) NOT NULL,
    consumption_kwh FLOAT NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    signature VARCHAR(255),
    is_attack BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (device_id) REFERENCES devices(device_id) ON DELETE CASCADE
);

-- BCNF step 5: Unified attack log replacing separate fdi/crypto/jwt tables
-- Attack type determines the details structure constraint
CREATE TABLE IF NOT EXISTS attack_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    device_id VARCHAR(50) NOT NULL,
    attack_category ENUM('FDI', 'CRYPTO', 'JWT', 'REPLAY') NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    details TEXT,
    mitigated BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (device_id) REFERENCES devices(device_id) ON DELETE CASCADE
);
