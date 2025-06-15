const mongoose = require("mongoose");

const authUserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  gender: { type: String, enum: ["male", "female"], required: true },
  birthDate: { type: Date, required: true },
  profilePicture: { type: String, default: "/uploads/defaultpropic.avif" },
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
  },
  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuthUser"
    }
  ],
  friendRequestsSent: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuthUser"
    }
  ],
  friendRequestsReceived: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuthUser"
    }
  ]
});

module.exports = mongoose.model("AuthUser", authUserSchema);
