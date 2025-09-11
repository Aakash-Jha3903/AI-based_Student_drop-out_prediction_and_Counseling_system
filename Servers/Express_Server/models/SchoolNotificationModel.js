const mongoose = require("mongoose");

const SchoolNotificationSchema = new mongoose.Schema(
  {
    School_ID: { type: mongoose.Schema.Types.ObjectId, ref: "schools", required: true },
    Message: { type: String, required: true, trim: true },
    Created_At: { type: Date, default: Date.now },
    is_Read: { type: Boolean, default: false },
  },
  { timestamps: false }
);

SchoolNotificationSchema.index({ School_ID: 1, is_Read: 1, Created_At: -1 });

module.exports = mongoose.models.school_notifications || mongoose.model("school_notifications", SchoolNotificationSchema);
