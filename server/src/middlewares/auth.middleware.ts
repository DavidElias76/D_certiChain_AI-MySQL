import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import type { DecodedToken } from "../types/auth.types";
import { UsersRepository } from '../repositories/users.repository'
const NO_TOKEN = "No token provided. Please log in.";
const BAD_TOKEN = "Invalid or expired token. Please log in again.";

const userFromToken = (token: string) => {
  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string, {
    algorithms: ["HS256"],
  }) as DecodedToken;
  return {
    id: decoded.id,
    username: decoded.username,
    email: decoded.email,
    role: decoded.role,
    institution_name: decoded.institution_name,
    institution_id: decoded.institution_id,
  };
};

export const authMiddleware: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  if (!token) {
    res.status(401).json({ message: NO_TOKEN });
    return;
  }
  try {
    req.user = userFromToken(token);
    next();
  } catch {
    res.status(401).json({ message: BAD_TOKEN });
  }
};

// For public endpoints that are better when we know who is asking.
// No Authorization header: continue anonymously.
// A header that is present but bad or expired: 401, so the client's refresh interceptor can retry.
export const optionalAuthMiddleware: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    next();
    return;
  }
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  if (!token) {
    res.status(401).json({ message: BAD_TOKEN });
    return;
  }
  try {
    req.user = userFromToken(token);
    next();
  } catch {
    res.status(401).json({ message: BAD_TOKEN });
  }
};

export const requireRole =
  (...roles: string[]): RequestHandler =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: "You do not have permission to do this." });
      return;
    }
    next();
  };

  // you can add to check the role
  //  is main_admin : contact system admin for verification
  //  admin: contact main_admin for verification
  export const requireVerified: RequestHandler = async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        res.status(401).json({ error: "Not authenticated" });
        return;
      }

      if (!(await UsersRepository.isVerified(user.id))) {
        res.status(403).json({ error: "Please verify your account first." });
        return;
      }

      next();
    } catch {
      res.status(500).json({ error: "Could not check account verification." });
    }
};