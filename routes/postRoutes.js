const express = require("express");
const router = express.Router();
const multer = require("multer");
const verifyToken = require("../middleware/verifyToken");
const Post = require("../models/Post");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

router.post("/upload", verifyToken, upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded." });

  const caption = req.body.caption;
  const imageUrl = `/uploads/${req.file.filename}`;
  const userId = req.user.userId;

  try {
    const newPost = new Post({ userId, imageUrl, caption });
    const savedPost = await newPost.save();
    const populatedPost = await savedPost.populate("userId", "username profilePicture");
    res.status(201).json({ message: "Post saved to MongoDB!", post: populatedPost });
  } catch (err) {
    console.error("❌ Failed to save post:", err);
    res.status(500).json({ error: "Failed to save post." });
  }
});

router.get("/posts", verifyToken, async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("userId", "username profilePicture")
      .populate("comments.userId", "username profilePicture");

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch posts." });
  }
});

router.get("/posts/:id", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("userId", "username profilePicture _id")
      .populate("comments.userId", "username profilePicture");

    if (!post) return res.status(404).json({ error: "Post not found." });

    res.json(post);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/myposts", verifyToken, async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch posts." });
  }
});

// Get posts by any user (search)
router.get("/users/:id/posts", verifyToken, async (req, res) => {
  try {
    const posts = await Post.find({ userId: req.params.id }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch posts." });
  }
});

router.delete("/posts/:id", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found." });

    if (post.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: "Not authorized to delete this post." });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted successfully!" });
  } catch (err) {
    res.status(500).json({ error: "Server error while deleting post." });
  }
});

router.post("/posts/:postId/comments", verifyToken, async (req, res) => {
  const { postId } = req.params;
  const { text } = req.body;

  if (!text?.trim()) {
    return res.status(400).json({ error: "Comment text is required." });
  }

  try {
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found." });

    post.comments.push({
      userId: req.user.userId,
      text,
      createdAt: new Date(),
    });

    await post.save();
    await post.populate("comments.userId", "username profilePicture");

    res.status(201).json({ message: "Comment added!", comments: post.comments });
  } catch (err) {
    res.status(500).json({ error: "Failed to add comment." });
  }
});

module.exports = router;
