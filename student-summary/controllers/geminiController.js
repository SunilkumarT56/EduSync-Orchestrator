// controllers/geminiController.js
import { GoogleGenAI } from "@google/genai";
import { User } from "../models/User.js";
import dotenv from "dotenv";
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

export const summarizeCourseMaterial = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const notionResponses = [];

    for (const course of user.courses) {
      if (!course.materials || course.materials.length === 0) {
        console.log(`⏭️ Skipping course ${course.name} - no materials`);
        continue;
      }

      const combinedText = course.materials
        .map((m) => m.content)
        .filter(Boolean)
        .join("\n\n");

      if (!combinedText.trim()) {
        console.log(`⏭️ Skipping course ${course.name} - no text content`);
        continue;
      }

      console.log(`📚 Processing course: ${course.name}`);

      const prompt = `
You are an AI tutor for engineering students. Analyze the following course material from Google Classroom
and return a structured JSON object with the following structure:

{
  "title": "Course Name",
  "summary": "Concise yet complete summary of the content",
  "roadmap": [
    {"week": 1, "focus": "Topic 1", "description": "Explain briefly what to do"},
    {"week": 2, "focus": "Topic 2", "description": "Explain briefly what to do"}
  ],
  "keyPoints": ["point 1", "point 2"],
  "modelQuestions": [
    {"question": "Explain X", "type": "short/long/mcq"}
  ],
  "actionPlan": [
    {"task": "Read Section 1", "priority": "high"},
    {"task": "Revise key formulas", "priority": "medium"}
  ]
}

Use the content below as reference (max 15000 characters):
"""${combinedText.slice(0, 15000)}"""
`;

      let result;
      try {
        result = await ai.models.generateContent({
          model: "gemini-2.5-pro",
          contents: [{ type: "text", text: prompt }],
          responseMimeType: "application/json",
        });
      } catch (err) {
        console.error("❌ Error calling Gemini API:", err.message);
        notionResponses.push({
          courseId: course.courseId,
          courseName: course.name,
          notionData: {
            error: true,
            message: "Error calling Gemini API",
            details: err.message,
          },
        });
        continue;
      }

      // Extract response text from correct path
      let responseText = "";
      try {
        if (result.candidates && result.candidates.length > 0) {
          const candidate = result.candidates[0];

          if (
            candidate.content &&
            candidate.content.parts &&
            candidate.content.parts.length > 0
          ) {
            responseText = candidate.content.parts[0].text;
            console.log(
              `✅ Successfully extracted response (${responseText.length} chars)`
            );
          } else {
            console.warn("⚠️ No parts in candidate content");
            console.log(
              "Candidate structure:",
              JSON.stringify(candidate, null, 2)
            );
            responseText = JSON.stringify({
              error: true,
              message: "No content parts in response",
            });
          }
        } else {
          console.warn("⚠️ No candidates in response");
          console.log("Result structure:", JSON.stringify(result, null, 2));
          responseText = JSON.stringify({
            error: true,
            message: "No candidates in response",
          });
        }
      } catch (err) {
        console.error("❌ Error accessing Gemini response:", err.message);
        responseText = JSON.stringify({
          error: true,
          message: "Error accessing response",
          details: err.message,
        });
      }

      // Parse JSON safely
      let parsed;
      try {
        parsed = JSON.parse(responseText);

        if (parsed.error) {
          console.warn("⚠️ Response contains error flag");
        } else {
          console.log("✅ Successfully parsed JSON response");
        }
      } catch (err) {
        console.warn(
          "⚠️ Gemini returned non-JSON text, attempting to salvage..."
        );
        console.log("Raw response preview:", responseText.substring(0, 200));

        // Try to extract JSON if it's wrapped in markdown code blocks
        const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          try {
            parsed = JSON.parse(jsonMatch[1]);
            console.log("✅ Extracted JSON from markdown block");
          } catch (e) {
            console.warn("⚠️ Failed to parse extracted JSON");
            parsed = {
              error: true,
              rawResponse: responseText,
              message: "Invalid JSON format",
            };
          }
        } else {
          parsed = {
            error: true,
            rawResponse: responseText,
            message: "Response is not valid JSON",
          };
        }
      }

      notionResponses.push({
        courseId: course.courseId,
        courseName: course.name,
        notionData: parsed,
      });
    }

    // Store summaries in DB
    user.courses.forEach((course) => {
      const found = notionResponses.find((n) => n.courseId === course.courseId);
      if (found) {
        course.summaryData = found.notionData;
      }
    });

    await user.save();

    console.log(`✅ Completed processing ${notionResponses.length} courses`);

    // Store summaries in DB
    user.courses.forEach((course) => {
      const found = notionResponses.find((n) => n.courseId === course.courseId);
      if (found && found.notionData && !found.notionData.error) {
        // Push structured Gemini response into summaryData array
        course.summaryData.push({
          title: found.notionData.title || course.name,
          summaryText: found.notionData.summary || "",
          roadmap: found.notionData.roadmap || [],
          keyPoints: found.notionData.keyPoints || [],
          modelQuestions: found.notionData.modelQuestions || [],
          actionPlan: found.notionData.actionPlan || [],
          notionJson: found.notionData,
          isSyncedToNotion: false,
        });
      }
    });
    await user.save();
    console.log("✅ Saved Gemini summaries into MongoDB successfully");

    res.status(200).json({
      message: "Gemini summarization completed successfully",
      processedCourses: notionResponses.length,
      notionResponses,
    });
  } catch (err) {
    console.error("❌ Fatal error in summarizeCourseMaterial:", err);
    res.status(500).json({
      message: "Gemini summarization failed",
      error: err.message,
    });
  }
};
