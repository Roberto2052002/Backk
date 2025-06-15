const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AuthUser = require("../models/AuthUser");
const verifyToken = require("../middleware/verifyToken");

// Register
router.post("/register", async (req, res) => {
  const { fullName, username, email, password, gender, birthDate } = req.body;

  if (!fullName || !email || !password || !gender || !birthDate || !username) {
    return res.status(400).json({ error: "You must fill your information." });
  }

  try {
    const existingUser = await AuthUser.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered." });
    }
    const existingUsername = await AuthUser.findOne({ username });
    if (existingUsername) {
      return res.status(409).json({ error: "Username already taken." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new AuthUser({ fullName, username, email, password: hashedPassword, gender, birthDate });

    const savedUser = await newUser.save();
    res.status(201).json({ message: "User registered successfully!", userId: savedUser._id });

  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Failed to register user." });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const existingUser = await AuthUser.findOne({ email });
    if (!existingUser) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const token = jwt.sign(
      { userId: existingUser._id, email: existingUser.email },
      process.env.PASSCODE,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login successful!", token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await AuthUser.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      birthDate: user.birthDate,
      profilePicture: user.profilePicture,
      prs: user.prs,
      friends: user.friends || [],
      friendRequestsSent: user.friendRequestsSent || [],
      friendRequestsReceived: user.friendRequestsReceived || [],
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
