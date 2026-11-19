import type { Request, Response, NextFunction } from "express";

export const roleMiddleware = (allowedRoles: string[]) => {
  return (
    req: Request, 
    res: Response, 
    next: NextFunction
  ): void => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized. Please log in first." });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: `Access denied. Required role: ${allowedRoles.join(" or ")}.`,
      });
      return;
    }

    next();
  };
};
