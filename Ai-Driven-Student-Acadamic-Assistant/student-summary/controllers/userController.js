import { User } from "../models/User.js";

export const getMe = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.email });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({
      email: user.email,
      courses: user.courses || [],
      notion: user.notion || {},
    });
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch user", error: e.message });
  }
};
