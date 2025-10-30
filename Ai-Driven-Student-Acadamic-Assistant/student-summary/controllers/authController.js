import { oAuth2Client } from "../services/googleService.js";
import { google } from "googleapis";
import { User } from "../models/User.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();                    
import axios from "axios";

export const oAuth2 = (req, res) => {
  const scopes = [
    "https://www.googleapis.com/auth/classroom.courses.readonly",
    "https://www.googleapis.com/auth/calendar.readonly",
    "https://www.googleapis.com/auth/userinfo.email ",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/classroom.profile.emails",
    "https://www.googleapis.com/auth/classroom.profile.photos",
    "https://www.googleapis.com/auth/classroom.rosters",
    "https://www.googleapis.com/auth/classroom.coursework.me",
    "https://www.googleapis.com/auth/classroom.coursework.students",
    "https://www.googleapis.com/auth/classroom.coursework.me.readonly",
    "https://www.googleapis.com/auth/classroom.courseworkmaterials.readonly ",
    "https://www.googleapis.com/auth/drive.readonly", // read-only access to Drive files (PDFs, Docs, etc.)
  ];

  const url = oAuth2Client.generateAuthUrl({
    access_type: "offline", // important to get refresh token
    scope: scopes,
    prompt: "consent",
  });
  console.log(url);
  res.redirect(url);
};

export const googleCallback = async (req, res) => {
  try {
    const code = req.query.code;

    // Exchange code for tokens
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    console.log("Tokens received:", tokens);

    // Fetch user info
    const oauth2 = google.oauth2({ version: "v2", auth: oAuth2Client });
    const userInfo = await oauth2.userinfo.get();
    const email = userInfo.data.email;
    console.log(email);

    // Prepare update object
    const updateData = {                          
      access_token: tokens.access_token,         // const encrypted = cryptr.encrypt(tokens.access_token);
      expiry_date: tokens.expiry_date,
      scope: tokens.scope,
      token_type: tokens.token_type,
      refresh_token_expires_in: tokens.refresh_token_expires_in,
    };
    if (tokens.refresh_token) updateData.refresh_token = tokens.refresh_token;
    console.log("User info:", userInfo.data);
    console.log("Update data:", updateData);

    // Save/update user in DB
    // Save/update user in DB
    let user = await User.findOne({ email }); // Declare with 'let'

    if (user) {
      await User.findOneAndUpdate({ email }, updateData);
    } else {
      user = await User.create({ email, ...updateData });
    }

    if (!user) {
      console.error("Failed to retrieve or create user in database.");
      return res.status(500).send("Database operation failed.");
    }

    const jwtToken = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Set cookie
    res.cookie("jwt", jwtToken, {
      httpOnly: true,
      secure: false, // true if HTTPS
      sameSite: "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.redirect("https://untolerative-len-rumblingly.ngrok-free.dev/data/google-classroom");
  } catch (error) {
    console.error(error.message);
    res.status(500).send("OAuth failed. Check server console.");
  }
};
export const notionoAuth2 = (req, res) => {
  const authUrl = `https://api.notion.com/v1/oauth/authorize?client_id=${
    process.env.NOTION_CLIENT_ID
  }&response_type=code&owner=user&redirect_uri=${encodeURIComponent(
    process.env.NOTION_REDIRECT_URL
  )}`;
  res.redirect(authUrl);
};
export const notionCallback = async (req, res) => {
  const code = req.query.code;

  try {
    const response = await axios.post(
      "https://api.notion.com/v1/oauth/token",
      {
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.NOTION_REDIRECT_URL,
      },
      {
        auth: {
          username: process.env.NOTION_CLIENT_ID,
          password: process.env.NOTION_CLIENT_SECRET,
        },
      }
    );

    const notionData = response.data;
    console.log("✅ Notion OAuth Success:", notionData);

    // 🔐 Assuming you already have user logged in via Google OAuth
    const userEmail = req.user.email; // Example fallback
    const user = await User.findOneAndUpdate(
      { email: userEmail },
      {
        $set: {
          notion: {
            access_token: notionData.access_token,
            workspace_id: notionData.workspace_id,
            isSyncedToNotion: true,
            bot_id: notionData.bot_id,
            workspace_name: notionData.workspace_name,
            owner: notionData.owner,
            connected_at: new Date(),
          },
        },
      },
      { new: true, upsert: true }
    );

    res.send("✅ Notion connected successfully for " + user.email);
  } catch (err) {
    console.error("❌ Notion OAuth failed:", err.response?.data || err.message);
    res.status(500).send("OAuth failed");
  }
};
