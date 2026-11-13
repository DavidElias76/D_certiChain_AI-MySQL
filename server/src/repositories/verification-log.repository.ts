import { pool } from "../config/db";

export type VerifierType = "student" | "employer" | "alumni" | "public";

export interface VerificationLogInput {
  certificate_id: number | null;
  verifier_id: number | null;
  verifier_email: string | null;
  verifier_type: VerifierType;
  verification_method: "certificate_number" | "file_upload" | "student_id";
  submitted_value: string | null;
  submitted_hash: string | null;
  match_type: "exact_file" | "number" | null;
  blockchain_hash: string | null;
  result: "verified" | "invalid" | "revoked";
  blockchain_tx_hash: string | null;
  ip_address: string | null;
  user_agent: string | null;
}

export const VerificationLogRepository = {
  async create(d: VerificationLogInput): Promise<void> {
    await pool.execute(
      `INSERT INTO verification_logs (
         certificate_id, verifier_id, verifier_email, verifier_type, verification_method,
         submitted_value, submitted_hash, match_type, blockchain_hash, result,
         blockchain_tx_hash, ip_address, user_agent
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        d.certificate_id, d.verifier_id, d.verifier_email, d.verifier_type, d.verification_method,
        d.submitted_value, d.submitted_hash, d.match_type, d.blockchain_hash, d.result,
        d.blockchain_tx_hash, d.ip_address, d.user_agent,
      ]
    );
  },
};