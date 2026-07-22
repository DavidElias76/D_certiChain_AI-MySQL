import { InstitutionRepository } from "../repositories/institution.repository";
import type { CustomError } from "../types/error.types";

// ─── Get All Active Institutions ─────────────────────────────
export const getInstitutionsService = async () => {
  return InstitutionRepository.findAll();
};

// ─── Get Institution by ID ────────────────────────────────────
export const getInstitutionByIdService = async (id: number) => {
  const institution = await InstitutionRepository.findById(id);
  if (!institution) {
    const error = new Error("Institution not found") as CustomError;
    error.statusCode = 404;
    throw error;
  }
  return institution;
};

// ─── Add Institution ──────────────────────────────────────────
export const addInstitutionsService = async (data: {
  name: string;
  short_code: string;
  domain: string;
  wallet_address?: string;
  description?: string;
  is_active?: boolean;
}) => {
  // Check duplicate domain
  const existingByDomain = await InstitutionRepository.findByDomain(data.domain);
  if (existingByDomain) {
    const error = new Error("An institution with this domain already exists") as CustomError;
    error.statusCode = 409;
    throw error;
  }

  // Check duplicate short code
  const existingByCode = await InstitutionRepository.findByShortCode(data.short_code);
  if (existingByCode) {
    const error = new Error("An institution with this short code already exists") as CustomError;
    error.statusCode = 409;
    throw error;
  }

  const newId = await InstitutionRepository.create({
    name: data.name.trim(),
    short_code: data.short_code,
    domain: data.domain,
    wallet_address: data.wallet_address ?? "",
    description: data.description,
    is_active: data.is_active ?? true,
  });

  return InstitutionRepository.findById(newId);
};

// ─── Update Institution ───────────────────────────────────────
export const updateInstitutionService = async (
  id: number,
  updates: Partial<{
    name: string;
    short_code: string;
    domain: string;
    wallet_address: string;
    description: string;
    is_active: boolean;
  }>
) => {
  const updated = await InstitutionRepository.update(id, updates);
  if (!updated) {
    const error = new Error("Institution not found") as CustomError;
    error.statusCode = 404;
    throw error;
  }
  return InstitutionRepository.findById(id);
};

// ─── Soft-Delete Institution ─────────────────────────────────
export const deleteInstitutionService = async (id: number) => {
  const deleted = await InstitutionRepository.softDelete(id);
  if (!deleted) {
    const error = new Error("Institution not found") as CustomError;
    error.statusCode = 404;
    throw error;
  }
  return InstitutionRepository.findById(id);
};
