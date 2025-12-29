-- Open XAMPP and in terminal type:
-- mysql -u root

-- ECL Salary Database Schema for MySQL

-- Create database
CREATE DATABASE IF NOT EXISTS payroll_data
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE payroll_data;

-- Employee Master Table
CREATE TABLE IF NOT EXISTS employee_master (
    person_no              VARCHAR(100) NOT NULL,
    employee_name          TEXT,
    designation            TEXT,

    month_year             DATE NOT NULL,          
    for_period             TEXT,

    personnel_area         VARCHAR(100) NOT NULL,
    personnel_subarea      TEXT,

    employee_group         TEXT,
    employee_subgroup      TEXT,

    pay_scale_type         TEXT,
    pay_scale_area         TEXT,
    pay_scale_group        TEXT,
    pay_scale_level        TEXT,

    bank_account_number    TEXT,
    ifsc_code              TEXT,
    pf_number              TEXT,
    aadhar_no              TEXT,
    pan_no                 TEXT,

    profit_center          TEXT,
    cost_center            TEXT,

    basic_pay              DECIMAL(15,2),
    basic_pay_adjustment   DECIMAL(15,2),

    created_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at             TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (person_no, personnel_area, month_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add indexes for better performance
CREATE INDEX idx_person_no ON employee_master(person_no);
CREATE INDEX idx_personnel_area ON employee_master(personnel_area);
CREATE INDEX idx_month_year ON employee_master(month_year);

-- Area Master Table
CREATE TABLE IF NOT EXISTS area_master (
    area_id            INT AUTO_INCREMENT PRIMARY KEY,
    personnel_area     TEXT NOT NULL,
    personnel_subarea  TEXT,
    created_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE area_master
MODIFY personnel_area VARCHAR(100) NOT NULL;


-- Salary Register Template Table
-- Note: Year-specific tables (salaryregister2024, salaryregister2025, etc.) 
-- will be created dynamically by the application with additional columns
CREATE TABLE IF NOT EXISTS salaryregister (
    person_no        VARCHAR(100) NOT NULL,
    employee_name    TEXT,
    designation      TEXT,
    month_year       DATE NOT NULL,
    personnel_area   VARCHAR(100) NOT NULL,
    year             INT NOT NULL,

    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (person_no, personnel_area, month_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add indexes for salary register
CREATE INDEX idx_salary_person_no ON salaryregister(person_no);
CREATE INDEX idx_salary_personnel_area ON salaryregister(personnel_area);
CREATE INDEX idx_salary_year ON salaryregister(year);

-- Verify tables created
SHOW TABLES;

-- Show structure of employee_master
DESCRIBE employee_master;