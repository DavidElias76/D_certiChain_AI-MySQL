import { pool, DbRow, DbResult } from "../config/db";

export interface CertificateRecord {
  id: number;
  student_name: string;
  registration_number: string;
  student_email: string;
  institution_name: string;
  course: string;
  degree: string;
  graduation_date: Date;
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
  institution_id?: number
}

export interface CertificateCreateInput {
  student_name: string;
  registration_number: string;
  student_email: string;
  institution_name: string;
  course: string;
  degree: string;
  graduation_date: Date;
  gpa?: string;
  classification?: string;
  skills?: string[];
  certificate_number: string;
  certificate_hash: string;
  issued_by: number;
  institution_id?: number
}

export interface VerifyCertDetails {
  institution_id: string
  course: string
  degree: string
}

const LIST_COLUMNS = `
  id, student_name, registration_number, student_email, institution_id, institution_name,
  course, degree, DATE_FORMAT(graduation_date, '%Y-%m-%d') AS graduation_date,
  gpa, classification, skills, certificate_number, certificate_hash,
  blockchain_tx_hash, blockchain_certificate_id, certificate_pdf_url,
  status, issued_by, issued_at, revoked_at, revocation_reason, created_at, updated_at`;

const VERIFY_COLUMNS = `
  id, institution_id, institution_name, student_name, student_email, registration_number,
  course, degree, DATE_FORMAT(graduation_date, '%Y-%m-%d') AS graduation_date,
  gpa, classification, certificate_number, certificate_hash, blockchain_tx_hash,
  status, issued_at, revoked_at`;


