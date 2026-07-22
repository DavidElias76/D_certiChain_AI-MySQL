/**
 * Input for building a certificate hash.
 * Field names MUST match ICertificate exactly so the hash fingerprint
 * can be regenerated from stored data during verification.
 */
export interface CertificateInput {
  institutionId: string;   // bytes32 — institution's on-chain ID
  studentName: string;
  registrationNumber: string;
  course: string;
  degree: string;
  graduationDate: string;   // ISO date string, e.g. "2024-06-15"
  institutionName?: string;
  gpa?: string;
  classification?: string;
  skills?: string[];
}

export interface CertificateHashPayload {
  fingerprint: string;
  certificateHash: string; // 0x-prefixed SHA-256
}

/**
 * On-chain certificate record returned by the smart contract.
 */
export interface OnChainCertificateRecord {
  certificateHash: string;
  institutionId: string;   // bytes32 — which institution issued this cert
  issuer: string;          // address of the admin who signed the tx
  issuedAt: number;        // block timestamp
  revokedAt: number;
  revoked: boolean;
  exists: boolean;
}
