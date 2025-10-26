import mongoose from "mongoose";
const { Schema } = mongoose;

// Schema for calendar events
const eventSchema = new Schema({
  id: { type: String, required: true }, // Event ID
  title: { type: String, required: true }, // Event title
  description: { type: String }, // Optional description
  location: { type: String },
  start: { type: Date },
  end: { type: Date },
  creator: {
    email: { type: String },
    displayName: { type: String },
  },
  attendees: [
    {
      email: { type: String },
      displayName: { type: String },
      responseStatus: { type: String },
    },
  ],
  link: { type: String }, // Event URL
});

// Schema for course materials
const materialSchema = new Schema({
  fileId: String,
  name: String,
  mimeType: String,
  link: String,
  content: mongoose.Schema.Types.Mixed, // string or buffer
});

// Schema for Gemini AI generated summaries / Notion-ready data
const summarySchema = new Schema({
  sourceFileId: { type: String }, // which file it belongs to
  summaryText: { type: String }, // AI summarized text
  notionJson: { type: Object }, // final structured data to send to Notion
  modelQuestions: [
    {
      question: String,
      options: [String],
      correctAnswer: String,
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

// Course schema
const courseSchema = new Schema({
  courseId: String,
  name: String,
  section: String,
  ownerId: String,
  alternateLink: String,
  calendarId: String,
  courseDriveFolder: String,
  materials: [materialSchema], // Classroom uploaded files
  courseEvents: [eventSchema], // Calendar events
  summaryData: [summarySchema], // Gemini processed output for this course
});

// User schema
const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    access_token: { type: String },
    refresh_token: { type: String },
    scope: { type: String },
    token_type: { type: String },
    refresh_token_expires_in: { type: Number },
    expiry_date: { type: Number },
    courses: [courseSchema],
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);