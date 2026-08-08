export type UserRole = "admin" | "student" | "employer" | "systemAdmin";

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  wallet_address: string | null;
  institution_id: number | null;
  institution_name: string | null;
  is_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export type OmitPasswordUser = Omit<User, "password">;

export type UserProfile = {
    username: string;
    email: string;
    role: UserRole;
    wallet_address?: string;
    institutionName?: string | ""; // This let the employer logs in without the institution name
    isVerified?: boolean;
}

export interface UserCreateInput {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  institution_id?: number;
  institution_name?: string;
  wallet_address?: string;
  is_verified?: boolean; // This wil use the Otp code that will be sent to the line
}

// institution
export interface Institution {
  id: number;
  name: string;
  short_code: string;
  domain: string;
  wallet_address: string;
  description: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface InstitutionCreateInput {
  name: string;
  short_code: string;
  domain: string;
  wallet_address: string;
  description?: string ;
  is_active?: boolean;
}

// certificate
export type CertificateStatus = "issued" | "revoked";

export interface Certificate {
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
  skills: string[];
  certificate_number: string;
  certificate_hash: string;
  blockchain_tx_hash: string | null;
  blockchain_certificate_id: string | null;
  qr_code_url: string | null;
  certificate_pdf_url: string | null;
  status: CertificateStatus;
  issued_by: number;
  issued_at: Date;
  revoked_at: Date | null;
  revocation_reason: string | null;
  created_at: Date;
  updated_at: Date;
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
  blockchain_tx_hash?: string;
  blockchain_certificate_id?: string;
  qr_code_url?: string;
  certificate_pdf_url?: string;
  issued_by: number;
}

// verifications logs
export type VerifierType = "student" | "employer" | "public";
export type VerificationResult = "verified" | "invalid" | "revoked";

export interface VerificationLog {
  id: number;
  certificate_id: number | null;
  verifier_id: number | null;
  verifier_email: string | null;
  verifier_type: VerifierType;
  submitted_hash: string;
  blockchain_hash: string | null;
  result: VerificationResult;
  blockchain_tx_hash: string | null;
  ip_address: string | null;
  user_agent: string | null;
  verified_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface VerificationLogCreateInput {
  certificate_id?: number;
  verifier_id?: number;
  verifier_email?: string;
  verifier_type: VerifierType;
  submitted_hash: string;
  blockchain_hash?: string;
  result: VerificationResult;
  blockchain_tx_hash?: string;
  ip_address?: string;
  user_agent?: string;
}

//  Recommendation types 
export interface SourceProfile {
  degree: string;
  course: string;
  gpa?: string;
  skills: string[];
  location_preference?: string;
}

export interface RecommendedRole {
  title: string;
  match_score: number;
  reason: string;
  required_skills: string[];
  missing_skills: string[];
}

export interface JobMatch {
  title: string;
  company: string;
  location?: string;
  url?: string;
  salary_range?: string;
  match_score: number;
}

export interface Recommendation {
  id: number;
  certificate_id: number;
  user_id: number | null;
  source_profile: SourceProfile;
  recommended_roles: RecommendedRole[];
  suggested_skills: string[];
  market_insights: string[];
  job_matches: JobMatch[];
  generated_at: Date;
  created_at: Date;
  updated_at: Date;
}

export interface RecommendationCreateInput {
  certificate_id: number;
  user_id?: number;
  source_profile: SourceProfile;
  recommended_roles?: RecommendedRole[];
  suggested_skills?: string[];
  market_insights?: string[];
  job_matches?: JobMatch[];
}