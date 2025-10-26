import express from "express";
import { fetchCourseMaterials} from "../controllers/googleDriveController.js";
import { authMiddleware} from "../middlewares/authMiddleware.js"; // if you use JWT or session

const router = express.Router();

// GET /api/google/drive/resources
router.get("/course", authMiddleware, fetchCourseMaterials);

export default router;