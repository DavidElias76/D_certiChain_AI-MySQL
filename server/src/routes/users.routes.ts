import type { Router } from "express"
import express from "express"
import { 
    getUsersByIdController, 
    getUsersByRoleController ,
    addUsersController, 
    updateUsersController,
    updateAdminStatusController, 
    deleteUsersController,
} from "../controllers/users.controller";

import { authMiddleware, requireRole } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";

const usersRoutes: Router = express.Router()

// usersRoutes.use(authMiddleware, roleMiddleware(["systemAdmin", "main_admin", "admin"]))
usersRoutes.get("/",  authMiddleware, getUsersByRoleController);
usersRoutes.post("/add", authMiddleware, requireRole('systemAdmin', 'main_admin', 'admin'), addUsersController);
usersRoutes.put("/:id", authMiddleware, requireRole('systemAdmin', 'main_admin', 'admin'), updateUsersController);
usersRoutes.patch('/:id/status', authMiddleware,  requireRole('main_admin', 'systemAdmin'), updateAdminStatusController)
usersRoutes.delete("/:id", authMiddleware, deleteUsersController);

export default usersRoutes;
