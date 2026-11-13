import crypto from "crypto";
import { ethers } from "ethers";
import { CertificateRepository } from "../repositories/certificate.repository";
import { InstitutionRepository } from "../repositories/institution.repository";
import { issueCertificateOnChain, revokeCertificateOnChain, verifyCertificateOnChain } from "../blockchain/contracts";
import { provider } from "../blockchain/blockchainConnection";
import { decryptPrivateKey } from "../blockchain/keys";
import type { CustomError } from "../types/error.types";
import type { CertificateResult } from "../types/index.types";
import { generateCertificatePdf, CertificatePdfData } from "../pdf/pdf.generator";
import { savePdf } from "../pdf/pdf.storage";
import { readPdf, sha256Hex } from "../pdf/pdf.storage";
import {
  VerificationLogRepository,
  type VerificationLogInput,
  type VerifierType,
} from "../repositories/verification-log.repository";

import { detectFileKind, extractCertificateNumbers, textMatchesRecord } from "../utility/certificate-extractor";
import { UsersRepository } from "../repositories/users.repository";
import { User } from "../models_sequelize_typescript";
import { stringAt } from "pdfkit/js/data";

export interface IssueCertificateInput {
  student_name: string;
  registration_number: string;
  student_email: string;
  course: string;
  degree: string;
  graduation_date: Date;
  certificate_number?: string | number;
  gpa?: string;
  classification?: string;
  issued_by: number;
  institution_id: number;
}

interface PdfRequester {
  id: number;
  role: string;
  email?: string | null;
  institution_id?: number | string | null;
}

interface GetUserIdType {
  student_email?: string | null; // it will only use the email and not the other values
  // short_code?: string | null;
  // institution_name?: string | null;
}

type VerifyResult = "verified" | "invalid" | "revoked";
type MatchSource = "number" | "exact_file" | "pdf_text" | "qr_code";

interface Attempt {
  method: "certificate_number" | "file_upload";
  submittedValue: string | null;
  submittedHash: string | null;
  match: MatchSource;
  documentMismatch?: boolean;
}

const logBase = (ctx: VerifyContext, a: Pick<Attempt, "method" | "submittedValue" | "submittedHash">) => ({
  verifier_id: ctx.user?.id ?? null,
  verifier_email: ctx.user?.email ?? null,
  verifier_type: verifierTypeFor(ctx.user?.role),
  verification_method: a.method,
  submitted_value: a.submittedValue ? a.submittedValue.slice(0, 100) : null,
  submitted_hash: a.submittedHash,
  ip_address: ctx.ip ? ctx.ip.slice(0, 45) : null,
  user_agent: ctx.userAgent ? ctx.userAgent.slice(0, 500) : null,
});

// Shared by number lookup and file upload: chain check, decision, log, response.
async function checkOnChainAndLog(cert: any, ctx: VerifyContext, attempt: Attempt) {
  // A chain outage must never look like an invalid certificate: 503, and no log row.
  let chain: any;
  try {
    chain = await verifyCertificateOnChain(cert.certificate_hash, cert.institution_id);
  } catch (err) {
    console.error("Chain verification failed:", (err as Error).message);
    throw httpError("Verification is temporarily unavailable. Please try again.", 503);
  }

  const record = chain?.record ?? {};
  const exists = Boolean(record.exists);
  const revokedOnChain = Boolean(record.revoked);

  let result: VerifyResult;
  if (!exists) result = "invalid";
  else if (revokedOnChain || cert.status === "revoked") result = "revoked";
  else if (attempt.documentMismatch || !chain.valid) result = "invalid";
  else result = "verified";

  const reason =
    attempt.documentMismatch && exists && result === "invalid" ? ("document_mismatch" as const) : undefined;

  await logVerification({
    ...logBase(ctx, attempt),
    certificate_id: cert.id,
    match_type: attempt.match === "exact_file" ? "exact_file" : "number",
    blockchain_hash: exists ? cert.certificate_hash : null,
    result,
    blockchain_tx_hash: cert.blockchain_tx_hash ?? null,
  });

  // Owner, the institution's admins and the system admin see the extra fields.
  const privateFields =
    ctx.user && canAccessPdf(ctx.user, cert)
      ? { registration_number: cert.registration_number, gpa: cert.gpa }
      : {};

  return {
    verified: result === "verified",
    result,
    match: attempt.match,
    reason,
    certificate: {
      student_name: cert.student_name,
      institution_name: cert.institution_name,
      course: cert.course,
      degree: cert.degree,
      graduation_date: cert.graduation_date,
      classification: cert.classification,
      certificate_number: cert.certificate_number,
      certificate_hash: cert.certificate_hash,
      blockchain_tx_hash: cert.blockchain_tx_hash,
      status: result === "revoked" ? "revoked" : cert.status,
      issued_at: cert.issued_at,
      revoked_at: cert.revoked_at,
      ...privateFields,
    },
    blockchain: {
      valid: result === "verified",
      record: {
        issuer: record.issuer ?? null,
        issuedAt: exists ? Number(record.issuedAt) : null,
        revokedAt: revokedOnChain && record.revokedAt ? Number(record.revokedAt) : null,
        revoked: revokedOnChain,
        exists,
      },
    },
  };
}

