import { Request, Response } from "express";
import {
  addInstitutionsService,
  getInstitutionsService,
  getInstitutionByIdService,
  updateInstitutionService,
  deleteInstitutionService,
  setupWalletService
} from "../services/institution.service";
import { CustomError } from "../types/error.types";
import { InstitutionRepository } from "../repositories/institution.repository";
import type { InstitutionWithMainAdmin } from "../repositories/institution.repository";
import { InstitutionCreateInput, Institution} from '../types/index.types'

// this are the and they wil be shippped to the helpers folder at later date
const hasValue = (v: unknown): boolean => v !== null && v !== undefined && v !== "";

// Never let the encrypted key leave the server, even if a query returns it
const withoutSecrets = <T extends object>(institution: T) => {
  const { wallet_private_key_encrypted: _secret, ...safe } =
    institution as T & { wallet_private_key_encrypted?: unknown };
  return safe;
};

// Some users have institution_id = null and only an institution_name - get the user from the request
const resolveUserInstitutionId = async ( user: NonNullable<Request["user"]>): Promise<number | null> => {
  if (user.institution_id) return Number(user.institution_id);
  if (user.institution_name) {
    const found = await InstitutionRepository.findByInstitutionName(user.institution_name);
    return found && "id" in found ? Number(found.id) : null;
  }
  return null;
};

const ALLOWED_UPDATE_FIELDS = ["name", "short_code", "domain", "description", "is_active"];

// Blocks a double click from registering the same institution twice
const walletSetupInProgress = new Set<number>();

type InstitutionInput = {
  name: string;
  short_code: string;
  domain: string;
  wallet_address?: string | null;
  description?: string;
  isActive?: boolean;
};

export const getInstitutionController = async (
  req: Request<{}, unknown, {}, {}>,
  res: Response<any>
) => {
  try {
    const institutions = await getInstitutionsService();
    res.status(200).json(institutions.map(withoutSecrets));
  } catch (err) {
    const error = err as CustomError;
    console.error("Error getting institutions", error.message);
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

export const getMyInstitutionController = async(
  req: Request,
  res: Response<any>
) => {
  try {
    // get the id from the request of the user
    const user = (req as Request & {
      user?: { id: number; role?: string; institution_id?: number | string | null };
    }).user;

    console.error(user)

    if (!user?.id) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    if (user.role !== "main_admin" && user.role !== "admin") {
      res.status(403).json({ error: "Only institution admins can do this" });
      return;
    }

    const institutionId = Number(user.institution_id);
    if (!Number.isInteger(institutionId) || institutionId <= 0) {
      res.status(403).json({ error: "Your account is not linked to an institution" });
      return;
    }
    
    const institution = await getInstitutionByIdService(institutionId);
    res.status(200).json(withoutSecrets(institution));

  } catch (error) {
    const err = error as CustomError;
    res.status(err.statusCode || 500).json({ error: err.message });
  }

}

// The get institutionByIdController needs to be added in this file - to be added after the completion of the code - not needed at this time
export const getInstitutionByIdController = async (
  req: Request<{ id: string }, unknown, {}, {}>,
  res: Response<any>
) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: "Invalid institution id" });
    }

    const user = req.user;
    if (!user) return res.status(401).json({ error: "Not authenticated" });

    // main_admin and admin can only read their own institution
    if (user.role !== "systemAdmin") {
      const ownId = await resolveUserInstitutionId(user);
      if (ownId !== id) {
        return res.status(403).json({ error: "You can only view your own institution" });
      }
    }

    const institution = await getInstitutionByIdService(id);
    return res.status(200).json(withoutSecrets(institution));

  } catch (err) {
    const error = err as CustomError;
    console.error("Error getting institution", error.message);
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};

