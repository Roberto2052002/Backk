const express = require("express");
const router = express.Router();
const multer = require("multer");
const AuthUser = require("../models/AuthUser");
const verifyToken = require("../middleware/verifyToken");


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});
const upload = multer({ storage });


router.put("/update-profile", verifyToken, async (req, res) => {
  const userId = req.user.userId;
  const updates = req.body;

  try {
    const updatedUser = await AuthUser.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json({ message: "Profile updated!", data: updatedUser });
  } catch (err) {
    console.error("❌ Failed to update profile:", err);
    res.status(500).json({ error: "Server error" });
  }
});


router.post("/upload-profile-picture", verifyToken, upload.single("profilePicture"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  const imageUrl = `/uploads/${req.file.filename}`;

  try {
    const updatedUser = await AuthUser.findByIdAndUpdate(
      req.user.userId,
      { profilePicture: imageUrl },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json({ message: "Profile picture updated!", profilePicture: imageUrl });
  } catch (err) {
    console.error("❌ Failed to update profile picture:", err);
    res.status(500).json({ error: "Failed to update profile picture." });
  }
});


router.put("/update-prs", verifyToken, async (req, res) => {
  try {
    const updatedPrs = req.body.prs;

    if (!Array.isArray(updatedPrs)) {
      return res.status(400).json({ error: "Invalid PRs format." });
    }

    const user = await AuthUser.findByIdAndUpdate(
      req.user.userId,
      { prs: updatedPrs },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json({ message: "PRs updated successfully!", prs: user.prs });
  } catch (err) {
    console.error("❌ Failed to update PRs:", err);
    res.status(500).json({ error: "Server error while updating PRs." });
  }
});

module.exports = router;
