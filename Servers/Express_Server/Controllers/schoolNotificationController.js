const SchoolNotification = require("../models/SchoolNotificationModel");
const User = require("../models/UserModel");

async function notifySchool(schoolId, message) {
  try {
    if (!schoolId || !message) return { success: false, error: "schoolId and message required" };
    const doc = await SchoolNotification.create({ School_ID: schoolId, Message: message });
    return { success: true, notification: doc };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function resolveSchoolId({ schoolId, schoolEmail, userId }) {
  if (schoolId) return schoolId;
  // If school user is logged-in, derive from userId
  if (userId) {
    const u = await User.findById(userId).select("Role School");
    if (u && u.Role === 5) return u.School;
  }
  // Optionally resolve by schoolEmail if you use it
  return null;
}

async function list(req, res) {
  try {
    const userId = req.user?.id;
    const { schoolId } = req.query;
    const resolvedId = await resolveSchoolId({ schoolId, userId });
    if (!resolvedId) return res.json({ success: false, error: "schoolId could not be resolved" });

    const items = await SchoolNotification.find({ School_ID: resolvedId }).sort({ Created_At: -1 });
    res.json({ success: true, notifications: items });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
}

async function count(req, res) {
  try {
    const userId = req.user?.id;
    const { schoolId } = req.query;
    const resolvedId = await resolveSchoolId({ schoolId, userId });
    if (!resolvedId) return res.json({ success: false, error: "schoolId could not be resolved" });

    const total = await SchoolNotification.countDocuments({ School_ID: resolvedId, is_Read: false });
    res.json({ success: true, count: total });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
}

async function markRead(req, res) {
  try {
    const { id } = req.params;
    const doc = await SchoolNotification.findByIdAndUpdate(id, { is_Read: true }, { new: true });
    if (!doc) return res.json({ success: false, error: "Not found" });
    res.json({ success: true, notification: doc });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
}

async function markAllRead(req, res) {
  try {
    const userId = req.user?.id;
    const { schoolId } = req.body;
    const resolvedId = await resolveSchoolId({ schoolId, userId });
    if (!resolvedId) return res.json({ success: false, error: "schoolId could not be resolved" });

    const result = await SchoolNotification.updateMany({ School_ID: resolvedId, is_Read: false }, { is_Read: true });
    res.json({ success: true, modified: result.modifiedCount || result.nModified || 0 });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
}

module.exports = { notifySchool, list, count, markRead, markAllRead };
