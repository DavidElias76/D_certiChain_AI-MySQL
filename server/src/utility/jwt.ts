
import dotenv from "dotenv"
dotenv.config()

import jwt from "jsonwebtoken";

interface JwtPayload {
  id: number;
  username: string;
  role: string;
  email: string;
}

// generate the access token
export async function generateAccessToken(payload: JwtPayload) {
      return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: "15m",
  });
}

// generate the refresh token
export async function generateRefreshToken(userId: number) {
  return jwt.sign(
    { id: userId },
    process.env.REFRESH_TOKEN_SECRET!,
    {
      expiresIn: "7d",
    }
  );
};