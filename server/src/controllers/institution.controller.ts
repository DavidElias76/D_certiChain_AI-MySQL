import { Request, Response } from "express";
import {
  addInstitutionsService,
  getInstitutionsService,
  updateInstitutionService,
  deleteInstitutionService,
} from "../services/institution.service";
import { CustomError } from "../types/error.types";

type InstitutionInput = {
  name: string;
  shortCode: string;
  domain: string;
  walletAddress?: string;
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

export const addInstitutionController = async (
  req: Request<{}, unknown, InstitutionInput, {}>,
  res: Response<{ message: string} | { error: string }>
) => {
  try {
    const { name, shortCode, domain, walletAddress, description } = req.body;

    if (!name || !shortCode || !domain) {
      return res.status(400).json({ error: "Name, short code, and domain are required" });
    }

    // Validate wallet address format if provided
    if (walletAddress && !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return res.status(400).json({ error: "Invalid Ethereum wallet address format" });
    }

    await addInstitutionsService({ name, shortCode, domain, walletAddress, description });

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
    if (updates.walletAddress && !/^0x[a-fA-F0-9]{40}$/.test(updates.walletAddress)) {
      return res.status(400).json({ error: "Invalid Ethereum wallet address format" });
    }

    await updateInstitutionService(Number(id), updates);
    res.status(200).json({ message: "Institution updated successfully" });
  } catch (err) {
    const error = err as CustomError;
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};

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