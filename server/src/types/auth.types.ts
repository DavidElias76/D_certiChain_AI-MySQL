
import type { Request } from "express"

export type UserResponseService = {
    id: number
    username: string,
    role: string | undefined
}

export type AuthControllerResponse = {
    message?: string
    user: UserResponseService;
    accessToken: string
}

export type UserRole = "admin" | "student" | "employer";

export type IUserRequest =  {
  username: string;
  email: string;
  password: string;
  role: UserRole;
  wallet_address?: string;
  institution_name?: string | ""; // This let the employer logs in without the institution name
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
}

// export interface AuthenticatedRequest extends Request {
//     user: {
//         id: number;
//         username?: string;
//         role: string;
//     };
// }

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
    institutionName?: string;
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