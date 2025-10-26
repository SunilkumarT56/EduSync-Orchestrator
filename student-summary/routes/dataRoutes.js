import express from "express";
import { getClassroomCourses } from "../controllers/classroomController.js";
import { fetchCourseCalendarEvents } from "../controllers/calenderController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { auth } from "googleapis/build/src/apis/abusiveexperiencereport/index.js";

const router = express.Router();

router.get("/google-classroom", authMiddleware, getClassroomCourses);
router.get("/google-calender",authMiddleware, fetchCourseCalendarEvents);

export default router;
