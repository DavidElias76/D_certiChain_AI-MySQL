import { Request, Response } from "express";
import {
  addInstitutionsService,
  getInstitutionsService,
//   getInstitutionByIdService,
  updateInstitutionService,
  deleteInstitutionService,
} from "../services/institution.service";
import { CustomError } from "../types/error.types";
import { InstitutionRepository } from "../repositories/institution.repository";

type InstitutionInput = {
  name: string;
  short_code: string;
  domain: string;
  wallet_address: string;
  description?: string;
  isActive?: boolean;
};

export const getInstitutionController = async (
  req: Request<{}, unknown, {}, {}>,
  res: Response<InstitutionInput[] | {error: string}>
) => {
  try {
    const institutions = await getInstitutionsService();
    res.status(200).json(institutions);
  } catch (err) {
    const error = err as CustomError;
    console.error("Error getting institutions", error);
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

// The get institutionByIdController needs to be added in this file
export const addInstitutionController = async (
  req: Request<{}, unknown, InstitutionInput, {}>,
  res: Response<{ message: string} | { error: string }>
) => {
  try {
    const { name, short_code, domain, wallet_address, description } = req.body;

    if (!name || !short_code || !domain) {
      return res.status(400).json({ error: "Name, short code, and domain are required" });
    }

    if(!wallet_address) {
        return res.status(400).json({ message: "Wallet address is required"});
    }

    // Validate wallet address format if provided
    if (wallet_address && !/^0x[a-fA-F0-9]{40}$/.test(wallet_address)) {
      return res.status(400).json({ error: "Invalid Ethereum wallet address format" });
    }

    const addedInstitution = await addInstitutionsService({ 
        name, short_code, domain, wallet_address, description 
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
  res: Response<{ message: string} | { error: string}>
) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No data provided for updating institution" });
    }

    // Validate wallet address format if being updated
    if (updates.wallet_address && !/^0x[a-fA-F0-9]{40}$/.test(updates.wallet_address)) {
      return res.status(400).json({ error: "Invalid Ethereum wallet address format" });
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
    const is_active = req.body;

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