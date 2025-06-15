const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AuthUser",
    required: true,
  },
  imageUrl: String,
  caption: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  comments: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "AuthUser" },
      text: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model("Post", postSchema);
