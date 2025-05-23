const tcreator = require("jsonwebtoken");
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const Post = require("./models/Post");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads"); // save in uploads/ folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // unique file name
  }
});

const upload = multer({ storage });

dotenv.config();
const app = express();
app.use(express.json());
app.use("/uploads", express.static("uploads"));


mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("✅ Connected to MongoDB Atlas!"))
  .catch((err) => console.error("❌ Failed to connect to MongoDB:", err));

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true }
});

const User = mongoose.model("User", userSchema);

const authUserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  gender: { type: String, enum: ["male", "female"], required: true },
  birthDate: { type: Date, required: true },
  profilePicture: { type: String, default: "" },

  prs: {
    type: [
      {
        label: { type: String },
        time: { type: String }
      }
    ],
    default: [
      { label: "5K", time: "" },
      { label: "10K", time: "" },
      { label: "Half", time: "" },
      { label: "Marathon", time: "" }
    ]
  }
});

const AuthUser = mongoose.model("AuthUser", authUserSchema);

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header missing." });
  }

  const token = authHeader.split(" ")[1];

  tcreator.verify(token, process.env.PASSCODE, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Invalid or expired token." });
    }

    req.user = decoded;
    next();
  });
};

app.post("/register", async (req, res) => {
  const { fullName, email, password, gender, birthDate } = req.body;

  // 1. Validate input
  if (!fullName || !email || !password || !gender || !birthDate) {
    return res.status(400).json({ error: "You must fill your information." });
  }

  try {
    // 2. Check if email already exists
    const existingUser = await AuthUser.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered." });
    }

    // 3. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Save new user
    const newUser = new AuthUser({
      fullName,
      email,
      password: hashedPassword,
      gender,
      birthDate
    });

    const savedUser = await newUser.save();

    // 5. Return success
    res.status(201).json({ message: "User registered successfully!", userId: savedUser._id });

  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Failed to register user." });
  }
});


app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // 1. Validate input
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    // 2. Find the user
    const existingUser = await AuthUser.findOne({ email });
    if (!existingUser) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // 3. Compare passwords
    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // 4. Generate a token
    const token = tcreator.sign(
      { userId: existingUser._id, email: existingUser.email },
      process.env.PASSCODE,
      { expiresIn: "1h" }
    );

    // 5. Return token
    res.json({ message: "Login successful!", token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message });;
  }
});

app.post("/upload", verifyToken, upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  const caption = req.body.caption;
  const imageUrl = `/uploads/${req.file.filename}`;
  const userId = req.user.userId;

  try {
    const newPost = new Post({ userId, imageUrl, caption });
    await newPost.save();

  res.status(201).json({
      message: "Post saved to MongoDB!",
      post: newPost
    });
  } catch (err) {
    console.error("❌ Failed to save post:", err);
    res.status(500).json({ error: "Failed to save post." });
  }
});

app.get("/protected", verifyToken, (req, res) => {
  res.json({ message: "You have access!", user: req.user });
});

app.post("/upload-profile-picture", verifyToken, upload.single("profilePicture"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  const imageUrl = `/uploads/${req.file.filename}`;

  try {
    const user = await AuthUser.findByIdAndUpdate(
      req.user.userId,
      { profilePicture: imageUrl },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json({ message: "Profile picture updated!", profilePicture: imageUrl });
  } catch (err) {
    console.error("❌ Failed to update profile picture:", err);
    res.status(500).json({ error: "Failed to update profile picture." });
  }
});

app.post("/users", verifyToken, async (req, res) => {
  const newEntry = req.body;

  if (!newEntry.name || typeof newEntry.name !== "string") {
    res.status(400).json({ error: "Name is required and must be a string." });
    return;
  }

  if (!newEntry.age || typeof newEntry.age !== "number") {
    res.status(400).json({ error: "Age is required and must be a number." });
    return;
  }

  try {
    const createdUser = new User(newEntry);
    const savedUser = await createdUser.save();

    res.status(201).json({ message: "User saved to MongoDB!", data: savedUser });
  } catch (err) {
    console.error("MongoDB save error:", err);
    res.status(500).json({ error: "Failed to save user to MongoDB." });
  }
});

app.put("/users/:id", verifyToken, async (req, res) => {
  const userId = req.params.id;
  const updateData = req.body;

  if (updateData.name && typeof updateData.name !== "string") {
    res.status(400).json({ error: "Name must be a string." });
    return;
  }

  if (updateData.age && typeof updateData.age !== "number") {
    res.status(400).json({ error: "Age must be a number." });
    return;
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true, // return the updated document
      runValidators: true // make sure schema rules still apply
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User updated successfully!", data: updatedUser });

  } catch (err) {
    console.error("MongoDB update error:", err);
    res.status(500).json({ error: "Failed to update user in MongoDB." });
  }
});

app.get("/users/:id", verifyToken, async (req, res) => {
  const userId = req.params.id;

  try {
    console.log("Fetching profile for ID:", userId); // debug log
    const user = await AuthUser.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);

  } catch (err) {
    console.error("MongoDB fetch error:", err);
    res.status(500).json({ error: "Failed to fetch user from MongoDB." });
  }
});

app.delete("/users/:id", verifyToken, async (req, res) => {
  const userId = req.params.id;

  try {
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: `User with ID ${userId} deleted.` });

  } catch (err) {
    console.error("MongoDB delete error:", err);
    res.status(500).json({ error: "Failed to delete user from MongoDB." });
  }
});

app.get("/users", verifyToken, async (req, res) => {
  try {
    let userList = await AuthUser.find();

    if (req.query.email) {
      const emailSearch = req.query.email.toLowerCase();
      userList = userList.filter((entry) =>
        entry.email.toLowerCase().includes(emailSearch)
      );
    }

    res.json(userList);
  } catch (err) {
    console.error("MongoDB fetch error:", err);
    res.status(500).json({ error: "Failed to fetch users from MongoDB." });
  }
});


app.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await AuthUser.findById(req.user.userId); // assuming userId from token
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ 
      username: user.email,
      prs: user.prs // ✅ make sure this is included
    }); // or user.fullName if you have it
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/myposts", verifyToken, async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error("❌ Failed to fetch posts:", err);
    res.status(500).json({ error: "Failed to fetch posts." });
  }
});

app.get("/users/:id/posts", verifyToken, async (req, res) => {
  try {
    const userId = req.params.id;
    const posts = await Post.find({ userId }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error("❌ Failed to fetch user posts:", err);
    res.status(500).json({ error: "Failed to fetch posts." });
  }
});

app.put("/update-prs", verifyToken, async (req, res) => {
  try {
    const updatedPrs = req.body.prs;

    // Optional: validate that it's an array of { label, time }
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

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});



