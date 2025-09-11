const XLSX = require("xlsx");
const mongoose = require("mongoose");
const Fees = require("../models/FeesModel");
const Student = require("../models/StudentModel");
const { notifyByStudent } = require("../Controllers/notificationController");
const { notifySchool } = require("../Controllers/schoolNotificationController");

// Upload and Process Excel File
exports.uploadFeesExcel = async (req, res) => {
    try {
        const { schoolId } = req.params;
        const { standard } = req.body || {};

        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // Parse Excel buffer
        const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        if (!sheetData.length) {
            return res.status(400).json({ message: "Excel file is empty" });
        }

        // Get fees doc for school
        let feesDoc = await Fees.findOne({ school_Id: schoolId });
        if (!feesDoc) {
            feesDoc = new Fees({ school_Id: schoolId, Students: [] });
        }

        const affectedStudentIds = new Set();

        for (const row of sheetData) {
            const studentName = row["Name"];
            const unpaidMonths = Number(row["Number of unpaid month"] || 0);

            if (!studentName) continue;

            let student = await Student.findOne({ Name: studentName });
            let student_id = null;

            if (student && Array.isArray(student.SchoolID) && student.SchoolID.length > 0) {
                const lastSchoolId = student.SchoolID[student.SchoolID.length - 1]?.toString();

                if (lastSchoolId === schoolId.toString()) {
                    // Student belongs to this school
                    student_id = student._id;
                }
            }

            if (!student_id) {
                console.log(`Skipping ${studentName} — no matching student found in this school`);
                continue; //Skip row safely
            }

            affectedStudentIds.add(student_id.toString());

            // Check if student already in Fees
            const existingIndex = feesDoc.Students.findIndex(
                (s) => s.student_id.toString() === student_id.toString()
            );

            if (unpaidMonths === 0) {
                // Remove entry if exists
                if (existingIndex !== -1) {
                    feesDoc.Students.splice(existingIndex, 1);
                    console.log(`🗑 Removed ${studentName} (no unpaid months)`);
                }
            } else {
                if (existingIndex !== -1) {
                    // Update existing unpaid months
                    feesDoc.Students[existingIndex].No_unpaid_Month = unpaidMonths;
                    console.log(`🔄 Updated ${studentName} → ${unpaidMonths} months`);
                } else {
                    // Add new entry only if we have a valid student_id
                    feesDoc.Students.push({
                        student_id,
                        StudentName: studentName,
                        No_unpaid_Month: unpaidMonths,
                    });
                    console.log(`➕ Added ${studentName} → ${unpaidMonths} months`);
                }
            }
        }
        console.log("Final fee Entry in DB: ", feesDoc);

        await feesDoc.save();

        // Notify affected students
        for (const sid of affectedStudentIds) {
            await notifyByStudent(sid, "Your Fees data is updated");
        }
        // Notify school
        if (affectedStudentIds.size > 0) {
            await notifySchool(schoolId, `Fees are updated${standard ? ` of Standard ${standard}` : ""}`);
        }

        return res.status(200).json({
            message: "Fees data processed successfully",
            feesDoc,
        });
    } catch (err) {
        console.error("❌ Error processing fees:", err);
        return res
            .status(500)
            .json({ message: "Internal server error", error: err.message });
    }
};
