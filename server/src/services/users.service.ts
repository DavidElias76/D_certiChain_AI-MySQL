import { UsersRepository }  from "../repositories/users.repository";
import type { UserRole } from "../types/index.types";
import type { CustomError } from "../types/error.types";
import bcrypt from "bcrypt";
import { OmitPasswordUser } from "../types/index.types";
import { UserCreateInput } from "../models_sequelize_typescript";
import { AuthRepository } from "../repositories/auth.repository";
import { InstitutionRepository } from "../repositories/institution.repository";

const INSTITUTION_EMAIL_RE = /^[^\s@]+@(?:[a-z0-9-]+\.)*([a-z0-9-]+)\.ac\.ke$/i;

const VISIBLE_ROLES: Record<string, string[]> = {
  main_admin: ["admin", "student"],
  admin: ["student"],
};

const httpError = (message: string, statusCode: number): CustomError => {
  const err = new Error(message) as CustomError;
  err.statusCode = statusCode;
  return err;
};

const getShortCodeFromEmail = (email: string): string | null => {
  const match = email.trim().toLowerCase().match(INSTITUTION_EMAIL_RE);
  return match ? match[1] : null;
};

// export const getUsersService = async (): Promise<OmitPasswordUser[]> => {
//     try {
//       return await UsersRepository.findAllUsers();
//     } catch (error) {
//       console.error("Error getting the users", error);
//       throw error;
//     }
// };

export const getUsersByRoleService = async ({
  role,
  institutionId,
}: {
  role: string;
  institutionId: number | null | undefined;
}) => {
  if (role === "systemAdmin") {
    return UsersRepository.findMainAdmins();
  }

  const visible = VISIBLE_ROLES[role];
  if (!visible) throw httpError("You do not have permission to view users.", 403);
  if (!institutionId) throw httpError("Your account is not linked to an institution.", 403);

  return UsersRepository.findByInstitutionAndRoles(institutionId, visible);
};


export const getUsersByIdService = async (
  institutionId: number,
  roles: string[]
): Promise<OmitPasswordUser[]> => {
  try {
    const users = await UsersRepository.findUsersByInstitutionAndRoles(
      institutionId,
      roles
    );

    if (!users || users.length === 0) {
      const error = new Error("Users not found") as CustomError;
      error.statusCode = 404;
      throw error;
    }

    return users as OmitPasswordUser[];
  } catch (error) {
    console.error("Error getting users by institution ID", error);
    throw error;
  }
};

export const addUsersService = async (
    username: string,
    email: string,
    password: string,
    role: UserRole,
    registrationNumber?: string | null,
    institution_name?: string,
) => {
  try {

    // matches: 2612345@students.ku.ac.ke | john@admin.ku.ac.ke | john@ku.ac.ke
       const shortCode = getShortCodeFromEmail(email);
        if (!shortCode) {
          const error = new Error("Use your institution email address") as CustomError;
          error.statusCode = 400;
          throw error;
        }

        const institutionId = await InstitutionRepository.findInstitutionIdByShortCode(shortCode);

        if (institutionId === null) {
          const error = new Error("Institution is not registered") as CustomError;
          error.statusCode = 404;
          throw error;
        }

        const chosen = await UsersRepository.findByName(institution_name ?? "");
        if (!chosen || chosen.id !== institutionId) {
          const error = new Error("The email does not belong to this institution") as CustomError;
          error.statusCode = 400;
          throw error;
        }

        const existingUser = await UsersRepository.findByEmail(email)
        if(existingUser) {
          const error = new Error("User alreadyexist with that email")as CustomError
          error.statusCode = 409;
          throw error;
        }

        // need to add a find by institution name to update ths intitution_id
        const salt: string = await bcrypt.genSalt(10)
        const hashedPassword: string = await bcrypt.hash(password, salt) 

       const newUser = await UsersRepository.createUser({
          username,
          email,
          password: hashedPassword,
          role,
          institution_name,
          registration_number: registrationNumber ?? null,
          institution_id: institutionId,
          is_verified: false,
      });

      if (!newUser) {
          throw new Error("Failed to create user");
      }

      const user = {
          id: newUser.id,
          username: newUser.username,
          role: newUser.role,
      };

      if(!user) {
        const error = new Error("User not added") as CustomError;
        error.statusCode = 404;
        throw error;
      }
      return { user };
  } catch (error) {
      console.error("Error adding the user", error);
      throw error;
  }
}

export const updateUsersService = async (id: number, updateObject: Partial<UserCreateInput>) => {
  try {
    if(updateObject.password){
      const salt: string = await bcrypt.genSalt(10)
      updateObject.password = await bcrypt.hash(updateObject.password, salt)
    }
    
    const updatedRow: boolean = await UsersRepository.updateUser(Number(id), updateObject)
    if (!updatedRow) {
      const error = new Error("User not found") as CustomError;
       error.statusCode = 404;
      throw error;     
    }
    return;
  } catch (error) {
      console.error("Error updating the user", error);
      throw error;
  }
}

export const updateAdminStatusService = async (
  targetId: number, isVerified: boolean
) => {
  try {
    return await UsersRepository.updateUserStatus(targetId, isVerified)
  } catch (error) {
    console.error("Error updating the Admin status", error);
    throw error;
  }
}

export const deleteUserService = async (id: number) => {
  try {
    const deletedUser: boolean = await UsersRepository.deleteUser(id)
    if(!deletedUser) {
      const error = new Error("Error deleting the user") as CustomError;
      error.statusCode = 404;
      throw error;
    }
    return;
  } catch (error) {
    console.error("Error deleting the user", error);
    throw error;
  }
}

