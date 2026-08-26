-- Active: 1782931209095@@127.0.0.1@3306
CREATE DATABASE IF NOT EXISTS certichain_db;
USE certichain_db;

CREATE TABLE IF NOT EXISTS institutions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200)  NOT NULL,
    short_code VARCHAR(10)   NOT NULL UNIQUE,
    domain VARCHAR(100)  NOT NULL UNIQUE,
    wallet_address VARCHAR(42) NOT NULL UNIQUE,
    description VARCHAR(500)  NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_institutions_name     (name),
    INDEX idx_institutions_domain    (domain),
    INDEX idx_institutions_wallet   (wallet_address)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE institutions
ADD blockchain_inst_tx_hash VARCHAR(255) DEFAULT NULL;

ALTER TABLE institutions
  ADD COLUMN wallet_type ENUM('server_custody', 'metamask') NOT NULL DEFAULT 'server_custody',
  ADD COLUMN wallet_private_key_encrypted TEXT NULL;  -- ONLY for server_custody institutions

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(80)   NOT NULL,
    email VARCHAR(255)  NOT NULL UNIQUE,
    password VARCHAR(255)  NOT NULL,
    role ENUM('admin','student','employer','systemAdmin') NOT NULL DEFAULT 'student',
    wallet_address VARCHAR(42)   NULL,
    institution_id INT NULL,
    institution_name  VARCHAR(120) NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    verifyOtp INT DEFAULT NULL,
    verifyOtpExpiryAt DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_users_institution
        FOREIGN KEY (institution_id) REFERENCES institutions(id)
        ON DELETE SET NULL ON UPDATE CASCADE,

    INDEX idx_users_email (email),
    INDEX idx_users_institution_role (institution_id, role),
    INDEX idx_users_wallet (wallet_address)
) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE users
ADD COLUMN verifyOtp INT DEFAULT NULL,
ADD COLUMN verifyOtpExpiryAt DATETIME DEFAULT NULL;

CREATE TABLE IF NOT EXISTS certificates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_name VARCHAR(80)   NOT NULL,
    registration_number VARCHAR(50)  NOT NULL,
    student_email VARCHAR(255)  NOT NULL,
    institution_name VARCHAR(120)  NOT NULL,
    course VARCHAR(120)  NOT NULL,
    degree VARCHAR(120)  NOT NULL,
    graduation_date DATE NOT NULL,
    gpa VARCHAR(10) NULL,
    classification VARCHAR(60) NULL,
    skills JSON NULL,

    certificate_number VARCHAR(50)  NOT NULL UNIQUE,
    certificate_hash VARCHAR(66)   NOT NULL UNIQUE,

    blockchain_tx_hash VARCHAR(66)   NULL,
    blockchain_certificate_id VARCHAR(50)  NULL,

    qr_code_url VARCHAR(500)  NULL,
    certificate_pdf_url VARCHAR(500)  NULL,

    status ENUM('issued','revoked') NOT NULL DEFAULT 'issued',
    issued_by INT NOT NULL,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP NULL,
    revocation_reason VARCHAR(250)   NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_certificates_issuer
        FOREIGN KEY (issued_by) REFERENCES users(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,

    INDEX idx_certificates_hash (certificate_hash),
    INDEX idx_certificates_number (certificate_number),
    INDEX idx_certificates_reg_inst (registration_number, institution_name),
    INDEX idx_certificates_status (status),
    INDEX idx_certificates_issued_by_date (issued_by, issued_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- This will need to be confirmed and check if this is the schema that we are going to be using
CREATE TABLE IF NOT EXISTS verification_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    certificate_id INT NULL,
    verifier_id INT NULL,
    verifier_email VARCHAR(255)  NULL,
    verifier_type ENUM('student','employer','public') NOT NULL DEFAULT 'public',
    submitted_hash VARCHAR(66) NOT NULL,
    blockchain_hash VARCHAR(66)  NULL,
    result ENUM('verified','invalid','revoked') NOT NULL,
    blockchain_tx_hash  VARCHAR(66)   NULL,
    ip_address VARCHAR(45) NULL,
    user_agent VARCHAR(500) NULL,
    verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_verification_logs_certificate
        FOREIGN KEY (certificate_id) REFERENCES certificates(id)
        ON DELETE SET NULL ON UPDATE CASCADE,

    CONSTRAINT fk_verification_logs_verifier
        FOREIGN KEY (verifier_id) REFERENCES users(id)
        ON DELETE SET NULL ON UPDATE CASCADE,

    INDEX idx_verification_logs_cert_date (certificate_id, verified_at),
    INDEX idx_verification_logs_result (result),
    INDEX idx_verification_logs_type (verifier_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS recommendations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    certificate_id INT NOT NULL,
    user_id INT NOT NULL,
    source_profile JSON NOT NULL,
    recommended_roles JSON NULL DEFAULT '[]',
    suggested_skills JSON NULL DEFAULT '[]',
    market_insights JSON NULL DEFAULT '[]',
    job_matches JSON NULL DEFAULT '[]',
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_recommendations_certificate
        FOREIGN KEY (certificate_id) REFERENCES certificates(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_recommendations_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE SET NULL ON UPDATE CASCADE,

    INDEX idx_recommendations_cert_date  (certificate_id, generated_at),
    INDEX idx_recommendations_user_date  (user_id, generated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