export const addInstitutionController = async (
  req: Request<{}, unknown, InstitutionInput, {}>,
  res: Response<{ message: string} | { error: string }>
) => {
  try {
    const { name, short_code, domain, description } = req.body; // There is not need to get the wallet address from the request - it will be used by the setup wallet

    if (!name || !short_code || !domain) {
      return res.status(400).json({ error: "Name, short code, and domain are required" });
    }

    const addedInstitution = await addInstitutionsService({ 
        name, short_code, domain, description, is_active: false
    });

    if (!addedInstitution) {
        const error = new Error("Failed to add new Institution ") as CustomError;
        error.statusCode = 404;
        throw error;
    }

    return res.status(201).json({ message: "Institution added successfully" });
  } catch (err) {
    const error = err as CustomError;
    console.error("Error adding institution", error);
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

export const updateInstitutionController = async (
  req: Request<{ id: string }, unknown, Partial<InstitutionInput>, {}>,
  res: Response<{ message: string } | { error: string }>
) => {
  try {
    const { id } = req.params;

    // wallet fields can only change through the wallet setup flow
    const updates = Object.fromEntries(
      Object.entries(req.body ?? {}).filter(([key]) => ALLOWED_UPDATE_FIELDS.includes(key))
    ) as Partial<InstitutionInput>;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid data provided for updating institution" });
    }

    const updatedInstitution = await updateInstitutionService(Number(id), updates);
    if (!updatedInstitution) {
      const error = new Error("Failed to update institution") as CustomError;
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ message: "Institution updated successfully" });
  } catch (err) {
    const error = err as CustomError;
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};

export const updateInstitutionStatusController = async (
  req: Request<{ id: string }, unknown, { is_active: boolean }, {}>,
  res: Response<{ message: string} | { error: string }>
) => {
  try {
    const id = Number(req.params.id)
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
        return res.status(400).json({ error: "is_active must be a boolean" });
    }

    // update the status property and return the id - find a way to return te boolean value
    await InstitutionRepository.updateStatus(id, is_active);

    res.json({ 
        message: `Institution ${is_active ? "activated" : "deactivated"} successfully` 
    });

  } catch (err) {
    const error = err as CustomError;
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
}

export const deleteInstitutionController = async (
  req: Request<{ id: string }, unknown, {}, {}>,
  res: Response<{ message: string} | { error: string}>
) => {
  try {
    const { id } = req.params;
    await deleteInstitutionService(Number(id));
    return res.status(200).json({ message: "Institution deleted successfully" });
  } catch (err) {
    const error = err as CustomError;
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};

export const setupWalletController = async (
  req: Request<{}, {}, { private_key: string}, {}>,
  res: Response
) => {
  let lockedId: number | null = null;
  try {
    // this will authenticate the user instead of the role middleware
    const user = req.user;
    if (!user || user.role !== "main_admin") {
      return res.status(403).json({ error: "Only the main admin can set up the institution wallet" });
    }

    const rawKey = req.body?.private_key; // get the private_key
    if (typeof rawKey !== "string" || !/^(0x)?[a-fA-F0-9]{64}$/.test(rawKey.trim())) {
      return res.status(400).json({ error: "A valid private key is required" });
    }

    const privateKey = rawKey.trim().startsWith("0x") ? rawKey.trim() : `0x${rawKey.trim()}`; // get teh value after the 0x

    const institutionId = await resolveUserInstitutionId(user) // get the institution id from the user
    if (!institutionId) {
      return res.status(404).json({ error: "No institution is associated with this account" });
    }

    const institution = await InstitutionRepository.findById(institutionId); // get the institution and check if te id property exist
    if (!institution || !("id" in institution)) {
      return res.status(404).json({ error: "Institution not found" });
    }

    // check if the wallet property in the db has a value 
    if (hasValue((institution as { wallet_address?: unknown }).wallet_address)) {
      return res.status(409).json({ error: "This institution already has a wallet" });
    }

    // prevents the institution from being regsitered twice
    if (walletSetupInProgress.has(institutionId)) {
      return res.status(409).json({ error: "Wallet setup is already in progress" });
    }

    // add the isntitution id in the new set of values to be captured
    walletSetupInProgress.add(institutionId);
    lockedId = institutionId;

    const result = await setupWalletService(institutionId, privateKey);

    return res.status(200).json({
      message: "Wallet set up and institution registered on the blockchain successfully",
      ...result,
    });
  } catch (err) {
    const error = err as CustomError;
    // log only the message, never the request body
    return res.status(error.statusCode || 500).json({ error: error.message });
  }finally{
    if (lockedId !== null) walletSetupInProgress.delete(lockedId);
  }
}
