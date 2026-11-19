
export interface CertificateInput {
  institutionId: string;   
  studentName: string;
  registrationNumber: string;
  course: string;
  degree: string;
  graduationDate: string;   
  institutionName?: string;
  gpa?: string;
  classification?: string;
  skills?: string[];
}

export interface CertificateHashPayload {
  fingerprint: string;
  certificateHash: string; 
}


export interface OnChainCertificateRecord {
  certificateHash: string;
  institutionId: string;   
  issuer: string;          
  issuedAt: number;        
  revokedAt: number;
  revoked: boolean;
  exists: boolean;
}