const canAccessPdf = (user: PdfRequester, cert: any): boolean => {
  switch (user.role) {
    case "systemAdmin":
      return true;
    case "main_admin":
    case "admin":
      return user.institution_id != null && Number(user.institution_id) === Number(cert.institution_id);
    case "student":
    case "alumni":
      return !!user.email && user.email.toLowerCase() === String(cert.student_email).toLowerCase();
    default:
      return false;
  }
};

export interface VerifyContext {
  user?: PdfRequester;
  ip: string | null;
  userAgent: string | null;
}

// Admins and system admins are logged as "public" (their verifier_id is still kept).
const verifierTypeFor = (role?: string): VerifierType =>
  role === "student" || role === "employer" || role === "alumni" ? role : "public";

// A logging failure must never break a verification.
const logVerification = async (entry: VerificationLogInput): Promise<void> => {
  try {
    await VerificationLogRepository.create(entry);
  } catch (err) {
    console.error("Could not write verification log:", (err as Error).message);
  }
};

const httpError = (message: string, statusCode: number): CustomError => {
  const error = new Error(message) as CustomError;
  error.statusCode = statusCode;
  return error;
};

// ── Helpers (these can move to utils later)
function generateCertificateHash(data: {
  student_name: string;
  registration_number: string;
  student_email: string;
  institution_name: string;
  course: string;
  degree: string;
  graduation_date: Date;
}): string {

  const payload = [
    data.student_name,
    data.registration_number,
    data.student_email,
    data.institution_name,
    data.course,
    data.degree,
    data.graduation_date.toISOString().slice(0, 10),
    Date.now().toString(),
    crypto.randomBytes(8).toString("hex"),
  ].join("|");
  return "0x" + crypto.createHash("sha256").update(payload).digest("hex");
}

// save the pdf info suing the cert data 
async function buildAndStorePdf(id: number, data: CertificatePdfData): Promise<boolean> {
  try {
    const buf = await generateCertificatePdf(data);
    const { url, hash } = await savePdf(id, buf);
    await CertificateRepository.savePdfInfo(id, url, hash);
    return true;
  } catch (err) {
    console.error(`PDF generation failed for certificate ${id}:`, (err as Error).message);
    return false;
  }
}

// generate the certificate number using the random bytes
function generateCertificateNumber(shortCode: string, graduationDate: Date): string {
  const rand = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `${shortCode.toUpperCase()}-${graduationDate.getUTCFullYear()}-${rand}`;
}

// One chain operation at a time per institution wallet (avoids nonce collisions). - this is a task queue
const institutionQueues = new Map<number, Promise<unknown>>();
const runExclusive = <T>(institutionId: number, task: () => Promise<T>): Promise<T> => {
  const previous = institutionQueues.get(institutionId) ?? Promise.resolve();
  const next = previous.catch(() => undefined).then(task);
  institutionQueues.set(institutionId, next);
  void next
    .catch(() => undefined)
    .finally(() => {
      if (institutionQueues.get(institutionId) === next) institutionQueues.delete(institutionId);
    });
  return next;
};

