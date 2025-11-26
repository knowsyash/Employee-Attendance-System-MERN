const express = require("express");
const Attendance = require("../models/Attendance");
const User = require("../models/User");
const { verifyToken, canManageUser } = require("../middleware/rbac");

const router = express.Router();

// Check-in
router.post("/check-in", verifyToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date().toISOString().split("T")[0];
    const now = new Date();

    // Check if already checked in today
    const existingRecord = await Attendance.findOne({ userId, date: today });

    if (existingRecord && existingRecord.checkIn) {
      return res.status(400).json({ message: "Already checked in today" });
    }

    if (existingRecord) {
      existingRecord.checkIn = now;
      existingRecord.status = "Present";
      await existingRecord.save();
      return res.json({ message: "Checked in successfully", attendance: existingRecord });
    }

    const newAttendance = new Attendance({
      userId,
      date: today,
      checkIn: now,
      status: "Present",
    });

    await newAttendance.save();
    res.json({ message: "Checked in successfully", attendance: newAttendance });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Check-out
router.post("/check-out", verifyToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date().toISOString().split("T")[0];
    const now = new Date();

    const attendance = await Attendance.findOne({ userId, date: today });

    if (!attendance) {
      return res.status(400).json({ message: "Please check in first" });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ message: "Already checked out today" });
    }

    attendance.checkOut = now;
    await attendance.save();

    res.json({ message: "Checked out successfully", attendance });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Start break
router.post("/break-start", verifyToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date().toISOString().split("T")[0];
    const now = new Date();

    const attendance = await Attendance.findOne({ userId, date: today });

    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({ message: "Please check in first" });
    }

    if (attendance.breakStart) {
      return res.status(400).json({ message: "Break already started" });
    }

    attendance.breakStart = now;
    await attendance.save();

    res.json({ message: "Break started", attendance });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// End break
