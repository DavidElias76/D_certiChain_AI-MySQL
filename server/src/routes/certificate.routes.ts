import { Router } from "express";
import {
  issueCertificateController,
  getAllCertificatesController,
  getCertificatesByIssuerController,
  getMyCertificatesController,
  revokeCertificateController,
} from "../controllers/certificate.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router: Router = Router();

// POST /certificate/issue — admin only
router.post("/issue", authMiddleware, issueCertificateController);

// GET /certificate/my — get certificates belonging to the logged-in student
router.get("/my", authMiddleware, getMyCertificatesController);

// GET /certificate/all — admin only (all certs by this issuer) - This will be the admin based on the institution
router.get("/all", authMiddleware, getCertificatesByIssuerController);

// GET /certificate — get certificates issued by the logged-in user
router.get("/", authMiddleware, getCertificatesByIssuerController);

// DELETE /certificate/:id — revoke
router.delete("/:id", authMiddleware, revokeCertificateController);

export default router;