// check for the chain error
const chainErrorInfo = (err: unknown) => {
  const e = err as { code?: string; revert?: { name?: string }; errorName?: string; message?: string };
  return { code: e?.code, name: e?.revert?.name ?? e?.errorName, message: e?.message ?? "" };
};

// checks the chain error
const mapChainError = (err: unknown): CustomError => {
  const { code, name, message } = chainErrorInfo(err);

  if (code === "INSUFFICIENT_FUNDS" || /insufficient funds/i.test(message)) {
    return httpError("The institution wallet has no funds to pay transaction fees. Contact the system admin.", 400);
  }
  if (name === "CertificateAlreadyExists") return httpError("This certificate already exists on the blockchain", 409);
  if (name === "CertificateNotFound") return httpError("Certificate not found on the blockchain", 404);
  if (name === "CertificateAlreadyRevoked") return httpError("Certificate is already revoked", 409);
  if (name === "NotAuthorizedIssuer" || name === "InstitutionNotRegistered" || /not authorized/i.test(message)) {
    return httpError("The institution wallet is not registered on the blockchain. Contact the system admin.", 403);
  }

  console.error("Blockchain operation failed:", message);
  return httpError("The blockchain transaction failed. Please try again.", 502);
};

// Loads the institution, decrypts its key and returns a signer that is ready to send transactions.
const getInstitutionSigner = async (institutionId: number) => {
  const institution = await InstitutionRepository.findById(institutionId);
  if (!institution) throw httpError("Institution not found", 404);
  if (!institution.is_active) throw httpError("This institution is not active", 403);

  const wallet = await InstitutionRepository.findWalletById(institutionId);
  if (!wallet?.wallet_address || !wallet.wallet_private_key_encrypted) {
    throw httpError("Your institution's wallet is not set up yet. Ask your main admin to set it up.", 400);
  }

  let signer: ethers.Wallet;
  try {
    signer = new ethers.Wallet(decryptPrivateKey(wallet.wallet_private_key_encrypted).trim(), provider);
  } catch (err) {
    console.error(`Could not decrypt wallet key for institution ${institutionId}:`, (err as Error).message);
    throw httpError("Could not access the institution wallet. Contact the system admin.", 500);
  }

  // check if the addresses are the same
  if (signer.address.toLowerCase() !== wallet.wallet_address.toLowerCase()) {
    console.error(`Stored key does not match stored address for institution ${institutionId}`);
    throw httpError("Could not access the institution wallet. Contact the system admin.", 500);
  }

  let balance: bigint;
  try {
    balance = await provider.getBalance(signer.address); // get the address
  } catch (err) {
    console.error("getBalance failed:", (err as Error).message);
    throw httpError("The blockchain network is unreachable. Please try again later.", 502);
  }
  if (balance === BigInt(0)) {
    throw httpError("The institution wallet has no funds to pay transaction fees. Contact the system admin.", 400);
  }

  if (balance === 0n) {
    throw httpError(
      "The institution wallet has no funds to pay transaction fees. Contact the system admin.",
      400
    );
  }

  return { institution, signer };
};

//  Service 

