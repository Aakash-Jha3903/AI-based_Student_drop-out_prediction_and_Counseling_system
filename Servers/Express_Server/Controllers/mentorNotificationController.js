const MentorNotification = require("../models/MentorNotificationModel");
const Mentor = require("../models/MentorModel");

async function notifyMentor(mentorId, message) {
  try {
    if (!mentorId || !message) return { success: false, error: "mentorId and message required" };
    const mentor = await Mentor.findById(mentorId).select("_id");
    if (!mentor) return { success: false, error: "Mentor not found" };
    const doc = await MentorNotification.create({ Mentor_ID: mentorId, Message: message });
    return { success: true, notification: doc };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function resolveMentorId({ mentorId, mentorEmail }) {
  if (mentorId) return mentorId;
  if (mentorEmail) {
    const mentor = await Mentor.findOne({ Email: mentorEmail }).select("_id");
    return mentor?._id;
  }
  return null;
}

async function list(req, res) {
  try {
    const { mentorId, mentorEmail } = req.query;
    const resolvedId = await resolveMentorId({ mentorId, mentorEmail });
    if (!resolvedId) return res.json({ success: false, error: "mentorId or mentorEmail required" });
    const items = await MentorNotification.find({ Mentor_ID: resolvedId }).sort({ Created_At: -1 });
    res.json({ success: true, notifications: items });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
}

async function count(req, res) {
  try {
    const { mentorId, mentorEmail } = req.query;
    const resolvedId = await resolveMentorId({ mentorId, mentorEmail });
    if (!resolvedId) return res.json({ success: false, error: "mentorId or mentorEmail required" });
    const total = await MentorNotification.countDocuments({ Mentor_ID: resolvedId, is_Read: false });
    res.json({ success: true, count: total });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
}

async function markRead(req, res) {
  try {
    const { id } = req.params;
    const doc = await MentorNotification.findByIdAndUpdate(id, { is_Read: true }, { new: true });
    if (!doc) return res.json({ success: false, error: "Not found" });
    res.json({ success: true, notification: doc });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
}

async function markAllRead(req, res) {
  try {
    const { mentorId, mentorEmail } = req.body;
    const resolvedId = await resolveMentorId({ mentorId, mentorEmail });
    if (!resolvedId) return res.json({ success: false, error: "mentorId or mentorEmail required" });
    const result = await MentorNotification.updateMany({ Mentor_ID: resolvedId, is_Read: false }, { is_Read: true });
    res.json({ success: true, modified: result.modifiedCount || result.nModified || 0 });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
}

module.exports = { notifyMentor, list, count, markRead, markAllRead };
