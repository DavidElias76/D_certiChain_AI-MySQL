export type UserRole = "admin" | "student" | "employer" | "systemAdmin" | "main_admin" | "alumni";

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  institution_id: number | null;
  institution_name: string | null;
  is_verified: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserResponse {
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

export interface QueryResponse {
  id: number;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  institution_id: number | null;
  institution_name: string | null;
}

export type OmitPasswordUser = Omit<User, "password">;

export type UserProfile = {
    username: string;
    email: string;
    role: UserRole;
    wallet_address?: string;
    institutionName?: string | ""; 
    isVerified?: boolean;
}

export interface UserCreateInput {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  registration_number?: string | null
  institution_id?: number | null;
  institution_name?: string;
  is_verified?: boolean;
}

export interface Institution {
  id: number;
  name: string;
  short_code: string;
  domain: string;
  wallet_address: string | null;
  description: string | null;
  is_active: boolean;
  blockchain_inst_tx_hash: string | null;
  institution_chain_id: string | null;
  wallet_registered_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface InstitutionCreateInput {
  name: string;
  short_code: string;
  domain: string;
  wallet_address?: string | null;
  description?: string | null;
  is_active?: boolean;
}

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
  certificate_number: string;
  certificate_hash: string;
  blockchain_tx_hash?: string;
  blockchain_certificate_id?: string;
  qr_code_url?: string;
  certificate_pdf_url?: string;
  issued_by: number;
  institution_id?: number;
  certificate_id: number
}

export interface CertificateResult {
  id: number;
  certificate_number: string;
  certificate_hash: string;
  status: string;
}

export type VerifierType = "student" | "employer" | "alumni" | "public";
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