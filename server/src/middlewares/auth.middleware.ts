import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import type { DecodedToken } from "../types/auth.types";

// we need to fix the auth to acccept the updatemiddleware controller
export const authMiddleware: RequestHandler = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: "No token provided. Please log in." });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    ) as DecodedToken;

    req.user = {
      id: decoded.id,
      username: decoded.username,
      role: decoded.role,
    };

    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token. Please log in again." });
  }
};