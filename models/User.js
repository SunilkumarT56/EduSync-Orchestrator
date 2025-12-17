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

// ✅ New Roadmap, KeyPoints, and Model Questions schemas
const roadmapSchema = new Schema({
  week: { type: Number },
  focus: { type: String },
  description: { type: String },
});

const modelQuestionSchema = new Schema({
  question: { type: String },
  type: { type: String, enum: ["short", "long", "mcq"], default: "short" },
  options: [{ type: String }],
  correctAnswer: { type: String },
});

const actionPlanSchema = new Schema({
  task: { type: String },
  priority: {
    type: String,
    enum: ["high", "medium", "low"],
    default: "medium",
  },
});

// ✅ Enhanced Gemini summary schema (production ready)
const summarySchema = new Schema({
  sourceFileId: { type: String }, // optional reference to classroom file
  title: { type: String }, // Course or topic title
  summaryText: { type: String }, // Raw AI-generated summary
  roadmap: [roadmapSchema],
  keyPoints: [{ type: String }],
  modelQuestions: [modelQuestionSchema],
  actionPlan: [actionPlanSchema],
  notionJson: { type: Object }, // structured JSON for Notion
  notionPageId: { type: String }, // page created in Notion
  isSyncedToNotion: { type: Boolean, default: true },
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
  summaryData: [summarySchema], // Gemini processed output (now structured)
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
    notion: {
      access_token: { type: String }, // Notion user access token
      workspace_id: { type: String },
      bot_id: { type: String },
      isSyncedToNotion: { type: Boolean, default: false },
      workspace_name: { type: String },
      parent_page_id: { type: String },
      owner: {
        type: { type: String }, // e.g., "user"
        user: {
          id: { type: String },
          name: { type: String },
          person: {
            email: { type: String },
          },
        },
      },
      connected_at: { type: Date },
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
