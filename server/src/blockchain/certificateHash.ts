import { createHash } from "node:crypto";
import type { CertificateInput, CertificateHashPayload } from "../types/blockchain";

const normalizeText = (value: string): string => value.trim().toLowerCase(); // This functio takea a value and returns it into lowercase

const normalizeSkills = (skills: string[] | undefined): string[] => {
  if (!skills || skills.length === 0) {
    return [];
  }

  return [...skills]
    .map((skill) => normalizeText(skill))
    .filter((skill) => skill.length > 0)
    .sort();
};

export const buildCertificateFingerprint = (certificate: CertificateInput): string => {
  const normalizedPayload = {
    institutionId: normalizeText(certificate.institutionId),
    studentName: normalizeText(certificate.studentName),
    registrationNumber: normalizeText(certificate.registrationNumber),
    course: normalizeText(certificate.course),
    degree: normalizeText(certificate.degree),
    graduationDate: normalizeText(certificate.graduationDate),
    institutionName: normalizeText(certificate.institutionName ?? ""),
    gpa: normalizeText(certificate.gpa ?? ""),
    classification: normalizeText(certificate.classification ?? ""),
    skills: normalizeSkills(certificate.skills),
  };

  return JSON.stringify(normalizedPayload); 
};

export const createCertificateHash = (certificate: CertificateInput): CertificateHashPayload => {
  const fingerprint = buildCertificateFingerprint(certificate);
  const certificateHash = `0x${createHash("sha256").update(fingerprint).digest("hex")}`;

  return { fingerprint, certificateHash };
};

