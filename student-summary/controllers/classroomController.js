import { google } from "googleapis";
import { oAuth2Client } from "../services/googleService.js";
import { User } from "../models/User.js";

export const getClassroomCourses = async (req, res) => {
  try {
    // Step 1: find user
    const user = await User.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Step 2: set Google tokens
    oAuth2Client.setCredentials({
      access_token: user.access_token,
      refresh_token: user.refresh_token,
      expiry_date: user.expiry_date,
    });

    // Step 3: init Classroom API
    const classroom = google.classroom({ version: "v1", auth: oAuth2Client });

    // Step 4: fetch all active courses
    const result = await classroom.courses.list({
      courseStates: ["ACTIVE"],
      pageSize: 100,
    });

    const courses = result.data.courses || [];
    const coursesWithFolders = [];

    // Step 5: fetch each course details (Drive folder etc.)
    for (const course of courses) {
      try {
        const details = await classroom.courses.get({ id: course.id });
        const folderInfo = details.data.courseDriveFolder || null;

        coursesWithFolders.push({
          courseId: course.id,
          name: course.name,
          section: course.section,
          ownerId: course.ownerId,
          alternateLink: course.alternateLink,
          calendarId: course.calendarId,
          courseDriveFolder: folderInfo ? folderInfo.alternateLink : null,
        });
      } catch (err) {
        console.warn(`Error fetching folder for course ${course.id}:`, err.message);
      }
    }

    // Step 6: store courses in DB
    user.courses = coursesWithFolders; // replace or update
    await user.save();

    // Step 7: respond
    res.status(200).json({
      message: "Courses fetched and stored successfully",
      courses: user.courses,
    });

  } catch (err) {
    console.error("Error fetching Classroom courses:", err);
    res.status(500).json({ message: "Failed to fetch Classroom courses" });
  }
};