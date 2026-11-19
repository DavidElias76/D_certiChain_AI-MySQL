import { InstitutionRepository } from "../repositories/institution.repository";
import type { CustomError } from "../types/error.types";
import { encryptPrivateKey } from "../blockchain/keys";
import { ethers } from "ethers";
import { registerInstitutionOnChain } from "../blockchain/contracts";
import { platformWallet } from "../blockchain/blockchainConnection"; 

const httpError = (message: string, statusCode: number): CustomError => {
  const error = new Error(message) as CustomError;
  error.statusCode = statusCode
  return error;
}

export const getInstitutionsService = async () => {
  return InstitutionRepository.findAll();
};

export const getInstitutionByIdService = async (id: number) => {
  const institution = await InstitutionRepository.findById(id);
  if (!institution) {
    const error = new Error("Institution not found") as CustomError;
    error.statusCode = 404;
    throw error;
  }
  return institution;
};

export const addInstitutionsService = async (data: {
    name: string;
    short_code: string;
    domain: string;
    description?: string;
    is_active: boolean;
}) => {
    const shortCode = data.short_code.trim().toLowerCase();
    const domain = data.domain.trim().toLowerCase();

   const existingByDomain = await InstitutionRepository.findByDomain(domain);
    if (existingByDomain) {
      const error = new Error("An institution with this domain already exists") as CustomError;
      error.statusCode = 409;
      throw error;
    }

    const existingByCode = await InstitutionRepository.findByShortCode(shortCode);
    if (existingByCode) {
      const error = new Error("An institution with this short code already exists") as CustomError;
      error.statusCode = 409;
      throw error;
    }

    const newId = await InstitutionRepository.create({
        name: data.name.trim(),
        short_code: shortCode,
        domain,
        wallet_address: null,
        description: data.description,
        is_active: data.is_active ?? false,
    });

    return InstitutionRepository.findById(newId);
  };

  export const updateInstitutionService = async (
    id: number,
    updates: Partial<{
    name: string;
    short_code: string;
    domain: string;
    description: string | null;
    is_active: boolean;
  }>
) => {
  const clean = { ...updates };
  if (clean.short_code !== undefined) clean.short_code = clean.short_code.trim().toLowerCase();
  if (clean.domain !== undefined) clean.domain = clean.domain.trim().toLowerCase();

  let updated: boolean;
  try {
    updated = await InstitutionRepository.update(id, clean);
  } catch (err) {
    if ((err as { code?: string }).code === "ER_DUP_ENTRY") {
      throw httpError("An institution with this domain or short code already exists", 409);
    }
    throw err;
  }

  if (!updated) throw httpError("Institution not found or nothing to update", 404);
  return InstitutionRepository.findById(id);
};

export const deleteInstitutionService = async (id: number) => {
  const deleted = await InstitutionRepository.deleteInstitution(id);
  if (!deleted) {
    const error = new Error("Institution not found") as CustomError;
    error.statusCode = 404;
    throw error;
  }

  return deleted;
};

export const setupWalletService = async (
  institutionId: number, 
  rawPrivateKey: string
) => {

    const privateKey = rawPrivateKey.startsWith("0x") ? rawPrivateKey : `0x${rawPrivateKey}`;

    let walletAddress: string;
    try {
      walletAddress = new ethers.Wallet(privateKey).address.toLowerCase();
    } catch {
      throw httpError("Invalid private key", 400);
    }

    if (walletAddress === platformWallet.address.toLowerCase()) {
      throw httpError("The institution wallet must be different from the platform wallet", 400);
    }

    const institution = await InstitutionRepository.findById(institutionId);
    if (!institution) throw httpError("Institution not found", 404);
    if (institution.wallet_address) throw httpError("A wallet is already set up for this institution", 409);

    const usedBy = await InstitutionRepository.findByWalletAddress(walletAddress);
    if (usedBy) throw httpError("This wallet is already used by an institution", 409);

    let encryptedKey: string;
    try {
      encryptedKey = encryptPrivateKey(privateKey);
    } catch (err) {
      console.error("encryptPrivateKey failed:", (err as Error).message);
      throw httpError("Server encryption is not configured correctly", 500);
    }

    let registration;
    try {
      registration = await registerInstitutionOnChain(institutionId, walletAddress);
    } catch (err) {
      console.error("registerInstitution failed:", (err as Error).message);
      throw httpError("Could not register the institution on the blockchain. Please try again.", 502);
    }

    const saved = await InstitutionRepository.saveWalletSetup(institutionId, {
      walletAddress,
      encryptedKey,
      txHash: registration.txHash,
      chainId: registration.institution_Id,
      is_active: true
    });
    if (!saved) {
      console.error(`Wallet setup race: institution ${institutionId} registered on-chain (${registration.txHash}) but DB save was rejected`);
      throw httpError("A wallet was already set up for this institution", 409);
    }

  return { walletAddress, txHash: registration.txHash };
};