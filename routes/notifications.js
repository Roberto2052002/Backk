const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const Notification = require("../models/Notification");

router.get("/", verifyToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ receiver: req.user.userId })
      .populate("sender", "username profilePicture")
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ error: "Server error fetching notifications." });
  }
});

module.exports = router;
