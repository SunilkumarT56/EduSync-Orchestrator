import { google } from "googleapis";
import { oAuth2Client } from "../services/googleService.js";
import { User } from "../models/User.js";


 
export const fetchCourseCalendarEvents = async (req, res) => {
  try {
    // 1️⃣ Get the user from DB
    const user = await User.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // 2️⃣ Set OAuth2 credentials
    oAuth2Client.setCredentials({
      access_token: user.access_token,
      refresh_token: user.refresh_token,
      expiry_date: user.expiry_date,
    });

    const calendar = google.calendar({ version: "v3", auth: oAuth2Client });

    const allEvents = [];

    // 3️⃣ Loop through courses to fetch events from their calendars
    for (const course of user.courses) {
      if (!course.calendarId) continue;

      const response = await calendar.events.list({
        calendarId: course.calendarId,
        timeMin: new Date().toISOString(), // only upcoming events
        maxResults: 100,
        singleEvents: true,
        orderBy: "startTime",
      });

      const events = response.data.items || [];

      allEvents.push({
        courseId: course.courseId,
        courseName: course.name,
        events: events.map((event) => ({
          id: event.id,
          title: event.summary,
          description: event.description,
          location: event.location,
          start: event.start,
          end: event.end,
          creator: event.creator,
          attendees: event.attendees,
          link: event.htmlLink,
        })),
      });
    }

    // 4️⃣ Optionally save to DB
    user.courseEvents = allEvents;
    await user.save();

    res.status(200).json({
      message: "Fetched calendar events successfully",
      courseEvents: allEvents,
    });
  } catch (err) {
    console.error("Error fetching calendar events:", err);
    res.status(500).json({ message: "Failed to fetch calendar events" });
  }
};
