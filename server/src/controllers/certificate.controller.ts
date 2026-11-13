import type { Request, Response } from "express";
import { CertificateService } from "../services/certificate.service";
import type { CustomError } from "../types/error.types";

// Letters, digits, dot, dash, underscore. Adjust if your short codes can contain anything else.
const CERT_NUMBER_RE = /^[A-Za-z0-9._-]{3,100}$/;

interface AuthUser {
  id: number;
  role?: string;
  email?: string;
  institution_id?: number | string | null;
}

const LIMITS = {
  student_name: 80,
  registration_number: 50,
  student_email: 255,
  course: 120,
  degree: 120,
  gpa: 10,
  classification: 60,
} as const;

const verifyContext = (req: Request) => {
  const user = getAuthUser(req);
  return {
    user: user?.id
      ? { id: user.id, role: user.role ?? "", email: user.email, institution_id: user.institution_id }
      : undefined,
    ip: req.ip ?? null,
    userAgent: req.get("user-agent") ?? null,
  };
};

const firstTooLong = (fields: Record<string, string | undefined>) =>
  Object.entries(fields).find(
    ([key, value]) => value !== undefined && value.length > LIMITS[key as keyof typeof LIMITS]
  )?.[0];

const getAuthUser = (req: Request<any, any, any, any>): AuthUser | undefined =>
  (req as Request<any, any, any, any> & { user?: AuthUser }).user;

const text = (value: unknown): string => (typeof value === "string" ? value.trim() : "");
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Errors we throws on purpose carry a statusCode and a safe message.
// Anything else is unexpected: log it, don't leak it.
const sendError = (res: Response, error: unknown) => {
  const err = error as CustomError;
  if (err?.statusCode) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }
  console.error("Certificate controller error:", (error as Error)?.message);
  res.status(500).json({ error: "Something went wrong. Please try again." });
};

// Only admin / main_admin of an institution. Returns null after sending the error response.
const requireInstitutionAdmin = (req: Request, res: Response) => {
  const user = getAuthUser(req);
  if (!user?.id) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
  if (user.role !== "admin" && user.role !== "main_admin") {
    res.status(403).json({ error: "Only institution admins can do this" });
    return null;
  }
  const institutionId = Number(user.institution_id);
  if (!Number.isInteger(institutionId) || institutionId <= 0) {
    res.status(403).json({ error: "Your account is not linked to an institution" });
    return null;
  }
  return { id: user.id, institutionId };
};

export const issueCertificateController = async (req: Request, res: Response) => {
  try {
    const admin = requireInstitutionAdmin(req, res);
    if (!admin) return;

    const body = req.body ?? {};
    const student_name = text(body.student_name);
    const registration_number = text(body.registration_number);
    const student_email = text(body.student_email).toLowerCase();
    const course = text(body.course);
    const degree = text(body.degree);
    if (!student_name || !registration_number || !student_email || !course || !degree || !body.graduation_date) {
      res.status(400).json({ error: "All required fields must be provided" });
      return;
    }
    if (!EMAIL_RE.test(student_email)) {
      res.status(400).json({ error: "Student email is not valid" });
      return;
    }

    const graduation_date = new Date(body.graduation_date);
    if (Number.isNaN(graduation_date.getTime())) {
      res.status(400).json({ error: "Graduation date is not a valid date" });
      return;
    }

    const gpa =
      body.gpa !== undefined && body.gpa !== null && String(body.gpa).trim() !== ""
        ? String(body.gpa).trim()
        : undefined;
    const classification = text(body.classification) || undefined;

    const tooLong = firstTooLong({ student_name, registration_number, student_email, course, degree, gpa, classification });
    if (tooLong) {
      res.status(400).json({ error: `${tooLong.replace(/_/g, " ")} is too long` });
      return;
    }

    const result = await CertificateService.issueCertificate({
      student_name,
      registration_number,
      student_email,
      course,
      degree,
      graduation_date,
      gpa,
      classification,
      issued_by: admin.id,
      institution_id: admin.institutionId,
    });

    res.status(201).json({
      message: "Certificate issued successfully",
      certificate: result,
    });
  } catch (error) {
    sendError(res, error);
  }
};

// Platform-wide list: system admin only.
export const getAllCertificatesCountController = async (
  req: Request, 
  res: Response<{ count: number} | {error: string }>
) => {
  try {
    const user = getAuthUser(req) // get the user from the request;
    if (!user?.id) {
      res.status(401).json({ error: "Unauthorized user" });
      return;
    }
    if (user.role !== "systemAdmin") {
      res.status(403).json({ error: "Forbidden!. You do not have permission to view this" });
      return;
    }
    const count = await CertificateService.getAllCertificatesCount();
    res.status(200).json({ count });
  } catch (error) {
    sendError(res, error);
  }
};

