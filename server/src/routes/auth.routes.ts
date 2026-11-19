import express from "express"
import type { Router } from "express"
import type { RateLimitRequestHandler } from "express-rate-limit"
import rateLimit from "express-rate-limit"
import { 
    signInController, 
    signUpController, 
    verifyController, 
    signOutController, 
    updateWalletAddressController,
    refreshController,
    forgotPasswordController,
    verifyPasswordController,
    UpdatePasswordController,
    changePasswordController
} from "../controllers/auth.controller"

import { authMiddleware } from "../middlewares/auth.middleware"

const authRoutes: Router = express.Router();

const authRateLimiter: RateLimitRequestHandler = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { message: "Too many login attempts, please try again later. Refresh the page" },
    standardHeaders: true,
    legacyHeaders: false,
});

authRoutes.post('/login', authRateLimiter, signInController)
authRoutes.post("/register", authRateLimiter,signUpController)
authRoutes.get('/verify', authMiddleware, verifyController)
authRoutes.post('/logout', authMiddleware, signOutController)
authRoutes.put('/wallet/:id', authMiddleware, updateWalletAddressController)
authRoutes.post('/change-password', authMiddleware, changePasswordController)
authRoutes.post('/refresh',  refreshController)

authRoutes.post('/forgot-password', forgotPasswordController)
authRoutes.post('/verfiy-forgot-password-otp', verifyPasswordController)
authRoutes.post('/reset-password', UpdatePasswordController)

export default authRoutes;