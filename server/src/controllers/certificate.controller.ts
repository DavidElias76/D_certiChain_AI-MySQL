import type { Request, Response } from "express";
import { CertificateService } from "../services/certificate.service";
import type { CustomError } from "../types/error.types";

// when getting all the certificate, we will use the user.id and not the email of the issuer

export const issueCertificateController = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user as { id: number; username: string } | undefined; // get the request user id who issues the certificate
    if (!user?.id) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const {
      student_name,
      registration_number,
      student_email,
      institution_name,
      course,
      degree,
      graduation_date,
      gpa,
      classification,
      skills,
    } = req.body;

    if (!student_name || !registration_number || !student_email || !institution_name || !course || !degree || !graduation_date) {
      res.status(400).json({ error: "All required fields must be provided" });
      return;
    }

    const result = await CertificateService.issueCertificate({
      student_name,
      registration_number,
      student_email,
      institution_name,
      course,
      degree,
      graduation_date,
      gpa,
      classification,
      skills,
      issued_by: user.id,
    });

    res.status(201).json({
      message: "Certificate issued successfully",
      certificate: result,
    });
  } catch (error) {
    const err = error as CustomError;
    res.status(err.statusCode || 500).json({ error: err.message });
  }
};

export const getAllCertificatesController = async (
  _req: Request,
  res: Response
) => {
  try {
    const certificates = await CertificateService.getAllCertificates();
    res.status(200).json(certificates);
  } catch (error) {
    const err = error as CustomError;
    res.status(err.statusCode || 500).json({ error: err.message });
  }
};

export const getCertificatesByIssuerController = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user as { id: number } | undefined;
    if (!user?.id) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const certificates = await CertificateService.getCertificatesByIssuer(user.id);
    res.status(200).json(certificates);
  } catch (error) {
    const err = error as CustomError;
    res.status(err.statusCode || 500).json({ error: err.message });
  }
};

export const getMyCertificatesController = async (
  req: Request,
  res: Response
) => {
  try {
    const user = (req as any).user as { id: number; email?: string } | undefined;
    if (!user?.email) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const certificates = await CertificateService.getCertificatesByStudentEmail(user.email);
    res.status(200).json(certificates);
  } catch (error) {
    const err = error as CustomError;
    res.status(err.statusCode || 500).json({ error: err.message });
  }
};

export const revokeCertificateController = async (
  req: Request<{ id: string }>,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      res.status(400).json({ error: "Revocation reason is required" });
      return;
    }

    await CertificateService.revokeCertificate(Number(id), reason);
    res.status(200).json({ message: "Certificate revoked successfully" });
  } catch (error) {
    const err = error as CustomError;
    res.status(err.statusCode || 500).json({ error: err.message });
  }
};
