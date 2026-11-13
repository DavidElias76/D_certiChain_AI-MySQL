import type { Request, Response, NextFunction } from "express";

/**
 * Role-based access control middleware.
 * Checks that the authenticated user has one of the allowed roles.
 */

// NOTE: this has a problem and it is cousing so do not use it
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

// need the getUser function which will be added to the utils folder, and after the completion of the project

// const requireInstitutionAdmin = (req: Request, res: Response) => {
//   const user = getAuthUser(req);
//   if (!user?.id) {
//     res.status(401).json({ error: "Unauthorized" });
//     return null;
//   }
//   if (user.role !== "admin" && user.role !== "main_admin") {
//     res.status(403).json({ error: "Only institution admins can do this" });
//     return null;
//   }
//   const institutionId = Number(user.institution_id);
//   if (!Number.isInteger(institutionId) || institutionId <= 0) {
//     res.status(403).json({ error: "Your account is not linked to an institution" });
//     return null;
//   }
//   return { id: user.id, institutionId };
// };