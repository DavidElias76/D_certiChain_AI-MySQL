import { UsersRepository }  from "../repositories/users.repository";
import type { UserRole } from "../types/index.types";
import type { CustomError } from "../types/error.types";
import bcrypt from "bcrypt";
import { OmitPasswordUser } from "../types/index.types";
import { UserCreateInput } from "../models_sequelize_typescript";

export const getUsersService = async (): Promise<OmitPasswordUser[]> => {
    try {
      return await UsersRepository.findAllUsers();
    } catch (error) {
      console.error("Error getting the users", error);
      throw error;
    }
};

export const getUserByIdService = async (id: number) => {
    try {
      const getUser = await UsersRepository.findUserById(id)
      if(!getUser) {
        const error = new Error("User not found") as CustomError
        error.statusCode = 404;
        throw error;
      }
      return getUser;
    } catch (error) {
      console.error("Error getting the user with id", error);
      throw error;
    }
}

export const addUsersService = async (
    username: string,
    email: string,
    password: string,
    role: UserRole,
    institution_name?: string,
    is_verified? : boolean
) => {
  try {
        const existingUser = await UsersRepository.findByEmail(email)
        if(existingUser) {
          const error = new Error("User alreadyexist with that email")as CustomError
          error.statusCode = 404;
          throw error;
        }

        const salt: string = await bcrypt.genSalt(10)
        const hashedPassword: string = await bcrypt.hash(password, salt) 

       const newUser = await UsersRepository.createUser({
          username,
          email,
          password: hashedPassword,
          role,
          institution_name,
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

