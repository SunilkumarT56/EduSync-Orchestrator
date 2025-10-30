import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
dotenv.config();
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import dataRoutes from "./routes/dataRoutes.js";
import cookieParser from "cookie-parser";
import googleDriveRoutes from "./routes/googleDriveRoutes.js";
import geminiRoutes from "./routes/geminiRoutes.js";
import notionRoutes from "./routes/notionRoutes.js";
import mongoose from "mongoose";


const PORT = process.env.PORT || 5050;
const app = express();
//middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());

// health
app.get("/health", async (req, res) => {
	let pingOk = false;
	try {
		if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
			await mongoose.connection.db.admin().ping();
			pingOk = true;
		}
	} catch (e) {
		pingOk = false;
	}
	res.json({
		status: "ok",
		port: PORT,
		mongo: {
			connected: mongoose.connection.readyState === 1,
			state: mongoose.connection.readyState,
			ping: pingOk,
		},
		timestamp: new Date().toISOString(),
	});
});

//routes
app.use("/auth", authRoutes);
app.use("/data", dataRoutes);
app.use("/drive", googleDriveRoutes);
app.use("/gemini",geminiRoutes)
app.use("/notion",notionRoutes);

//test the api
app.get("/", (req, res) => {
	res.send("hello hackathon");
});

console.log("Loaded MONGO_URI:", process.env.MONGO_URI);
//Connect to MongoDB
connectDB();

app.listen(PORT, () => {
	console.log(`server is up and running on the port ${PORT}`);
});
