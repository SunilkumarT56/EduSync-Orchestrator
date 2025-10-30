import axios from "axios";
import { User } from "../models/User.js";

export const createNotionParentPage = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const user = await User.findOne({ email: userEmail });

    if (!user || !user.notion?.access_token) {
      return res.status(400).json({ error: "User Notion token not found" });
    }

    const parentResponse = await axios.post(
      "https://api.notion.com/v1/pages",
      {
        parent: { type: "workspace", workspace: true },
        properties: {
          title: [
            {
              text: { content: "My Course Summaries" },
            },
          ],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${user.notion.access_token}`,
          "Content-Type": "application/json",
          "Notion-Version": "2022-06-28",
        },
      }
    );

    const parentPageId = parentResponse.data.id;
    user.notion.parent_page_id = parentPageId;
    await user.save();

    console.log(`📘 Parent page created for ${userEmail}: ${parentPageId}`);
    res.status(200).json({
      message: "✅ Parent Notion page created successfully",
      parentPageId,
    });
  } catch (error) {
    console.error(
      "❌ Error creating Notion parent page:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to create Notion parent page" });
  }
};

export const createNotionChildPage = async (req, res) => {
  try {
    const email = req.user.email;

    const userDoc = await User.findOne({ email });
    if (!userDoc) return res.status(404).json({ error: "User not found" });

    const notionToken = userDoc.notion.access_token;
    const notionParentPage = userDoc.notion.parent_page_id;

    let createdPages = [];

    // 🧠 Loop through each course and its summaries
    for (const courseObj of userDoc.courses) {
      for (const summaryObj of courseObj.summaryData) {
        // Skip already synced summaries if needed
        // if (summaryObj.isSyncedToNotion) continue;

        const {
          title: summaryTitle,
          summaryText: summaryContent,
          roadmap: summaryRoadmap,
          keyPoints: summaryKeyPoints,
          modelQuestions: summaryQuestions,
          actionPlan: summaryActions,
        } = summaryObj;

        const safeSummary = summaryContent || "No summary available.";
        const safeRoadmap = Array.isArray(summaryRoadmap) ? summaryRoadmap : [];
        const safeKeyPoints = Array.isArray(summaryKeyPoints)
          ? summaryKeyPoints
          : [];
        const safeQuestions = Array.isArray(summaryQuestions)
          ? summaryQuestions
          : [];
        const safeActions = Array.isArray(summaryActions) ? summaryActions : [];

        // ✅ Construct Notion blocks dynamically
        const notionBlocks = [
          {
            object: "block",
            type: "heading_2",
            heading_2: { rich_text: [{ text: { content: "📘 Summary" } }] },
          },
          {
            object: "block",
            type: "paragraph",
            paragraph: {
              rich_text: [{ text: { content: safeSummary } }],
            },
          },

          {
            object: "block",
            type: "heading_2",
            heading_2: { rich_text: [{ text: { content: "🗓️ Roadmap" } }] },
          },
          ...safeRoadmap.map((item) => ({
            object: "block",
            type: "bulleted_list_item",
            bulleted_list_item: {
              rich_text: [
                {
                  text: {
                    content: `Week ${item.week}: ${item.focus} - ${item.description}`,
                  },
                },
              ],
            },
          })),

          {
            object: "block",
            type: "heading_2",
            heading_2: { rich_text: [{ text: { content: "⭐ Key Points" } }] },
          },
          ...safeKeyPoints.map((point) => ({
            object: "block",
            type: "bulleted_list_item",
            bulleted_list_item: { rich_text: [{ text: { content: point } }] },
          })),

          {
            object: "block",
            type: "heading_2",
            heading_2: {
              rich_text: [{ text: { content: "❓ Model Questions" } }],
            },
          },
          ...safeQuestions.map((q) => ({
            object: "block",
            type: "bulleted_list_item",
            bulleted_list_item: {
              rich_text: [
                {
                  text: {
                    content: `${q.type?.toUpperCase() || "SHORT"} → ${
                      q.question
                    }`,
                  },
                },
              ],
            },
          })),

          {
            object: "block",
            type: "heading_2",
            heading_2: { rich_text: [{ text: { content: "🧩 Action Plan" } }] },
          },
          ...safeActions.map((task) => ({
            object: "block",
            type: "to_do",
            to_do: {
              rich_text: [
                {
                  text: {
                    content: `${task.task} (Priority: ${task.priority})`,
                  },
                },
              ],
            },
          })),
        ];

        // 🪄 Create Notion child page
        const notionRes = await axios.post(
          "https://api.notion.com/v1/pages",
          {
            parent: { page_id: notionParentPage },
            properties: {
              title: {
                title: [
                  {
                    text: {
                      content: summaryTitle || courseObj.name || "Untitled",
                    },
                  },
                ],
              },
            },
            children: notionBlocks,
          },
          {
            headers: {
              Authorization: `Bearer ${notionToken}`,
              "Content-Type": "application/json",
              "Notion-Version": "2022-06-28",
            },
          }
        );

        console.log(
          `✅ Page created for ${courseObj.name}: ${notionRes.data.id}`
        );

        // Update database for tracking
        summaryObj.isSyncedToNotion = true;
        summaryObj.notionPageId = notionRes.data.id;

        createdPages.push({
          course: courseObj.name,
          title: summaryTitle,
          pageId: notionRes.data.id,
        });
      }
    }

    await userDoc.save();

    if (createdPages.length === 0)
      return res.status(200).json({ message: "All summaries already synced!" });

    res.status(200).json({
      message: "✅ Notion pages created successfully",
      createdPages,
    });
  } catch (error) {
    console.error(
      "❌ Notion API Error:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Failed to sync course pages to Notion" });
  }
};
