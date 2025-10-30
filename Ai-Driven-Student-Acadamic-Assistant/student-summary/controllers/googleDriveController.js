import { google } from "googleapis";
import { oAuth2Client } from "../services/googleService.js";
import { User } from "../models/User.js";
import { PDFExtract } from "pdf.js-extract";
const pdfExtract = new PDFExtract();

export const fetchCourseMaterials = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    oAuth2Client.setCredentials({
      access_token: user.access_token,
      refresh_token: user.refresh_token,
      expiry_date: user.expiry_date,
    });

    const classroom = google.classroom({ version: "v1", auth: oAuth2Client });
    const drive = google.drive({ version: "v3", auth: oAuth2Client });

    // Loop through all courses stored in DB
    for (const course of user.courses) {
      const materialsResponse =
        await classroom.courses.courseWorkMaterials.list({
          courseId: course.courseId,
        });

      const materials = materialsResponse.data.courseWorkMaterial || [];
      const extractedFiles = [];

      for (const material of materials) {
        for (const m of material.materials || []) {
          if (m.driveFile) {
            const fileId = m.driveFile.driveFile.id;
            const fileName = m.driveFile.driveFile.title;

            // 1️⃣ Get file metadata
            const file = await drive.files.get({
              fileId,
              fields: "id, name, mimeType, webViewLink",
            });

            // 2️⃣ Download file content depending on MIME type
            let content = null;
            if (
              file.data.mimeType === "application/vnd.google-apps.presentation"
            ) {
              // PPTX - export as text
              const exportRes = await drive.files.export(
                { fileId, mimeType: "text/plain" },
                { responseType: "stream" }
              );
              content = await streamToString(exportRes.data);
            } else if (file.data.mimeType === "application/pdf") {
              const pdfRes = await drive.files.get(
                { fileId, alt: "media" },
                { responseType: "arraybuffer" }
              );

              const pdfBuffer = Buffer.from(pdfRes.data);
              const data = await pdfExtract.extractBuffer(pdfBuffer);
              content = data.pages
                .map((page) => page.content.map((item) => item.str).join(" "))
                .join("\n");
            } else if (
              file.data.mimeType === "application/vnd.google-apps.document"
            ) {
              // Google Doc - export as text
              const docRes = await drive.files.export(
                { fileId, mimeType: "text/plain" },
                { responseType: "stream" }
              );
              content = await streamToString(docRes.data);
            }

            extractedFiles.push({
              fileId,
              name: fileName,
              mimeType: file.data.mimeType,
              link: file.data.webViewLink,
              content, // raw text or buffer
            });
          }
        }
      }

      // Save extracted files temporarily under user.courses
      course.materials = extractedFiles;
    }

    await user.save();
    res.status(200).json({
      message: "Materials fetched and text extracted",
      userCourses: user.courses,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching course materials" });
  }
};

// Helper function to read stream
function streamToString(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    stream.on("error", reject);
  });
}
