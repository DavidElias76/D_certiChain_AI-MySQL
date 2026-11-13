import type { Request } from "express";
import { UsersRepository } from "../../repositories/users.repository";
import type { CustomError } from "../../types/error.types";

export type Actor = NonNullable<Request["user"]>;

export const httpError = (message: string, statusCode: number): CustomError => {
  const err = new Error(message) as CustomError;
  err.statusCode = statusCode;
  return err;
};

// Roles each caller may see, edit and delete.
export const MANAGEABLE_ROLES: Record<string, string[]> = {
  systemAdmin: ["main_admin"],
  main_admin: ["admin", "student"],
  admin: ["student"],
};

// Roles each caller may create or assign.
export const CREATABLE_ROLES: Record<string, string[]> = {
  systemAdmin: ["main_admin"],
  main_admin: ["admin", "student"],
  admin: ["student"],
};

export const parseUserId = (value: unknown): number => {
  const id = Number(value);
  if (typeof value !== "string" || !/^\d+$/.test(value) || !Number.isSafeInteger(id) || id <= 0) {
    throw httpError("Invalid user id", 400);
  }
  return id;
};

// Loads the target and confirms the caller may manage it - this is only called by the system admin only
// Out-of-scope users get the same 404 as missing ones, so ids can't be probed.
export const assertCanManage = async (actor: Actor, targetId: number) => {
  const target = await UsersRepository.findUserById(targetId);
  const allowed = MANAGEABLE_ROLES[actor.role] ?? [];

  const inScope =
    !!target &&
    allowed.includes(target.role) &&
    (actor.role === "systemAdmin" ||
      (actor.institution_id != null && target.institution_id === actor.institution_id));

  if (!inScope) throw httpError("User not found", 404);
  return target;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const adminRegex = /^(?:admin@[\w.-]+\.ac\.ke|[\w.+-]+@admin\.[\w-]+\.ac\.ke)$/i;
const studentEmailRegex = /^[a-zA-Z0-9._-]+@students\.[a-zA-Z0-9-]+\.ac\.ke$/;

// Returns an error message, or null when the email is fine for that role.
export const emailErrorForRole = (role: string, email: string): string | null => {
  const value = email.trim();
  if (role === "student") {
    return studentEmailRegex.test(value)
      ? null
      : "Student email must be in the format username@students.institution.ac.ke";
  }
  if (role === "admin") {
    return adminRegex.test(value)
      ? null
      : "Admin email must follow admin@institution.ac.ke or name@admin.institution.ac.ke";
  }
  return emailRegex.test(value) ? null : "Please provide a valid email address";
};