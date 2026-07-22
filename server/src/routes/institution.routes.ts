import { Router } from "express";
import {
  getInstitutionController,
  addInstitutionController,
  updateInstitutionController,
  deleteInstitutionController,
} from "../controllers/institution.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { roleMiddleware } from "../middlewares/role.middleware";

const router: Router = Router();

router.get("/", 
    authMiddleware, 
    roleMiddleware(["systemAdmin"]), 
    getInstitutionController
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

router.delete("/:id", 
    authMiddleware,
    roleMiddleware(["systemAdmin"]),
    deleteInstitutionController
);

export default router;