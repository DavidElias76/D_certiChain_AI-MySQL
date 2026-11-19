
import type { Request } from "express"

export type UserResponseService = {
    id: number
    username: string,
    email: string,
    role: string | undefined
    institution_id: number | null
    institution_name: string | null,
}

export type AuthControllerResponse = {
    message?: string
    user: UserResponseService;
    accessToken: string
}

export interface AuthResponseType {
    id: string
    username: string,
    role: string,
    institution_name: string,
    institution_id: number | null
}

export type UserRole = "admin" | "student" | "employer" | "main_admin";

export type IUserRequest =  {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  wallet_address?: string;
  institution_name?: string | "";
  isVerified?: boolean;
}

export type UserRequest = {
    username: string
    email?: string
    password: string
}

export interface DecodedToken {
    id: number
    role: string
    username: string
    email: string
    institution_name: string
    institution_id: number
}

export type UserType = {
    id: number,
    username: string;
    email: string;
    role: UserRole;
    institution_name: string;
    wallet_address?: string
    isVerified?: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export type UserRequestUpdate = {
    username?: string
    email?: string
    password?: string
    role?: UserRole,
    institution_name?: string;
}

export type findUserByIdOtpType = {
    username: string,
    email: string
    role: UserRole,
    is_verified?: boolean;
    verifyOtp: number | null
    verifyOtpExpiryAt: Date | null
    id: number 
}