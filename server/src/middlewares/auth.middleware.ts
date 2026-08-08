import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import type { DecodedToken } from "../types/auth.types";
import { decode } from "node:punycode";

export const authMiddleware: RequestHandler = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'] || req.headers.authorization;

    if (!authHeader?.startsWith("Bearer")) {
      res.status(401).json({ message: "No token provided. Please log in." });
      return;
    }
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        res.status(401).json({ message: "No token provided. Please log in." });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    ) as DecodedToken;

    if(!decode) {
      return res.status(403).json({ message: "Unauthorized"})
    }

    // i have removes the email section in this page - not needed
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