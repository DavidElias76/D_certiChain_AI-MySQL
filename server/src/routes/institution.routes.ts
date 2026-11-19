import { Router } from "express";
import {
  getInstitutionController,
  getInstitutionByIdController,
  getMyInstitutionController,
  addInstitutionController,
  updateInstitutionController,
  updateInstitutionStatusController,
  deleteInstitutionController,
  setupWalletController
} from "../controllers/institution.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";

const router: Router = Router();

router.get("/",
    authMiddleware,
    roleMiddleware(["systemAdmin"]),
    getInstitutionController
);

router.get("/me", 
    authMiddleware, 
    getMyInstitutionController
);

router.get("/:id",
    authMiddleware,
    roleMiddleware(["systemAdmin", "main_admin", "admin"]),
    getInstitutionByIdController
);

router.post("/add",
    authMiddleware,
    roleMiddleware(["systemAdmin"]),
    addInstitutionController
);

router.put("/:id",
    authMiddleware,
    roleMiddleware(["systemAdmin"]),
    updateInstitutionController
);

router.patch("/wallet",
    authMiddleware,
    roleMiddleware(["main_admin"]),
    setupWalletController
);

router.patch("/:id",
    authMiddleware,
    roleMiddleware(["systemAdmin"]),
    updateInstitutionStatusController
);

router.delete("/:id",
    authMiddleware,
    roleMiddleware(["systemAdmin"]),
    deleteInstitutionController
);

export default router;