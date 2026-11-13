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

// The system admin can read any institution. main_admin and admin can read only their own
// (the controller checks req.user.institution_id against :id). Never returns the encrypted key.
router.get("/:id",
    authMiddleware,
    roleMiddleware(["systemAdmin", "main_admin", "admin"]),
    getInstitutionByIdController
);

// Creates the institution in the DB only. No wallet and no blockchain call.
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

// Body: { private_key }. The backend derives the address, registers the institution
// on-chain with the platform key, then saves the address and the encrypted key.
// main_admin only, and only once per institution.
// Must stay above PATCH "/:id" or "wallet" would be read as an id.
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