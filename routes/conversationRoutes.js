const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const GroupConversation = require("../models/GroupConversation");

router.get("/conversations", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id || req.user.userId;

    const privateConvs = await Conversation.find({
      participants: userId,
    }).populate("participants", "username profilePicture");

    const groupConvs = await GroupConversation.find({
      participants: userId,
    }).populate("participants", "username profilePicture");

    // Add type for frontend to distinguish
    const privateWithType = privateConvs.map((conv) => ({ ...conv.toObject(), type: "private" }));
    const groupWithType = groupConvs.map((conv) => ({ ...conv.toObject(), type: "group" }));

    res.json([...privateWithType, ...groupWithType]);
  } catch (err) {
    console.error("Failed to get conversations:", err);
    res.status(500).json({ error: "Failed to fetch conversations." });
  }
});

router.post("/conversations/:receiverId/messages", verifyToken, async (req, res) => {
  const { receiverId } = req.params;
  const { text } = req.body;
  const senderId = req.user.userId;

  if (!text) return res.status(400).json({ error: "Message text required." });

  try {
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = new Conversation({ participants: [senderId, receiverId] });
      await conversation.save();
    }

    const message = new Message({
      conversationId: conversation._id,
      senderId,
      text,
    });

    await message.save();
    res.status(201).json(message);
  } catch (err) {
    console.error("Failed to send message:", err);
    res.status(500).json({ error: "Failed to send message." });
  }
});


router.get("/conversations/:conversationId/messages", verifyToken, async (req, res) => {
  try {
    const { conversationId } = req.params;

    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    console.error("Failed to get messages:", err);
    res.status(500).json({ error: "Failed to fetch messages." });
  }
});


router.delete("/conversations/:conversationId", verifyToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: "Conversation not found" });
    }

    const isParticipant = conversation.participants.includes(userId);
    if (!isParticipant) {
      return res.status(403).json({ error: "Not authorized to delete this conversation" });
    }

    await Conversation.findByIdAndDelete(conversationId);
    await Message.deleteMany({ conversationId });

    res.json({ message: "Conversation deleted successfully" });
  } catch (err) {
    console.error("Failed to delete conversation:", err);
    res.status(500).json({ error: "Failed to delete conversation" });
  }
});

module.exports = router;
