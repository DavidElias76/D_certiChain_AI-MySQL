-- Connect to your database first (psql -d certichain_db), then run this.
-- Postgres has no CREATE DATABASE IF NOT EXISTS / USE statement.

-- Enum types must be created before the tables that use them
CREATE TYPE user_role AS ENUM ('admin', 'student', 'employer', 'systemAdmin');
CREATE TYPE certificate_status AS ENUM ('issued', 'revoked');
CREATE TYPE verifier_type_enum AS ENUM ('student', 'employer', 'public');
CREATE TYPE verification_result AS ENUM ('verified', 'invalid', 'revoked');

-- Reusable trigger function for updated_at columns
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE IF NOT EXISTS institutions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    short_code VARCHAR(10) NOT NULL UNIQUE,
    domain VARCHAR(100) NOT NULL UNIQUE,
    wallet_address VARCHAR(42) NOT NULL UNIQUE,
    description VARCHAR(500) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_institutions_name ON institutions (name);
CREATE INDEX idx_institutions_domain ON institutions (domain);
CREATE INDEX idx_institutions_short_code ON institutions (short_code);
CREATE INDEX idx_institutions_wallet ON institutions (wallet_address);

CREATE TRIGGER trg_institutions_updated_at
BEFORE UPDATE ON institutions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();


CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(80) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    wallet_address VARCHAR(42) NULL,
    institution_id INT NULL,
    institution_name VARCHAR(120) NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    verifyOtp INT DEFAULT NULL,
    verifyOtpExpiryAt TIMESTAMP DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_users_institution
        FOREIGN KEY (institution_id) REFERENCES institutions(id)
        ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX idx_users_email ON users (email);
CREATE INDEX idx_users_institution_role ON users (institution_id, role);
CREATE INDEX idx_users_wallet ON users (wallet_address);

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();


CREATE TABLE IF NOT EXISTS certificates (
    id SERIAL PRIMARY KEY,
    student_name VARCHAR(80) NOT NULL,
    registration_number VARCHAR(50) NOT NULL,
    student_email VARCHAR(255) NOT NULL,
    institution_name VARCHAR(120) NOT NULL,
    course VARCHAR(120) NOT NULL,
    degree VARCHAR(120) NOT NULL,
    graduation_date DATE NOT NULL,
    gpa VARCHAR(10) NULL,
    classification VARCHAR(60) NULL,
    skills JSONB NULL,

    certificate_number VARCHAR(50) NOT NULL UNIQUE,
    certificate_hash VARCHAR(66) NOT NULL UNIQUE,

    blockchain_tx_hash VARCHAR(66) NULL,
    blockchain_certificate_id VARCHAR(50) NULL,

    qr_code_url VARCHAR(500) NULL,
    certificate_pdf_url VARCHAR(500) NULL,

    status certificate_status NOT NULL DEFAULT 'issued',
    issued_by INT NOT NULL,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP NULL,
    revocation_reason VARCHAR(250) NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_certificates_issuer
        FOREIGN KEY (issued_by) REFERENCES users(id)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX idx_certificates_hash ON certificates (certificate_hash);
CREATE INDEX idx_certificates_number ON certificates (certificate_number);
CREATE INDEX idx_certificates_reg_inst ON certificates (registration_number, institution_name);
CREATE INDEX idx_certificates_status ON certificates (status);
CREATE INDEX idx_certificates_issued_by_date ON certificates (issued_by, issued_at);

CREATE TRIGGER trg_certificates_updated_at
BEFORE UPDATE ON certificates
FOR EACH ROW EXECUTE FUNCTION set_updated_at();


CREATE TABLE IF NOT EXISTS verification_logs (
    id SERIAL PRIMARY KEY,
    certificate_id INT NULL,
    verifier_id INT NULL,
    verifier_email VARCHAR(255) NULL,
    verifier_type verifier_type_enum NOT NULL DEFAULT 'public',
    submitted_hash VARCHAR(66) NOT NULL,
    blockchain_hash VARCHAR(66) NULL,
    result verification_result NOT NULL,
    blockchain_tx_hash VARCHAR(66) NULL,
    ip_address VARCHAR(45) NULL,
    user_agent VARCHAR(500) NULL,
    verified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_verification_logs_certificate
        FOREIGN KEY (certificate_id) REFERENCES certificates(id)
        ON DELETE SET NULL ON UPDATE CASCADE,

    CONSTRAINT fk_verification_logs_verifier
        FOREIGN KEY (verifier_id) REFERENCES users(id)
        ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX idx_verification_logs_cert_date ON verification_logs (certificate_id, verified_at);
CREATE INDEX idx_verification_logs_result ON verification_logs (result);
CREATE INDEX idx_verification_logs_type ON verification_logs (verifier_type);

CREATE TRIGGER trg_verification_logs_updated_at
BEFORE UPDATE ON verification_logs
FOR EACH ROW EXECUTE FUNCTION set_updated_at();


CREATE TABLE IF NOT EXISTS recommendations (
    id SERIAL PRIMARY KEY,
    certificate_id INT NOT NULL,
    user_id INT NOT NULL,
    source_profile JSONB NOT NULL,
    recommended_roles JSONB NULL DEFAULT '[]',
    suggested_skills JSONB NULL DEFAULT '[]',
    market_insights JSONB NULL DEFAULT '[]',
    job_matches JSONB NULL DEFAULT '[]',
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_recommendations_certificate
        FOREIGN KEY (certificate_id) REFERENCES certificates(id)
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT fk_recommendations_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX idx_recommendations_cert_date ON recommendations (certificate_id, generated_at);
CREATE INDEX idx_recommendations_user_date ON recommendations (user_id, generated_at);

CREATE TRIGGER trg_recommendations_updated_at
BEFORE UPDATE ON recommendations
FOR EACH ROW EXECUTE FUNCTION set_updated_at();