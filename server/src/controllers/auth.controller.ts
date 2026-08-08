import dotenv from "dotenv";
dotenv.config()
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { AuthControllerResponse, UserRequest, IUserRequest } from "../types/auth.types";
import type { CustomError } from "../types/error.types";
import { signInService, signUpService, updateWalletAddressService} from "../services/auth.service";
import { sendEmailOtp, sendWelcomeEmail } from "../email/authEmail";
import OptCode from "../utility/otpCode";
import { UsersRepository } from "../repositories/users.repository";
import { AuthRepository } from "../repositories/auth.repository";
import bcrypt from "bcrypt"

const REFRESH_TOKEN_EXPIRY_SECONDS = 15 * 24 * 60 * 60 * 1000;

export const signInController = async (
    req: Request<{}, unknown, UserRequest, {}>, 
    res: Response<AuthControllerResponse | { message: string} | { error: string }>
) => {
    try {
        const { email, password} = req.body;
         if(!email || !password) {
            return res.status(400).json({ message: "email and password are required!"});
         }
        const { user, accessToken, refreshToken} = await signInService(email, password);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV as string === "production",
            sameSite: "lax",       
            path: "/",
        });
        
        res.status(200).json({
            message: "User signed in successfully",
            accessToken,
            user: {
                id: user.id, 
                username: user.username,
                role: user.role
            },
        })

    } catch (error) {
        const err: CustomError = error as CustomError
        res.status(err.statusCode || 500).json({ error: err.message })
    }
}

export const signUpController = async (
    req: Request<{}, unknown, IUserRequest, {}>,
    res: Response<AuthControllerResponse | { message: string} | { error: string }>
) => {
    try {
        const { username, email, password, role, institution_name } = req.body;

        // The employers wil also be allowed to fill the institution_name - get know who verified you credentials 
        // it can also be removed to make the verification anonymous

         if (!username || !email || !password || !institution_name) {
            return res.status(400).json({ message: "Fill out all the fields" });
        }

        // find a way to make the institution name to null when the role is employer
        const validRoles = ["student", "employer", "admin", "systemAdmin"];
        if(!validRoles.includes(role)) {
            return res.status(400).json({
                error: "Invalid role. Must be student, employer or admin"
            });
        }
        
        let emailError: string = "";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const studentEmailRegex = /^[a-zA-Z0-9._-]+@students\.[a-zA-Z0-9-]+\.ac\.ke$/;
        // const adminRegex = !/^admin@[\w.-]+\.ac\.ke$/

        if (role === "student") {
            if (!institution_name) {
                return res.status(400).json({
                    error: "Institution name is required for students"
                });
            }
            if (!studentEmailRegex.test(email)) {
                emailError = "Student email must be in the format username@students.institution.ac.ke"
                return res.status(400).json({ error: emailError});
            }
        } else if (role === "admin") {
            if (!/^admin@[\w.-]+\.ac\.ke$/.test(email)) {
                emailError = "Admin email must follow: admin@yourinstitution.ac.ke";
                res.status(400).json({ error: emailError})
            }
        } else if (role === "employer") {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                emailError = "Please provide a valid email address";
                res.status(400).json({ error: emailError})
            }
        } else {
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    error: "Please provide a valid email address"
                });
            }
        }

        const { user, accessToken, refreshToken } = await signUpService(
            username, 
            email, 
            password,  
            role,
            institution_name,
        );

         res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV as string === "production",
            sameSite: "lax",
            path: "/",
        });

        await sendWelcomeEmail(email); // This will be sent when the user is created successfully

        res.status(201).json({
            message: "User added successfully",
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            },
            accessToken
        })

    } catch (error) {
        const err = error as CustomError;
        res.status(err.statusCode || 500).json({ error: err.message})
    }
}

// This need to be tested with the real wallet address - This will be added when the sepolia and a connect button
// The wallet address controller not working
export const updateWalletAddressController = async (
    req: Request<{}, unknown, { wallet_address: string }, {}>,
    res: Response<{ message: string} | { error: string}>
) => {
    try {
        const user = (req as any).user as { id: number } | undefined; // get the user from the request instead of the wallet context
        const { wallet_address } = req.body;

        console.log(wallet_address)
        console.log(user)
        if (!wallet_address) {
            return res.status(400).json({
                error: "Wallet address required."
            });
        }

        if (!user?.id) {
            return res.status(401).json({
                error: "Unauthorized."
            });
        }

        await updateWalletAddressService(user.id, wallet_address.toLowerCase().trim());

        return res.status(200).json({
            message: "Wallet address updated successfully."
        });

    } catch (error) {
        const err = error as CustomError;
        return res.status(err.statusCode || 500).json({ error: err.message });
    }
};

