const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema(
  {
    Student_ID: { type: mongoose.Schema.Types.ObjectId, ref: "students", required: true },
    Message: { type: String, required: true, trim: true },
    Created_At: { type: Date, default: Date.now },
    is_Read: { type: Boolean, default: false },
  },
  { timestamps: false }
);

NotificationSchema.index({ Student_ID: 1, is_Read: 1, Created_At: -1 });

module.exports = mongoose.models.notifications || mongoose.model("notifications", NotificationSchema);
