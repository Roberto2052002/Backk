const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const GroupConversation = require("../models/GroupConversation");

router.post("/group-conversations", verifyToken, async (req, res) => {
    
  const { name, participants, groupImage } = req.body;

  if (!name || !participants || participants.length < 2) {
    return res.status(400).json({ error: "Group name and at least 2 participants are required" });
  }

  try {
    const newGroup = new GroupConversation({
      name,
      participants: [...participants, req.user.id], 
      groupImage,
      createdBy: req.user.id
    });

    const saved = await newGroup.save();
  const populated = await GroupConversation.findById(saved.id).populate(
      "participants",
      "_id username profilePicture"
    );
    res.status(201).json(populated);
  } catch (err) {
    console.error("❌ Group creation error:", err); 
    res.status(500).json({ error: "Failed to create group" });
  }
});

router.get("/group-conversations", verifyToken, async (req, res) => {
  try {
    const groups = await GroupConversation.find({
      participants: { $in: [req.user.id] }
    }).populate("participants", "_id username profilePicture");

    res.json(groups);
  } catch (err) {
    console.error("❌ Group creation error:", err);
    res.status(500).json({ error: "Failed to fetch groups" });
  }
});

router.put("/group-conversations/:id", verifyToken, async (req, res) => {
  const { name, groupImage } = req.body;

  try {
    const group = await GroupConversation.findById(req.params.id);

    if (!group) return res.status(404).json({ error: "Group not found" });

    if (group.createdBy.toString() !== req.user.id)
      return res.status(403).json({ error: "Only group creator can update group" });

    if (name) group.name = name;
    if (groupImage) group.groupImage = groupImage;

    await group.save();
    res.json(group);
  } catch (err) {
    res.status(500).json({ error: "Failed to update group" });
  }
});

// ✅ Delete group (admin only)
router.delete("/group-conversations/:id", verifyToken, async (req, res) => {
  try {
    const group = await GroupConversation.findById(req.params.id);

    if (!group) return res.status(404).json({ error: "Group not found" });

    if (group.createdBy.toString() !== req.user.id)
      return res.status(403).json({ error: "Only group creator can delete group" });

    await group.deleteOne();
    res.json({ message: "Group deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete group" });
  }
});

module.exports = router;
