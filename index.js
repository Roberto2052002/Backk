const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const verifyToken = require("./middleware/verifyToken");

// Route imports
const profileRoutes = require("./routes/profileRoutes");
const postRoutes = require("./routes/postRoutes");
const friendRoutes = require("./routes/friendRoutes");
const conversationRoutes = require("./routes/conversationRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const groupConversationRoutes = require("./routes/groupConversationRoutes");
const notificationsRoute = require("./routes/notifications");
const frontendPath = path.join(__dirname, "../frontend/build");
console.log("Serving frontend from:", frontendPath);

dotenv.config();
const app = express();

// Middleware
app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

// Multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

app.use(profileRoutes);
app.use(postRoutes);
app.use(friendRoutes);
app.use(conversationRoutes);
app.use(authRoutes);
app.use(userRoutes);
app.use(groupConversationRoutes);
app.use("/notifications", require("./routes/notifications"));
app.use(express.static(path.join(__dirname, "../frontend/build")));


mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("✅ Connected to MongoDB Atlas!"))
  .catch((err) => console.error("❌ Failed to connect to MongoDB:", err));

app.get("/protected", verifyToken, (req, res) => {
  res.json({ message: "You have access!", user: req.user });
});

app.get(/^\/(?!api|uploads).*/, (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
