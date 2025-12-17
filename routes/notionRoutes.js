import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  createNotionChildPage,
  createNotionParentPage,
} from "../controllers/notionController.js";
dotenv.config();
const router = express.Router();

router.post("/create-parent", authMiddleware, createNotionParentPage);
router.post("/create-course-pages", authMiddleware, createNotionChildPage);

export default router;