router.post("/break-end", verifyToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date().toISOString().split("T")[0];
    const now = new Date();

    const attendance = await Attendance.findOne({ userId, date: today });

    if (!attendance || !attendance.checkIn) {
      return res.status(400).json({ message: "Please check in first" });
    }

    if (!attendance.breakStart) {
      return res.status(400).json({ message: "Break not started" });
    }

    if (attendance.breakEnd) {
      return res.status(400).json({ message: "Break already ended" });
    }

    attendance.breakEnd = now;
    await attendance.save();

    res.json({ message: "Break ended", attendance });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get today's attendance status
router.get("/today", verifyToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date().toISOString().split("T")[0];

    const attendance = await Attendance.findOne({ userId, date: today })
      .populate("userId", "name email employeeId");

    if (!attendance) {
      return res.json({
        checkedIn: false,
        checkedOut: false,
        onBreak: false,
        date: today,
      });
    }

    res.json({
      checkedIn: !!attendance.checkIn,
      checkedOut: !!attendance.checkOut,
      onBreak: !!attendance.breakStart && !attendance.breakEnd,
      checkIn: attendance.checkIn,
      checkOut: attendance.checkOut,
      breakStart: attendance.breakStart,
      breakEnd: attendance.breakEnd,
      totalHours: attendance.totalHours,
      overtimeHours: attendance.overtimeHours,
      status: attendance.status,
      attendance,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get attendance by user (self or with permission)
router.get("/:userId", verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { year, month } = req.query;
    const userRole = req.user.role;
    const userClassroom = req.user.classroom;

    // Users can only view their own attendance unless they have permission
    if (userId !== req.user._id.toString()) {
      // Check if user has permission to view others
      const canView = ["super_admin", "admin", "manager", "hr"].includes(userRole);
      if (!canView) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Check classroom access for same-level roles
      if (userRole !== "super_admin") {
        const targetUser = await User.findById(userId);
        if (!targetUser) {
          return res.status(404).json({ message: "User not found" });
        }

        // Admins can only see users in their classroom
        if (userRole === "admin" && userClassroom && targetUser.classroom !== userClassroom) {
          return res.status(403).json({ 
            message: "You can only view attendance for users in your classroom" 
          });
        }
        // HR can only see their classroom
        if (userRole === "hr" && userClassroom && targetUser.classroom !== userClassroom) {
          return res.status(403).json({ 
            message: "You can only view attendance for users in your classroom" 
          });
        }
      }
    }

    const filter = { userId };

    if (year && month) {
      const startDate = `${year}-${month.padStart(2, "0")}-01`;
      const endDate = `${year}-${month.padStart(2, "0")}-31`;
      filter.date = { $gte: startDate, $lte: endDate };
    }

    const attendance = await Attendance.find(filter)
      .populate("approvedBy", "name email")
      .sort({ date: -1 });

    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get attendance summary
router.get("/summary/:userId", verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({ message: "Year and month are required" });
    }

    // Users can only view their own summary unless they have permission
    if (userId !== req.user._id.toString()) {
      const canView = ["super_admin", "admin", "manager", "hr"].includes(req.user.role);
      if (!canView) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const startDate = `${year}-${month.padStart(2, "0")}-01`;
    const endDate = `${year}-${month.padStart(2, "0")}-31`;

    const attendanceRecords = await Attendance.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    });

    const presentDays = attendanceRecords.filter(
      (record) => record.status?.trim().toLowerCase() === "present"
    ).length;
    const absentDays = attendanceRecords.filter(
      (record) => record.status?.trim().toLowerCase() === "absent"
    ).length;
    const leaveDays = attendanceRecords.filter(
      (record) => record.status?.trim().toLowerCase() === "leave"
    ).length;
    const halfDays = attendanceRecords.filter(
      (record) => record.status?.trim().toLowerCase() === "half day"
    ).length;
    const wfhDays = attendanceRecords.filter(
      (record) => record.status?.trim().toLowerCase() === "work from home"
    ).length;

    const totalHours = attendanceRecords.reduce((sum, record) => sum + (record.totalHours || 0), 0);
    const totalOvertime = attendanceRecords.reduce((sum, record) => sum + (record.overtimeHours || 0), 0);

    res.json({
      userName: user.name,
      userEmail: user.email,
      employeeId: user.employeeId,
      department: user.department,
      year,
      month,
      presentDays,
      absentDays,
      leaveDays,
      halfDays,
      wfhDays,
      totalHours: Math.round(totalHours * 100) / 100,
      totalOvertime: Math.round(totalOvertime * 100) / 100,
    });
  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
});

// Get attendance details for a month
router.get("/details/:userId", verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { year, month } = req.query;

    if (!userId || !year || !month) {
      return res.status(400).json({ message: "User ID, year, and month are required" });
    }

    // Users can only view their own details unless they have permission
    if (userId !== req.user._id.toString()) {
      const canView = ["super_admin", "admin", "manager", "hr"].includes(req.user.role);
      if (!canView) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    const y = parseInt(year, 10);
    const m = parseInt(month, 10);

    if (isNaN(y) || isNaN(m) || m < 1 || m > 12) {
      return res.status(400).json({ message: "Invalid year or month format" });
    }

    const startDate = `${y}-${String(m).padStart(2, "0")}-01`;
    const endDate = `${y}-${String(m + 1).padStart(2, "0")}-01`;

    const records = await Attendance.find({
      userId,
      date: { $gte: startDate, $lt: endDate },
    })
      .populate("approvedBy", "name email")
      .sort({ date: 1 });

    res.json(records);
  } catch (error) {
    console.error("Server Error Fetching Attendance:", error);
    res.status(500).json({ message: "Failed to fetch attendance records", error: error.message });
  }
});

// Legacy route for backward compatibility
router.post("/", verifyToken, async (req, res) => {
  try {
    const { userId, status } = req.body;
    const today = new Date().toISOString().split("T")[0];

    // Users can only mark their own attendance
    if (userId !== req.user._id.toString()) {
      return res.status(403).json({ message: "You can only mark your own attendance" });
    }

    const attendance = new Attendance({ userId, date: today, status: status || "Present" });
    await attendance.save();

    res.json({ message: "Attendance marked", attendance });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
