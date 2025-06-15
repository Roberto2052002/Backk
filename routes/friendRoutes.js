const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const AuthUser = require("../models/AuthUser");
const Notification = require("../models/Notification");

router.post("/friends/:friendId", verifyToken, async (req, res) => {
  const currentUserId = req.user.userId;
  const friendId = req.params.friendId;

  if (currentUserId === friendId) {
    return res.status(400).json({ error: "You cannot add yourself as a friend." });
  }

  try {
    const user = await AuthUser.findById(currentUserId);
    if (!user) return res.status(404).json({ error: "User not found." });

    if (user.friends.includes(friendId)) {
      return res.status(409).json({ error: "Already friends." });
    }

    user.friends.push(friendId);
    await user.save();

    res.json({ message: "Friend added successfully." });
  } catch (err) {
    console.error("Error adding friend:", err);
    res.status(500).json({ error: "Server error while adding friend." });
  }
});


router.post("/friend-request/:receiverId", verifyToken, async (req, res) => {
  const senderId = req.user.userId;
  const receiverId = req.params.receiverId;

  if (senderId === receiverId) {
    return res.status(400).json({ error: "You cannot send a friend request to yourself." });
  }

  try {
    const sender = await AuthUser.findById(senderId);
    const receiver = await AuthUser.findById(receiverId);

    if (!receiver) {
      return res.status(404).json({ error: "User not found." });
    }

    // Already friends?
    if (sender.friends.includes(receiverId)) {
      return res.status(400).json({ error: "You are already friends." });
    }

    // Already sent?
    if (sender.friendRequestsSent.includes(receiverId)) {
      return res.status(400).json({ error: "Friend request already sent." });
    }

    // Already received from this user?
    if (sender.friendRequestsReceived.includes(receiverId)) {
      return res.status(400).json({ error: "This user already sent you a request." });
    }

    sender.friendRequestsSent.push(receiverId);
    receiver.friendRequestsReceived.push(senderId);

    await sender.save();
    await receiver.save();
    await Notification.create({
      type: "friendRequest",
      sender: senderId,
      receiver: receiverId
    });
    
    res.status(200).json({ message: "Friend request sent!" });
  } catch (err) {
    console.error("Error sending friend request:", err);
    res.status(500).json({ error: "Server error while sending friend request." });
  }
});


router.get("/friends", verifyToken, async (req, res) => {
  const currentUserId = req.user.userId;

  try {
    const user = await AuthUser.findById(currentUserId).populate(
      "friends",
      "fullName email profilePicture username"
    );

    if (!user) return res.status(404).json({ error: "User not found." });

    res.json(user.friends);
  } catch (err) {
    console.error("Error fetching friends:", err);
    res.status(500).json({ error: "Server error while fetching friends." });
  }
});

router.post("/friend-request/:senderId/accept", verifyToken, async (req, res) => {
  const currentUserId = req.user.userId;
  const senderId = req.params.senderId;

  try {
    const receiver = await AuthUser.findById(currentUserId);
    const sender = await AuthUser.findById(senderId);

    if (!receiver || !sender) {
      return res.status(404).json({ error: "User not found." });
    }

    // Check if there's a pending request
    if (!receiver.friendRequestsReceived.includes(senderId)) {
      return res.status(400).json({ error: "No friend request from this user." });
    }

    // Add to friends
    receiver.friends.push(senderId);
    sender.friends.push(currentUserId);

    // Remove from requests
    receiver.friendRequestsReceived = receiver.friendRequestsReceived.filter(
      (id) => id.toString() !== senderId
    );
    sender.friendRequestsSent = sender.friendRequestsSent.filter(
      (id) => id.toString() !== currentUserId
    );

    await receiver.save();
    await sender.save();
    await Notification.deleteOne({
      type: "friendRequest",
      sender: senderId,
      receiver: currentUserId,
    });

    res.json({ message: "Friend request accepted." });
  } catch (err) {
    console.error("Error accepting request:", err);
    res.status(500).json({ error: "Server error while accepting request." });
  }
});

// ❌ Decline friend request
router.post("/friend-request/:senderId/decline", verifyToken, async (req, res) => {
  const currentUserId = req.user.userId;
  const senderId = req.params.senderId;

  try {
    const receiver = await AuthUser.findById(currentUserId);
    const sender = await AuthUser.findById(senderId);

    if (!receiver || !sender) {
      return res.status(404).json({ error: "User not found." });
    }

    receiver.friendRequestsReceived = receiver.friendRequestsReceived.filter(
      (id) => id.toString() !== senderId
    );
    sender.friendRequestsSent = sender.friendRequestsSent.filter(
      (id) => id.toString() !== currentUserId
    );

    await receiver.save();
    await sender.save();
    await Notification.deleteOne({
      type: "friendRequest",
      sender: senderId,
      receiver: currentUserId,
    });

    res.json({ message: "Friend request declined." });
  } catch (err) {
    console.error("Error declining request:", err);
    res.status(500).json({ error: "Server error while declining request." });
  }
});

router.delete("/friends/:friendId", verifyToken, async (req, res) => {
  const currentUserId = req.user.userId;
  const friendId = req.params.friendId;

  try {
    const user = await AuthUser.findById(currentUserId);
    const friend = await AuthUser.findById(friendId);

    if (!user || !friend) {
      return res.status(404).json({ error: "User or friend not found." });
    }
    user.friends = user.friends.filter((id) => id.toString() !== friendId);
    await user.save();

    friend.friends = friend.friends.filter((id) => id.toString() !== currentUserId);
    await friend.save();

    res.json({ message: "Friend removed successfully." });
  } catch (err) {
    console.error("Error removing friend:", err);
    res.status(500).json({ error: "Server error while removing friend." });
  }
});

router.delete("/friend-request/:receiverId/cancel", verifyToken, async (req, res) => {
  const senderId = req.user.userId;
  const receiverId = req.params.receiverId;

  try {
    const sender = await AuthUser.findById(senderId);
    const receiver = await AuthUser.findById(receiverId);

    if (!sender || !receiver) {
      return res.status(404).json({ error: "User not found" });
    }

    sender.friendRequestsSent = sender.friendRequestsSent.filter(
      (id) => id.toString() !== receiverId
    );

    receiver.friendRequestsReceived = receiver.friendRequestsReceived.filter(
      (id) => id.toString() !== senderId
    );

    await sender.save();
    await receiver.save();
    await Notification.deleteOne({
      type: "friendRequest",
      sender: senderId,
      receiver: receiverId,
    });

    res.json({ message: "Friend request canceled." });
  } catch (err) {
    console.error("Error canceling friend request:", err);
    res.status(500).json({ error: "Server error while canceling request." });
  }
});


module.exports = router;
