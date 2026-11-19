
import type { Request, Response} from "express"
import type { CustomError } from "../types/error.types";
import { 
  getUsersByIdService, 
  getUsersByRoleService, 
  addUsersService, 
  updateUsersService, 
  updateAdminStatusService, 
  deleteUserService 
} from "../services/users.service";
import { OmitPasswordUser, UserRole } from "../types/index.types";
import { UserCreateInput } from "../types/index.types"
import {
  CREATABLE_ROLES,
  assertCanManage,
  emailErrorForRole,
  parseUserId,
} from "../services/permissions/users.permissions";
import { UsersRepository } from "../repositories/users.repository";

const ALLOWED_ROLES = ["systemAdmin", "main_admin", "admin"];

export const getUsersByRoleController = async (
  req: Request,
  res: Response<OmitPasswordUser[] | { error: string }>
) => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }

    if (!ALLOWED_ROLES.includes(user.role)) {
      res.status(403).json({ error: "You do not have permission to view users." });
      return;
    }

    if (user.role !== "systemAdmin" && !user.institution_id) {
      res.status(403).json({ error: "Your account is not linked to an institution." });
      return;
    }

    const users = await getUsersByRoleService({
      role: user.role,
      institutionId: user.institution_id,
    });

    res.status(200).json(users as OmitPasswordUser[]);
  } catch (err: any) {
    const error = err as CustomError;
    res.status(error.statusCode || 500).json({ error: error.message });
  }
};

export const getUsersByIdController = async (
  req: Request<{ institutionId: string }, unknown, {}, { roles?: string[] }>,
  res: Response<{ message: string; users: OmitPasswordUser[] } | { error: string }>
) => {
  try {
    const { institutionId } = req.params;
    const { roles } = req.query;

    const id = Number(institutionId);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        error: "Invalid institution ID",
      });
    }

    if (!roles || roles.length === 0) {
      return res.status(400).json({
        error: "At least one user role is required",
      });
    }

    const users = await getUsersByIdService(id, roles);

    if (!users || users.length === 0) {
      return res.status(404).json({
        error: "No users found for this institution",
      });
    }

    return res.status(200).json({
      message: "success",
      users,
    });
  } catch (err: any) {
    const error = err as CustomError;

    return res.status(error.statusCode || 500).json({
      error: error.message || "Internal server error",
    });
  }
};

export const addUsersController = async (
  req: Request<{}, unknown, UserCreateInput, {}>,
  res: Response<{ message: string } | { error: string }>
) => {
  try {
      const actor = req.user;
      if (!actor) return res.status(401).json({ error: "Not authenticated" });

      const creatable = CREATABLE_ROLES[actor.role];
      if (!creatable) {
        return res.status(403).json({ error: "You do not have permission to add users." });
      }

      const { username, email, password, role, registration_number, institution_name } = req.body;

      let registrationNumber: string | null = null;
      if (role === "student") {
        registrationNumber = registration_number?.trim() ?? "";
        if (!registrationNumber) {
          return res.status(400).json({ error: "Registration number is required for students." });
        }
        if (registrationNumber.length > 50) {
          return res.status(400).json({ error: "Registration number is too long." });
        }
      }

      let targetInstitution: string;

      if (actor.role === "systemAdmin") {
        const requested = institution_name?.trim();
        if (!requested) {
          return res.status(400).json({ error: "Select an institution for this admin." });
        }

        const institution = await UsersRepository.findByName(requested);
        if (!institution) {
          return res.status(404).json({ error: "Institution not found." });
        }
        targetInstitution = institution.name; // use the stored spelling
      } else {
        if (!actor.institution_name) {
          return res.status(403).json({ error: "Your account is not linked to an institution." });
        }
        targetInstitution = actor.institution_name;
      }

      if (!creatable.includes(role)) {
        return res.status(403).json({ error: `You can only add: ${creatable.join(", ")}.` });
      }

      const emailError = emailErrorForRole(role, email);
      if (emailError) return res.status(400).json({ error: emailError });

      const { user } = await addUsersService(
        username.trim(),
        email.trim(),
        password,
        role as UserRole,
        registrationNumber,
        targetInstitution
      );

      if (!user) return res.status(500).json({ error: "Failed to create user" });

      return res.status(201).json({ message: "User registered successfully" });
    } catch (err: any) {
      const error = err as CustomError;
      return res.status(error.statusCode || 500).json({ error: error.message });
    }
};

export const updateUsersController = async (
  req: Request<{ id: string }, unknown, Partial<UserCreateInput>, {}>,
  res: Response<{ message: string } | { error: string }>
) => {
  try {
    const actor = req.user;
    if (!actor) return res.status(401).json({ error: "Not authenticated" });

    const targetId = parseUserId(req.params.id);
    const target = await assertCanManage(actor, targetId);

    const { username, email, password, role } = req.body ?? {};

    if (role !== undefined) {
      const assignable = CREATABLE_ROLES[actor.role] ?? [];
      if (!assignable.includes(role)) {
        return res.status(403).json({ error: "You cannot assign this role." });
      }
    }

    if (email) {
      const emailError = emailErrorForRole(role ?? target.role, email);
      if (emailError) return res.status(400).json({ error: emailError });
    }

    const userUpdate = {
      ...(username && { username: username.trim() }),
      ...(email && { email: email.trim() }),
      ...(password && { password }),
      ...(role && {
        role: role as NonNullable<Parameters<typeof updateUsersService>[1]["role"]>,
      }),
    };

    if (Object.keys(userUpdate).length === 0) {
      return res.status(400).json({ error: "No data provided for update" });
    }

    await updateUsersService(targetId, userUpdate);

    return res.status(200).json({ message: "User updated successfully" });
  } catch (err: any) {
    const error = err as CustomError;
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};

export const updateAdminStatusController = async(
  req: Request<{ id: string}, {}, { is_verified: boolean}, {}>,
  res: Response<any>
) =>{
  try {

    const actor = req.user;
    if (!actor) return res.status(401).json({ error: "Not authenticated" });

    const role = req.user?.role; 
    if(role !== 'main_admin' && role !== 'systemAdmin') {
       return res.status(404).json({ error: 'Not authorized to update the admin status'})
    }

    const targetId = parseUserId(req.params.id)
    const isVerfied = req?.body?.is_verified

    if(typeof isVerfied !== 'boolean') {
      res.status(500).json({ error: 'The statsu must be a boolean value'})
    } 

    await updateAdminStatusService(targetId, isVerfied)

    return res.status(200).json({ message: "Admin status updated successfully" });
  } catch (err: any) {
    const error = err as CustomError;
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
}

export const deleteUsersController = async (
  req: Request<{ id: string }>,
  res: Response<{ message: string } | { error: string }>
) => {
  try {
    const actor = req.user;
    if (!actor) return res.status(401).json({ error: "Not authenticated" });

    const targetId = parseUserId(req.params.id);
    await assertCanManage(actor, targetId);

    await deleteUserService(targetId);
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (err: any) {
    const error = err as CustomError;
    return res.status(error.statusCode || 500).json({ error: error.message });
  }
};
