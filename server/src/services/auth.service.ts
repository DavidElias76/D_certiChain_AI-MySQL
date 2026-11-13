import { AuthRepository } from "../repositories/auth.repository";
import type { CustomError } from "../types/error.types";
import type { UserResponseService } from "../types/auth.types";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UsersRepository } from "../repositories/users.repository";
import { generateAccessToken, generateRefreshToken } from "../utility/jwt"
import { OmitPasswordUser } from "../types/index.types";
import { UserRole } from "../types/auth.types";

export const buildTokenPayload = (user: {
  id: number;
  username: string;
  email: string;
  role: string;
  institution_id?: number | null;
  institution_name?: string | null;
}) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  role: user.role,
  institution_id: user.institution_id ?? null,
  institution_name: user.institution_name ?? null,
});

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

    const payload = buildTokenPayload(existingUser);
    const accessToken: string = await generateAccessToken(payload);
    const refreshToken: string = await generateRefreshToken(existingUser.id);
   
    const user = {
      id: existingUser.id,
      username: existingUser.username,
      email: existingUser.email,
      role: existingUser.role,
      institution_id: existingUser.institution_id,
      institution_name: existingUser.institution_name
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
  role: UserRole,
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
      role,
      institution_name: institution_name,
    });

    const payload = {
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
        email: newUser.email,
    }

    const accessToken: string = await generateAccessToken(payload)
    const refreshToken: string = await generateRefreshToken(payload.id)

    return {
      accessToken,
      refreshToken,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        institution_id: newUser.institution_id,
        institution_name: newUser.institution_name
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
