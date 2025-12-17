import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { summarizeCourseMaterial } from "../controllers/geminiController.js";

const router = express.Router();

router.post("/process", authMiddleware, summarizeCourseMaterial);
export default router;
