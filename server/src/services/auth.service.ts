import { AuthRepository } from "../repositories/auth.repository";
import type { CustomError } from "../types/error.types";
import type { UserResponseService } from "../types/auth.types";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UsersRepository } from "../repositories/users.repository";
import { generateAccessToken, generateRefreshToken } from "../utility/jwt"
import { OmitPasswordUser } from "../types/index.types";

export const signInService = async (email: string, password: string) => {
  try {
    const existingUser = await AuthRepository.signIn(email);

    if (!existingUser) {
      const error = new Error("User does not exist") as CustomError;
      error.statusCode = 404;
      throw error;
    }

    await UsersRepository.updateUser(existingUser.id, { is_verified: true });

    const isValidPassword: boolean = await bcrypt.compare(password, existingUser.password);
    if (!isValidPassword) {
      const error = new Error("Invalid password, try again!") as CustomError;
      error.statusCode = 401;
      throw error;
    }
    
    const payload = {
        id: existingUser.id,
        role: existingUser.role,
        username: existingUser.username,
      }

    const accessToken: string = await generateAccessToken(payload)
    const refreshToken: string = await generateRefreshToken(payload.id)

    const user: UserResponseService = {
      id: existingUser.id,
      username: existingUser.username,
      role: existingUser.role,
    };

    return { user, accessToken, refreshToken };
  } catch (error) {
    console.error("Error signing in the user", error);
    throw error;
  }
};

// Sign Up 
export const signUpService = async (
  username: string,
  email: string,
  password: string,
  institution_name: string,
) => {
  try {
    const existingUser = await AuthRepository.findByEmailOrUsername(email, username);

    if (existingUser) {
      const error = new Error(
        existingUser.email === email.toLowerCase()
          ? "Email already exists"
          : "Username already taken"
      ) as CustomError;
      error.statusCode = 409;
      throw error;
    }

    const salt: string = await bcrypt.genSalt(10);
    const hashedPassword: string = await bcrypt.hash(password, salt);

    const newUser = await UsersRepository.createUser({
      username,
      email,
      password: hashedPassword.trim(),
      role: "student",
      institution_name: institution_name,
    });

    const payload = {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
    }

    const accessToken: string = await generateAccessToken(payload)
    const refreshToken: string = await generateRefreshToken(payload.id)

    return {
      accessToken,
      refreshToken,
      user: {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
      },
    };
  } catch (error) {
    console.error("Error signing up the user", error);
    throw error;
  }
};


export const updateWalletAddressService = async (id: number, wallet_address: string) => {
  try {
    const updatedWallet = await AuthRepository.updateWalletAddress(id, wallet_address)
    if(!updatedWallet) {
      const error = new Error("wallet not updated") as CustomError;
      error.statusCode = 404;
      throw error;
    }
  } catch (error) {
    console.error('Error adding the wallet address')
    throw error
  }
}
