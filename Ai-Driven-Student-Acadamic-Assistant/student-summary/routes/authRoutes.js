import express from "express";
import { googleCallback, oAuth2 } from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { notionCallback, notionoAuth2 } from "../controllers/authController.js";

const router = express.Router();

router.get("/google", oAuth2);
router.get("/google/callback", googleCallback);
router.get("/notion", notionoAuth2);
router.get("/notion/callback", authMiddleware, notionCallback);

export default router;