// All certificates of the admin's institution, whoever issued them.
export const getCertificatesByInstitutionController = async (req: Request, res: Response) => {
  try {
    const admin = requireInstitutionAdmin(req, res);
    if (!admin) return;

    const certificates = await CertificateService.getCertificatesByInstitution(admin.institutionId);
    res.status(200).json(certificates);
  } catch (error) {
    sendError(res, error);
  }
};

export const getMyCertificatesController = async (req: Request, res: Response) => {
  try {
    const user = getAuthUser(req);
    if (!user?.email) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const certificates = await CertificateService.getCertificatesByStudentEmail(user.email);
    res.status(200).json(certificates);
  } catch (error) {
    sendError(res, error);
  }
};

// this is being handled by the email and we can add this as a fail safe
// export const getMyCertificatesByIdController = async(
//   req: Request,
//   res: Response
// ) => {
//   try {
    
//   } catch (error) {
    
//   }
// }

export const verifyCertificateController = async (
  req: Request<{ certificateNumber: string }>,
  res: Response<any>
) => {
  try {
    const certificateNumber = text(req.params.certificateNumber);
    if (!CERT_NUMBER_RE.test(certificateNumber)) {
      res.status(400).json({ error: "A valid certificate ID is required" });
      return;
    }

    const user = getAuthUser(req);

    const outcome = await CertificateService.verifyCertificateByNumber(certificateNumber, {
      user: user?.id
        ? { id: user.id, role: user.role ?? "", email: user.email, institution_id: user.institution_id }
        : undefined,
      ip: req.ip ?? null,
      userAgent: req.get("user-agent") ?? null,
    });

    // The answer can change when a certificate is revoked, so never cache it.
    res.set("Cache-Control", "no-store");
    res.status(200).json(outcome);
  } catch (error) {
    sendError(res, error);
  }
};

// not yet built
export const verifyCertificateUploadController = async (req: Request, res: Response) => {
  try {
    const file = (req as Request & { file?: { buffer: Buffer } }).file;
    if (!file?.buffer?.length) {
      res.status(400).json({ error: "Attach the certificate in the 'file' field." });
      return;
    }

    const outcome = await CertificateService.verifyCertificateUpload(file.buffer, verifyContext(req));

    res.set("Cache-Control", "no-store");
    res.status(200).json(outcome);
  } catch (error) {
    sendError(res, error);
  }
};

// get the reason to revoke te certificate
export const revokeCertificateController = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const admin = requireInstitutionAdmin(req, res);
    if (!admin) return;

    const certificateId = Number(req.params.id);
    if (!Number.isInteger(certificateId) || certificateId <= 0) {
      res.status(400).json({ error: "Invalid certificate id" });
      return;
    }

    const reason = text(req.body?.reason);
    if (!reason) {
      res.status(400).json({ error: "Revocation reason is required" });
      return;
    }
    if (reason.length > 250) {
      res.status(400).json({ error: "Revocation reason is too long (max 250 characters)" });
      return;
    }

    await CertificateService.revokeCertificate(certificateId, reason, admin.institutionId);

    res.status(200).json({ message: "Certificate revoked successfully" });
  } catch (error) {
    sendError(res, error);
  }
};

export const getCarrerRecommendationsController = async (
  req: Request<{ id?: string }, {}, {}, unknown>,
  res: Response<any>
) => {
  try {
    const user = getAuthUser(req);
    if (!user?.id) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const roles = ["admin", "systemAdmin", "main-admin", "employer"];
    const role = user.role ?? "";

    if (!roles.includes(role)) {
      res.status(403).json({ error: "Forbidden!. recommendation is only available for the students" });
      return;
    }

    const certId = Number(req.params.id ?? "");
    if (!Number.isInteger(certId) || certId <= 0) {
      res.status(400).json({ error: "Invalid certificate id" });
      return;
    }

    const recommendation = await CertificateService.getCareerRecommendationsService(certId)

  } catch (error) {
    sendError(res, error);
  }
};

// the generate pdf controller
export const getCertificatePdfController = async (req: Request, res: Response) => {
  try {
    const user = getAuthUser(req);
    if (!user?.id) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: "Invalid certificate id" });
      return;
    }

    const { buffer, certificate_number } = await CertificateService.getCertificatePdf(id, {
      id: user.id,
      role: user?.role || "",
      email: user.email,
      institution_id: user.institution_id,
    });

    const safeName = certificate_number.replace(/[^A-Za-z0-9._-]/g, "_");
    const disposition = req.query.download === "1" ? "attachment" : "inline";

    res.set({
      "Content-Type": "application/pdf",
      "Content-Length": String(buffer.length),
      "Content-Disposition": `${disposition}; filename="certificate-${safeName}.pdf"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    });
    res.status(200).send(buffer);
  } catch (error) {
    sendError(res, error);
  }
};