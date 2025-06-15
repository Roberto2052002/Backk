const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  type: { type: String, enum: ["message", "friendRequest"], required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "AuthUser", required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "AuthUser", required: true },
  message: { type: String, default: "" },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Notification", notificationSchema);
