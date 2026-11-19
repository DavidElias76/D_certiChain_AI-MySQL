import type { NextFunction, Request, RequestHandler, Response } from "express";
import {
  generateRecommendation,
  getRecommendation,
} from "../services/careerRecommendations.service";
import type { CustomError } from "../types/error.types";

const badRequest = (message: string): CustomError => {
  const err = new Error(message) as CustomError;
  err.statusCode = 400;
  return err;
};

const parseCertificateId = (value: unknown): number => {
  const id = Number(value);
  if (typeof value !== "string" || !/^\d+$/.test(value) || !Number.isSafeInteger(id) || id <= 0) {
    throw badRequest("Invalid certificate id");
  }
  return id;
};

const handleError = (error: unknown, res: Response, next: NextFunction) => {
  const status = (error as CustomError)?.statusCode;
  if (typeof status === "number" && status >= 400 && status < 500) {
    res.status(status).json({ message: (error as Error).message });
    return;
  }
  if (status === 502 || status === 503) {
    res.status(status).json({ message: (error as Error).message });
    return;
  }
  next(error);
};

const getByCertificate: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Please log in." });
      return;
    }

    const certificateId = parseCertificateId(req.params.certificateId);
    const recommendation = await getRecommendation(certificateId, req.user.id);

    res.status(200).json({ recommendation });
  } catch (error) {
    handleError(error, res, next);
  }
};

const generate: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Please log in." });
      return;
    }

    const certificateId = parseCertificateId(req.params.certificateId);
    const { recommendation, cached } = await generateRecommendation(
      certificateId,
      req.user.id
    );

    res.status(cached ? 200 : 201).json({
      message: cached
        ? "Showing your saved career recommendations."
        : "Career recommendations generated.",
      cached,
      recommendation,
    });
  } catch (error) {
    handleError(error, res, next);
  }
};

export const RecommendationsController = { getByCertificate, generate };