// verify token - the isVerfied value will be sent to true and proceed with the login
export const verifyController = (
    req: any, 
    res: any
): void => {
    try {
        res.status(200).json({
            authenticated: true,
            message: "User Authenticated",
            user: {
                id: req.user?.id,
                username: req.user?.username,
                role: req.user?.role,
                email: (req.user as any)?.email,
            }
    });
        
    } catch (error) {
        const err = error as CustomError;
        return res.status(err.statusCode || 500).json({ error: err.message || "Unauthorized!" });
    }
}

export const signOutController = (
    req: Request, 
    res: Response<{ message: string } | { error: string }>
) => {
    try {
        res.clearCookie("refreshToken", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
        });
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        const err = error as CustomError;
        return res.status(err.statusCode || 500).json({ error: err.message });
    }
};

export const refreshController = async (
    req: Request<{}, unknown, {}, {}>, 
    res: Response<{ accessToken: string } | { error: string} | { message: string}>
): Promise<void> => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
        res.status(401).json({ message: "No refresh token provided" });
        return;
    }
    try {
        const decoded = jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET as string
        ) as { id: number };

        const user = await UsersRepository.findUserById(decoded.id);
        if (!user) {
            res.status(401).json({ message: "User not found" });
            return;
        }
        
        const accessToken = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.ACCESS_TOKEN_SECRET as string,
            { expiresIn: "15m" }
        );

        res.status(200).json({ accessToken });
  } catch(error) {
    const err = error as CustomError;
    res.status(403).json({ message: "Invalid or expired refresh token", error: err.message });
  }
};

export const forgotPasswordController = async (
    req: Request<{}, unknown, { email: string }, {}>, 
    res: Response<{ message: string } | { error: string }>
) => {
    try {
        const { email } = req.body;
        let existingUser = await AuthRepository.findByEmail(email);

        if(!existingUser) {
            return res.status(400).json({ message: 'User not found!'})
        }

        const otpCode = await OptCode();
        await sendEmailOtp(existingUser.email, otpCode);

        // ExistingUser.is_verified = true;
        existingUser.verifyOtp = otpCode; 
        existingUser.verifyOtpExpiryAt = new Date(Date.now() + 30 * 60 * 1000); // the code expires in 30 mins 

        await AuthRepository.updateOtp(
            // existingUser.is_verified, 
            existingUser.verifyOtp, 
            existingUser.verifyOtpExpiryAt, 
            existingUser.email
        );

        res.status(200).json({ message: 'OTP sent to your email'})
    } catch (error) {
        const err = error as CustomError;
        return res.status(err.statusCode || 500).json({
            error: err.message
        });
    }
}

// verify the email and set the value of the is_verified to true - this will have the modal
export const verifyPasswordController = async (
    req: Request<{}, unknown, { OptCode: number; email: string }, {}>,
    res: Response<{ message: string} | { error: string} | { success: boolean}>
) => {
    try {
        const { OptCode, email } = req.body;

        const existingUser = await AuthRepository.findByEmail(email);

        if (!existingUser) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (!existingUser.verifyOtp) {
            return res.status(400).json({
                message: "No OTP found. Please request a new one."
            });
        }

        if (!existingUser.verifyOtpExpiryAt || existingUser.verifyOtpExpiryAt.getTime() < Date.now()) {
            return res.status(400).json({
                message: "OTP has expired. Please request a new one."
            });
        }

        // Invalid OTP - compare the opt code
        if (Number(existingUser.verifyOtp) !== Number(OptCode)) {
            return res.status(400).json({
                message: "Invalid OTP code!"
            });
        }

        // OTP verified successfully
        existingUser.verifyOtp = null;
        existingUser.verifyOtpExpiryAt = null;

        return res.status(200).json({ success: true, message: 'OTP verified successfully'});
    } catch (error) {
        const err = error as CustomError;
        return res.status(err.statusCode || 500).json({
            error: err.message
        });
    }
};

// update the password after verification
export const UpdatePasswordController = async (
    req: Request<{}, unknown, {email: string; password: string}, {}>,
    res: Response<{ message: string} | { error: string}>
) => {
    try {
    const { email, password } = req.body;
    const existingUser = await AuthRepository.findByEmail(email);

     if (!existingUser) {
      const error = new Error("User does not exist") as CustomError;
      error.statusCode = 404;
      throw error;
    }

    const salt: string = await bcrypt.genSalt(10);
    const hashedPassword: string = await bcrypt.hash(password, salt);

    await AuthRepository.UpdatePassword(hashedPassword, email)

    return res.status(200).json({ message: "Password updated successfully" })
} catch (error) {
     const err = error as CustomError;
        return res.status(err.statusCode || 500).json({
            error: err.message
    });
}
}