export const CertificateRepository = {

  async count(): Promise<number> {
    const [rows] = await pool.execute<DbRow[]>(
      "SELECT COUNT(*) AS count FROM certificates"
    );
    return Number(rows[0]?.count ?? 0);
  },

   async findAll(): Promise<CertificateRecord[]> {
   const [rows] = await pool.execute<DbRow[]>(
      `SELECT ${LIST_COLUMNS} FROM certificates ORDER BY issued_at DESC`
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

  async findCertificateById(certId: number): Promise<VerifyCertDetails | null> {
    const [rows] = await pool.execute<DbRow[]>(
      `SELECT course, degree, institution_id FROM certificates WHERE id = ?`,
      [certId]
    );
    return rows.length ? (rows[0] as VerifyCertDetails) : null;
  },

  async findByCertificateNumber(certificateNumber: string): Promise<CertificateRecord | null> {
    const [rows] = await pool.execute<DbRow[]>(
      `SELECT * FROM certificates WHERE certificate_number = ? LIMIT 1`,
      [certificateNumber]
    );
    return rows.length ? (rows[0] as CertificateRecord) : null;
  },

  async findForVerificationByNumber(certificateNumber: string) {
    const [rows]: any = await pool.execute(
      `SELECT id, institution_id, institution_name, student_name, student_email, registration_number,
              course, degree, DATE_FORMAT(graduation_date, '%Y-%m-%d') AS graduation_date,
              gpa, classification, certificate_number, certificate_hash, blockchain_tx_hash,
              status, issued_at, revoked_at
       FROM certificates WHERE certificate_number = ? LIMIT 1`,
      [certificateNumber]
    );
    return rows[0] ?? null;
  },

  async findByIssuedBy(issuedBy: number): Promise<CertificateRecord[]> {
    const [rows] = await pool.execute<DbRow[]>(
      `SELECT ${LIST_COLUMNS} FROM certificates WHERE issued_by = ? ORDER BY issued_at DESC`,
      [issuedBy]
    );
    return rows as CertificateRecord[];
  },

  async findByStudentEmail(email: string): Promise<CertificateRecord[]> {
    const [rows] = await pool.execute<DbRow[]>(
      `SELECT ${LIST_COLUMNS} FROM certificates WHERE student_email = ? ORDER BY issued_at DESC`,
      [email.toLowerCase()]
    );
    return rows as CertificateRecord[];
  },

  async findByRegistrationNumber(regNumber: string): Promise<CertificateRecord[]> {
    const [rows] = await pool.execute<DbRow[]>(
      `SELECT ${LIST_COLUMNS} FROM certificates WHERE registration_number = ? ORDER BY issued_at DESC`,
      [regNumber]
    );
    return rows as CertificateRecord[];
  },

  async findByHash(hash: string): Promise<CertificateRecord | null> {
      const [rows] = await pool.execute<DbRow[]>(
          `SELECT * FROM certificates WHERE certificate_hash = ?`,
          [hash]
      );
      return rows.length ? (rows[0] as CertificateRecord) : null;
  },

  async savePdfInfo(id: number, url: string, hash: string): Promise<void> {
      await pool.execute(
        "UPDATE certificates SET certificate_pdf_url = ?, certificate_pdf_hash = ? WHERE id = ?",
        [url, hash, id]
      );
  },

  async findPdfSourceById(id: number) {
    const [rows]: any = await pool.execute(
      `SELECT id, institution_id, institution_name, student_name, student_email,
              course, degree, DATE_FORMAT(graduation_date, '%Y-%m-%d') AS graduation_date,
              gpa, classification, certificate_number, certificate_pdf_hash, created_at
       FROM certificates WHERE id = ? LIMIT 1`,
      [id]
    );
    return rows[0] ?? null;
  },

  async existsDuplicate(data: {
      institution_id: number;
      registration_number: string;
      course: string;
      degree: string;
    }): Promise<boolean> {
      const [rows] = await pool.execute<DbRow[]>(
        `SELECT id FROM certificates
        WHERE institution_id = ?
          AND registration_number = ?
          AND course = ?
          AND degree = ?
          AND status <> 'revoked'
        LIMIT 1`,
        [data.institution_id, data.registration_number, data.course, data.degree]
      );
      return rows.length > 0;
  },

  async findByInstitution(institutionId: number): Promise<CertificateRecord[]> {
    const [rows] = await pool.execute<DbRow[]>(
      `SELECT ${LIST_COLUMNS} FROM certificates WHERE institution_id = ? ORDER BY issued_at DESC`,
      [institutionId]
    );
    return rows as CertificateRecord[];
  },

    async findForVerificationByNumberUpload(certificateNumber: string) {
    const [rows]: any = await pool.execute(
      `SELECT ${VERIFY_COLUMNS} FROM certificates WHERE certificate_number = ? LIMIT 1`,
      [certificateNumber]
    );
    return rows[0] ?? null;
  },

  async findForVerificationByPdfHash(pdfHash: string) {
    const [rows]: any = await pool.execute(
      `SELECT ${VERIFY_COLUMNS} FROM certificates WHERE certificate_pdf_hash = ? LIMIT 1`,
      [pdfHash]
    );
    return rows[0] ?? null;
  },

  async createWithDatabase(data: CertificateCreateInput & {
    blockchain_tx_hash?: string;
    blockchain_certificate_id?: string;
    institution_id: number
  }): Promise<number> {
      const [result] = await pool.execute<DbResult>(
          `INSERT INTO certificates (
              student_name, registration_number, student_email, institution_name,
              course, degree, graduation_date, gpa, classification, skills,
              certificate_number, certificate_hash,
              blockchain_tx_hash, blockchain_certificate_id,
              issued_by, institution_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
              data.student_name,
              data.registration_number,
              data.student_email,
              data.institution_name,
              data.course,
              data.degree,
              data.graduation_date.toISOString().slice(0, 10),
              data.gpa ?? null,
              data.classification ?? null,
              data.skills ? JSON.stringify(data.skills) : null,
              data.certificate_number,
              data.certificate_hash,
              data.blockchain_tx_hash ?? null,
              data.blockchain_certificate_id ?? null,
              data.issued_by,
              data.institution_id,
          ]
      );
      return result.insertId;
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

  async deleteCertificate(id: number): Promise<boolean> {
    const [result] = await pool.execute<DbResult>(
      "DELETE FROM certificates WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  },

};
