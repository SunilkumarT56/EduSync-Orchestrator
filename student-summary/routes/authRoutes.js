import express from "express";
import { googleCallback, oAuth2 } from "../controllers/authController.js";

const router = express.Router();

router.get("/google", oAuth2);
router.get("/google/callback" , googleCallback)

export default router;