export const CertificateService = {

  async issueCertificate(input: IssueCertificateInput): Promise<CertificateResult> {
    const { institution, signer } = await getInstitutionSigner(input.institution_id);
    const signerAddress = await signer.getAddress();

    if (signerAddress.toLowerCase() !== String(institution.wallet_address).toLowerCase()) {
      throw httpError("The stored institution key does not match the registered wallet address", 500);
    }
     const result = await runExclusive(institution.id, async () => {
      const duplicate = await CertificateRepository.existsDuplicate({
        institution_id: institution.id,
        registration_number: input.registration_number,
        course: input.course,
        degree: input.degree,
      });

      // check if the data exist to prevent the creating of a duplicate
      if (duplicate) {
        throw httpError("A certificate for this student, course and degree already exists", 409);
      }

      let certificate_number = "";
      for (let attempt = 0; attempt < 5; attempt++) {
        const candidate = generateCertificateNumber(institution.short_code, input.graduation_date);
        if (!(await CertificateRepository.findByCertificateNumber(candidate))) {
          certificate_number = candidate;
          break;
        }
      }
      if (!certificate_number) {
        throw httpError("Could not allocate a certificate number. Please try again.", 503);
      }
      
      const certificate_hash = generateCertificateHash({
        student_name: input.student_name,
        registration_number: input.registration_number,
        student_email: input.student_email,
        institution_name: institution.name,
        course: input.course,
        degree: input.degree,
        graduation_date: input.graduation_date,
      });
      
      let txHash: string;
      let certificateId: string;

      try {
        ({ txHash, certificateId } = await issueCertificateOnChain(
          certificate_hash, institution.id, signer
        ));
      } catch (err) {
        throw mapChainError(err);
      }

      let id: number;
      try {
        id = await CertificateRepository.createWithDatabase({
          student_name: input.student_name,
          registration_number: input.registration_number,
          student_email: input.student_email,
          institution_name: institution.name,
          course: input.course,
          degree: input.degree,
          graduation_date: input.graduation_date,
          gpa: input.gpa,
          classification: input.classification,
          issued_by: input.issued_by,
          certificate_hash,
          certificate_number,
          blockchain_tx_hash: txHash,
          blockchain_certificate_id: certificateId,
          institution_id: institution.id,
        });

        // add the is_active propery to true when certificate issed
        await InstitutionRepository.updateStatus(input.institution_id, true);
      } catch (err) {
        // The chain succeeded but the DB did not: keep a trail so it can be reconciled. - to be deleted afterwards
        console.error(
          `Certificate ${certificate_hash} issued on-chain (tx ${txHash}) but the DB save failed:`,
          (err as Error).message
        );
        throw httpError(
          `The certificate was issued on the blockchain but could not be saved. Contact the system admin and quote this reference: ${txHash}`,
          500
        );
      }
      return { id, certificate_number, certificate_hash, status: "issued" } as CertificateResult;
    })
    
    // The lock is released here; the PDF does not need  
    await buildAndStorePdf(result.id, {
      certificate_number: result.certificate_number,
      student_name: input.student_name,
      institution_name: institution.name,
      course: input.course,
      degree: input.degree,
      graduation_date: input.graduation_date,
      gpa: input.gpa ?? null,
      classification: input.classification ?? null,
      issued_at: new Date(),
    });

    return result;
  },

  async getAllCertificates(): Promise<ReturnType<typeof CertificateRepository.findAll>> {
    return CertificateRepository.findAll();
  },

  async getAllCertificatesCount(): Promise<number> {
    return CertificateRepository.count();
  },

  async getCertificatesByIssuer(issuedBy: number) {
    return CertificateRepository.findByIssuedBy(issuedBy);
  },

  async getCertificatesByInstitution(institutionId: number) {
    return CertificateRepository.findByInstitution(institutionId);
  },

  async getCertificatesByStudentEmail(email: string) {
    return CertificateRepository.findByStudentEmail(email);
  },

  async getCertificatesByRegistration(regNumber: string) {
    return CertificateRepository.findByRegistrationNumber(regNumber);
  },

  async revokeCertificate(id: number, reason: string, institutionId: number): Promise<void> {
    const institution = await InstitutionRepository.findById(institutionId);
    if (!institution) throw httpError("Institution not found", 404);

    const cert = await CertificateRepository.findById(id);
    // Same message for "missing" and "belongs to another institution"
    if (!cert || cert.institution_id !== institutionId) {
      throw httpError("Certificate not found", 404);
    }
    if (cert.status === "revoked") throw httpError("Certificate is already revoked", 400);

    const { signer } = await getInstitutionSigner(institutionId);

    await runExclusive(institutionId, async () => {
      try {
        await revokeCertificateOnChain(cert.certificate_hash, institutionId, signer);
      } catch (err) {
        // Already revoked on-chain (a previous attempt failed before the DB update): just sync the DB.
        if (chainErrorInfo(err).name !== "CertificateAlreadyRevoked") throw mapChainError(err);
      }

      const revoked = await CertificateRepository.revoke(id, reason);
      if (!revoked) {
        console.error(`Certificate ${id} revoked on-chain but the DB update failed`);
        throw httpError("The certificate was revoked on the blockchain but the record could not be updated. Please retry.", 500);
      }
    });
  },

  async getCertificateById(id: number) {
    return CertificateRepository.findById(id);
  },

  // verify certificate by number
  async verifyCertificateByNumber(certificateNumber: string, ctx: VerifyContext) {
    const attempt: Attempt = {
      method: "certificate_number",
      submittedValue: certificateNumber,
      submittedHash: null,
      match: "number",
    };

    const cert = await CertificateRepository.findForVerificationByNumber(certificateNumber);
    if (!cert) {
      await logVerification({
        ...logBase(ctx, attempt),
        certificate_id: null,
        match_type: null,
        blockchain_hash: null,
        result: "invalid",
        blockchain_tx_hash: null,
      });
      throw httpError("Certificate not found", 404);
    }
    return checkOnChainAndLog(cert, ctx, attempt);
  },

  // get carrer recommendations - not completed
  async getCareerRecommendationsService (certiID: number) {
    const certificate = await CertificateRepository.findCertificateById(certiID)
    // compare it to the institution to know that this user be
  },

  async getCertificatePdf(id: number, user: PdfRequester) {
    const cert = await CertificateRepository.findPdfSourceById(id);
    // Same answer for "missing" and "not yours", so ids can't be probed.
    if (!cert || !canAccessPdf(user, cert)) {
      throw httpError("Certificate not found", 404);
    }

    let buffer = await readPdf(id);

    if (!buffer) {
      // Lazy generation: issuance-time generation failed, or this is an older certificate.
      const ok = await buildAndStorePdf(id, {
        certificate_number: cert.certificate_number,
        student_name: cert.student_name,
        institution_name: cert.institution_name,
        course: cert.course,
        degree: cert.degree,
        graduation_date: cert.graduation_date,
        gpa: cert.gpa ?? null,
        classification: cert.classification ?? null,
        issued_at: cert.created_at,
      });
      buffer = ok ? await readPdf(id) : null;
      if (!buffer) {
        throw httpError("The PDF is not available right now. Please try again later.", 503);
      }
    } else if (cert.certificate_pdf_hash && sha256Hex(buffer) !== cert.certificate_pdf_hash) {
      // The file on disk no longer matches what we recorded. Serve it, but leave a trail.
      console.warn(`PDF hash mismatch for certificate ${id}`);
    }

    return { buffer, certificate_number: cert.certificate_number as string };
  },

  async verifyCertificateUpload(file: Buffer, ctx: VerifyContext) {
    const kind = detectFileKind(file);
    if (!kind) {
      throw httpError("Unsupported file. Upload the certificate as a PDF, PNG or JPEG.", 415);
    }

    const fileHash = sha256Hex(file);

    // 1) Is this the exact PDF we issued?
    const exact = await CertificateRepository.findForVerificationByPdfHash(fileHash);
    if (exact) {
      return checkOnChainAndLog(exact, ctx, {
        method: "file_upload",
        submittedValue: exact.certificate_number,
        submittedHash: fileHash,
        match: "exact_file",
      });
    }

    // 2) Otherwise read the certificate number from the document.
    const extracted = await extractCertificateNumbers(file, kind);
    if (extracted.numbers.length > 1) {
      throw httpError("This file contains more than one certificate number, so we can't tell which one to check.", 422);
    }
    if (extracted.numbers.length === 0) {
      throw httpError(
        extracted.readable
          ? "We couldn't find a certificate number in this file. Enter the certificate number instead."
          : "We couldn't read this file. Enter the certificate number instead.",
        422
      );
    }

    const number = extracted.numbers[0];
    const attempt: Attempt = {
      method: "file_upload",
      submittedValue: number,
      submittedHash: fileHash,
      match: extracted.source,
    };

    const cert = await CertificateRepository.findForVerificationByNumber(number);
    if (!cert) {
      await logVerification({
        ...logBase(ctx, attempt),
        certificate_id: null,
        match_type: null,
        blockchain_hash: null,
        result: "invalid",
        blockchain_tx_hash: null,
      });
      throw httpError("Certificate not found", 404);
    }

    // For PDFs, the text must agree with the official record; images are only read for their QR.
    const documentMismatch = extracted.text !== null && !textMatchesRecord(extracted.text, cert);
    return checkOnChainAndLog(cert, ctx, { ...attempt, documentMismatch });
  },
};

