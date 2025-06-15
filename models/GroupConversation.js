const mongoose = require("mongoose");

const groupConversationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AuthUser"
      }
    ],
    groupImage: {
      type: String,
      default: "/uploads/defaultgroup.png"
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuthUser",
      required: true
    }
  },
  { timestamps: true }
);

const GroupConversation = mongoose.model("GroupConversation", groupConversationSchema);
module.exports = GroupConversation;
