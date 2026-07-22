import { createHash } from "node:crypto";
import type { CertificateInput, CertificateHashPayload } from "../../types/blockchain";

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

// The certificate input is an object that is passed to the function from the service
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

  return JSON.stringify(normalizedPayload); // this is going to be used to generate the pdf certiccate - i will return object a json string
};

// This creates a fingerprint nd build s the hash that is going to be stored on the blochchain 
export const createCertificateHash = (certificate: CertificateInput): CertificateHashPayload => {
  const fingerprint = buildCertificateFingerprint(certificate);
  const certificateHash = `0x${createHash("sha256").update(fingerprint).digest("hex")}`;

  return { fingerprint, certificateHash }; // this is going to be passed on the blockchain smart contracts and stored in blockchain 
};

