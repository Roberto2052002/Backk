const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const AuthUser = require("../models/AuthUser");
//const User = require("../models/User");

router.post("/users", verifyToken, async (req, res) => {
  const newEntry = req.body;

  if (!newEntry.name || typeof newEntry.name !== "string") {
    return res.status(400).json({ error: "Name is required and must be a string." });
  }

  if (!newEntry.age || typeof newEntry.age !== "number") {
    return res.status(400).json({ error: "Age is required and must be a number." });
  }

  try {
    const createdUser = new User(newEntry);
    const savedUser = await createdUser.save();

    res.status(201).json({ message: "User saved to MongoDB!", data: savedUser });
  } catch (err) {
    res.status(500).json({ error: "Failed to save user to MongoDB." });
  }
});

router.get("/users/:id", verifyToken, async (req, res) => {
  try {
    const user = await AuthUser.findById(req.params.id)
    .select("fullName username email birthDate profilePicture prs friendRequestsSent friendRequestsReceived friends");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user from MongoDB." });
  }
});

router.delete("/users/:id", verifyToken, async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: "User not found" });

    res.json({ message: `User with ID ${req.params.id} deleted.` });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete user from MongoDB." });
  }
});

router.get("/users", verifyToken, async (req, res) => {
  try {
    let userList = await AuthUser.find();

    if (req.query.username) {
      const usernameSearch = req.query.username.toLowerCase();
      userList = userList.filter((entry) =>
        entry.username && entry.username.toLowerCase().includes(usernameSearch)
      );
    }

    const currentUserId = req.user.id;
    userList = userList.filter((user) => user._id.toString() !== currentUserId);

    res.json(userList);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users from MongoDB." });
  }
});

module.exports = router;
