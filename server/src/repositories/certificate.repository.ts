import { pool, DbRow, DbResult } from "../config/db";

export interface CertificateRecord {
  id: number;
  student_name: string;
  registration_number: string;
  student_email: string;
  institution_name: string;
  course: string;
  degree: string;
  graduation_date: string;
  gpa: string | null;
  classification: string | null;
  skills: string | null;
  certificate_number: string;
  certificate_hash: string;
  blockchain_tx_hash: string | null;
  blockchain_certificate_id: string | null;
  qr_code_url: string | null;
  certificate_pdf_url: string | null;
  status: "issued" | "revoked";
  issued_by: number;
  issued_at: string;
  revoked_at: string | null;
  revocation_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface CertificateCreateInput {
  student_name: string;
  registration_number: string;
  student_email: string;
  institution_name: string;
  course: string;
  degree: string;
  graduation_date: string;
  gpa?: string;
  classification?: string;
  skills?: string[];
  certificate_number: string;
  certificate_hash: string;
  issued_by: number;
}

export const CertificateRepository = {
  async findAll(): Promise<CertificateRecord[]> {
    const [rows] = await pool.execute<DbRow[]>(
      `SELECT * FROM certificates ORDER BY issued_at DESC`
    );
    return rows as CertificateRecord[];
  },

  async findById(id: number): Promise<CertificateRecord | null> {
    const [rows] = await pool.execute<DbRow[]>(
      `SELECT * FROM certificates WHERE id = ?`,
      [id]
    );
    return rows.length ? (rows[0] as CertificateRecord) : null;
  },

  async findByIssuedBy(issuedBy: number): Promise<CertificateRecord[]> {
    const [rows] = await pool.execute<DbRow[]>(
      `SELECT * FROM certificates WHERE issued_by = ? ORDER BY issued_at DESC`,
      [issuedBy]
    );
    return rows as CertificateRecord[];
  },

  async findByStudentEmail(email: string): Promise<CertificateRecord[]> {
    const [rows] = await pool.execute<DbRow[]>(
      `SELECT * FROM certificates WHERE student_email = ? ORDER BY issued_at DESC`,
      [email.toLowerCase()]
    );
    return rows as CertificateRecord[];
  },

  async findByRegistrationNumber(regNumber: string): Promise<CertificateRecord[]> {
    const [rows] = await pool.execute<DbRow[]>(
      `SELECT * FROM certificates WHERE registration_number = ? ORDER BY issued_at DESC`,
      [regNumber]
    );
    return rows as CertificateRecord[];
  },

  async create(data: CertificateCreateInput): Promise<number> {
    const [result] = await pool.execute<DbResult>(
      `INSERT INTO certificates (
        student_name, registration_number, student_email, institution_name,
        course, degree, graduation_date, gpa, classification, skills,
        certificate_number, certificate_hash, issued_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.student_name,
        data.registration_number,
        data.student_email,
        data.institution_name,
        data.course,
        data.degree,
        data.graduation_date,
        data.gpa ?? null,
        data.classification ?? null,
        data.skills ? JSON.stringify(data.skills) : null,
        data.certificate_number,
        data.certificate_hash,
        data.issued_by,
      ]
    );
    return result.insertId;
  },

  async revoke(
    id: number,
    reason: string
  ): Promise<boolean> {
    const [result] = await pool.execute<DbResult>(
      `UPDATE certificates
       SET status = 'revoked', revoked_at = NOW(), revocation_reason = ?
       WHERE id = ? AND status = 'issued'`,
      [reason, id]
    );
    return result.affectedRows > 0;
  },

  async existsByHash(hash: string): Promise<boolean> {
    const [rows] = await pool.execute<DbRow[]>(
      `SELECT 1 FROM certificates WHERE certificate_hash = ? LIMIT 1`,
      [hash]
    );
    return rows.length > 0;
  },

  async existsByNumber(certNumber: string): Promise<boolean> {
    const [rows] = await pool.execute<DbRow[]>(
      `SELECT 1 FROM certificates WHERE certificate_number = ? LIMIT 1`,
      [certNumber]
    );
    return rows.length > 0;
  },
};
