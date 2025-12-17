import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("Connected to MongoDB");
    });
    await mongoose.connect(`${process.env.MONGO_URI}/hackathon`);
  } catch (error) {
    console.log(error);
  }
};
