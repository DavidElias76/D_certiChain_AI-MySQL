import crypto from "crypto";
import { CertificateRepository, CertificateCreateInput } from "../repositories/certificate.repository";
import type { CustomError } from "../types/error.types";

export interface IssueCertificateInput {
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
  issued_by: number;
}

export interface CertificateResult {
  id: number;
  certificate_number: string;
  certificate_hash: string;
  status: string;
}

function generateCertificateHash(data: Omit<IssueCertificateInput, "issued_by">): string {
  const payload = [
    data.student_name,
    data.registration_number,
    data.student_email,
    data.institution_name,
    data.course,
    data.degree,
    data.graduation_date,
    Date.now().toString(),
  ].join("|");
  return "0x" + crypto.createHash("sha256").update(payload).digest("hex");
}

function generateCertificateNumber(
  institutionName: string,
  studentName: string,
  graduationDate: string
): string {
  const prefix = institutionName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 4);
  const year = new Date(graduationDate).getFullYear();
  const rand = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `${prefix}-${year}-${rand}`;
}

export const CertificateService = {
  async issueCertificate(
    input: IssueCertificateInput
  ): Promise<CertificateResult> {
    // Check for duplicate hash
    const duplicateData: Omit<IssueCertificateInput, "issued_by"> = {
      student_name: input.student_name,
      registration_number: input.registration_number,
      student_email: input.student_email,
      institution_name: input.institution_name,
      course: input.course,
      degree: input.degree,
      graduation_date: input.graduation_date,
    };

    // Generate hash and cert number
    const certificate_hash = generateCertificateHash(duplicateData);
    const certificate_number = generateCertificateNumber(
      input.institution_name,
      input.student_name,
      input.graduation_date
    );

    const data: CertificateCreateInput = {
      ...input,
      certificate_hash,
      certificate_number,
    };

    const id = await CertificateRepository.create(data);

    return {
      id,
      certificate_number,
      certificate_hash,
      status: "issued",
    };
  },

  async getAllCertificates(): Promise<ReturnType<typeof CertificateRepository.findAll>> {
    return CertificateRepository.findAll();
  },

  async getCertificatesByIssuer(issuedBy: number) {
    return CertificateRepository.findByIssuedBy(issuedBy);
  },

  async getCertificatesByStudentEmail(email: string) {
    return CertificateRepository.findByStudentEmail(email);
  },

  async getCertificatesByRegistration(regNumber: string) {
    return CertificateRepository.findByRegistrationNumber(regNumber);
  },

  async revokeCertificate(id: number, reason: string): Promise<void> {
    const cert = await CertificateRepository.findById(id);
    if (!cert) {
      const err = new Error("Certificate not found") as CustomError;
      err.statusCode = 404;
      throw err;
    }
    if (cert.status === "revoked") {
      const err = new Error("Certificate is already revoked") as CustomError;
      err.statusCode = 400;
      throw err;
    }
    const revoked = await CertificateRepository.revoke(id, reason);
    if (!revoked) {
      const err = new Error("Failed to revoke certificate") as CustomError;
      err.statusCode = 500;
      throw err;
    }
  },

  async getCertificateById(id: number) {
    return CertificateRepository.findById(id);
  },
};
