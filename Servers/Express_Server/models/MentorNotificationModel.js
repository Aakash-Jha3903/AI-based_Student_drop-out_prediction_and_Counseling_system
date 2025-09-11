const mongoose = require("mongoose");

const MentorNotificationSchema = new mongoose.Schema(
  {
    Mentor_ID: { type: mongoose.Schema.Types.ObjectId, ref: "mentors", required: true },
    Message: { type: String, required: true, trim: true },
    Created_At: { type: Date, default: Date.now },
    is_Read: { type: Boolean, default: false },
  },
  { timestamps: false }
);

MentorNotificationSchema.index({ Mentor_ID: 1, is_Read: 1, Created_At: -1 });

module.exports = mongoose.models.mentor_notifications || mongoose.model("mentor_notifications", MentorNotificationSchema);
