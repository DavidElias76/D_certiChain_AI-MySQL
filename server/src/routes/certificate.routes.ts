import rateLimit from "express-rate-limit";
import { Router } from "express";
import {
  issueCertificateController,
  getCertificatesByInstitutionController,
  getAllCertificatesCountController,
  getMyCertificatesController,
  verifyCertificateController,
  revokeCertificateController,
  verifyCertificateUploadController,
  getCarrerRecommendationsController,
  getCertificatePdfController
} from "../controllers/certificate.controller";
import { authMiddleware, optionalAuthMiddleware, requireRole, requireVerified } from "../middlewares/auth.middleware";
import { singleFileUpload } from "../middlewares/upload.middleware";

const router: Router = Router();

const verifyLimiter = rateLimit({
  windowMs: 60_000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many verification requests. Please wait a minute and try again." },
});

const uploadLimiter = rateLimit({
  windowMs: 60_000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many uploads. Please wait a minute and try again." },
});


router.get("/", authMiddleware,requireRole("main_admin", "admin"), getCertificatesByInstitutionController);
router.get("/my", authMiddleware, requireRole('student'), getMyCertificatesController);
router.get("/count", authMiddleware, (req, _res, next) => { console.log("[count]", req.user); next(); }, requireRole("systemAdmin"), getAllCertificatesCountController);
router.get("/verify/:certificateNumber", verifyLimiter, optionalAuthMiddleware, verifyCertificateController);
router.get("/:id/pdf", authMiddleware, getCertificatePdfController);
router.post("/issue", authMiddleware, requireRole("main_admin", "admin"), requireVerified, issueCertificateController); // // POST /certificate/issue — main_admin and admin only if verified
router.post("/verify/upload", uploadLimiter, singleFileUpload,optionalAuthMiddleware, verifyCertificateUploadController)
router.post("/career-recommendataions/:id", authMiddleware, getCarrerRecommendationsController)
router.delete("/:id", authMiddleware, requireRole("main_admin", "admin"), revokeCertificateController);

export default router;
