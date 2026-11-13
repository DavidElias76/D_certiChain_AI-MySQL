import rateLimit from "express-rate-limit";
import { Router } from "express";

import { authMiddleware, requireRole } from "../middlewares/auth.middleware";
import { RecommendationsController } from "../controllers/recommendations.controller";

const recommendationsRouter: Router = Router();

recommendationsRouter.use(authMiddleware, requireRole("student", "alumni"));

const readLimiter = rateLimit({
  windowMs: 60_000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please wait a minute and try again." },
});

const generateLimiter = rateLimit({
  windowMs: 10 * 60_000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => String((req as any).user?.id ?? "anon"),
  message: { error: "You have requested too many recommendations. Please try again later." },
});

recommendationsRouter.use(authMiddleware);

recommendationsRouter.get(
  "/certificate/:certificateId",
  readLimiter,
  RecommendationsController.getByCertificate
);

recommendationsRouter.post(
  "/certificate/:certificateId",
  generateLimiter,
  RecommendationsController.generate
);

export default recommendationsRouter;