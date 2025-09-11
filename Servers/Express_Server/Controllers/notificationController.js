const Notification = require("../models/NotificationModel");
const Student = require("../models/StudentModel");

// Simple notify function using Student_ID and Message
async function notifyByStudent(studentId, message) {
  try {
    if (!studentId || !message) return { success: false, error: "studentId and message required" };

    // Ensure student exists
    const student = await Student.findById(studentId).select("_id");
    if (!student) return { success: false, error: "Student not found" };

    const doc = await Notification.create({
      Student_ID: studentId,
      Message: message,
    });
    return { success: true, notification: doc };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Resolve studentId by either studentId or studentEmail
async function resolveStudentId({ studentId, studentEmail }) {
  if (studentId) return studentId;
  if (studentEmail) {
    const student = await Student.findOne({ Email: studentEmail }).select("_id");
    return student?._id;
  }
  return null;
}

// Get notifications by student
async function list(req, res) {
  try {
    const { studentId, studentEmail } = req.query;
    const resolvedId = await resolveStudentId({ studentId, studentEmail });
    if (!resolvedId) return res.json({ success: false, error: "studentId or studentEmail required" });

    const items = await Notification.find({ Student_ID: resolvedId })
      .sort({ Created_At: -1 });

    res.json({ success: true, notifications: items });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
}

// Get unread count
async function count(req, res) {
  try {
    const { studentId, studentEmail } = req.query;
    const resolvedId = await resolveStudentId({ studentId, studentEmail });
    if (!resolvedId) return res.json({ success: false, error: "studentId or studentEmail required" });

    const total = await Notification.countDocuments({ Student_ID: resolvedId, is_Read: false });
    res.json({ success: true, count: total });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
}

// Mark one as read
async function markRead(req, res) {
  try {
    const { id } = req.params;
    const doc = await Notification.findByIdAndUpdate(id, { is_Read: true }, { new: true });
    if (!doc) return res.json({ success: false, error: "Not found" });
    res.json({ success: true, notification: doc });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
}

// Mark all read for a student
async function markAllRead(req, res) {
  try {
    const { studentId, studentEmail } = req.body;
    const resolvedId = await resolveStudentId({ studentId, studentEmail });
    if (!resolvedId) return res.json({ success: false, error: "studentId or studentEmail required" });

    const result = await Notification.updateMany({ Student_ID: resolvedId, is_Read: false }, { is_Read: true });
    res.json({ success: true, modified: result.modifiedCount || result.nModified || 0 });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
}

module.exports = { notifyByStudent, list, count, markRead, markAllRead };
