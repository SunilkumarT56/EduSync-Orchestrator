import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import dataRoutes from "./routes/dataRoutes.js";
import cookieParser from "cookie-parser";
import googleDriveRoutes from "./routes/googleDriveRoutes.js";
import geminiRoutes from "./routes/geminiRoutes.js";

dotenv.config();
const PORT = process.env.PORT || 5000;
const app = express();
//middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());

//routes
app.use("/auth", authRoutes);
app.use("/data", dataRoutes);
app.use("/drive", googleDriveRoutes);
app.use("/gemini",geminiRoutes)

//test the api
app.get("/", (req, res) => {
  res.send("hello hackathon");
});

//Connect to MongoDB
connectDB();

app.listen(PORT, () => {
  console.log(`server is up and running on the port ${PORT}`);
});
