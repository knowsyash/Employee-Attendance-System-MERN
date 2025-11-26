const express = require("express");
const Attendance = require("../models/Attendance");
const User = require("../models/User");
const { verifyToken, requireMinRole, requireRole, canManageUser } = require("../middleware/rbac");

const router = express.Router();

// Get all users - accessible by admin, manager, hr
router.get("/users", verifyToken, requireMinRole("hr"), async (req, res) => {
  try {
    const { role, department, isActive, classroom } = req.query;
    const filter = {};
    const userRole = req.user.role;
    const userClassroom = req.user.classroom;

    // Super admin can see all users
    if (userRole !== "super_admin") {
      // Admins can only see users in their classroom
      if (userRole === "admin" && userClassroom) {
        filter.classroom = userClassroom;
      }
      // Managers can only see their department and classroom
      else if (userRole === "manager") {
        if (userClassroom) filter.classroom = userClassroom;
        if (req.user.department) filter.department = req.user.department;
      }
      // HR can only see their classroom
      else if (userRole === "hr" && userClassroom) {
        filter.classroom = userClassroom;
      }
    }

    if (role) filter.role = role;
    if (department) filter.department = department;
    if (classroom) filter.classroom = classroom;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const users = await User.find(filter)
      .select("-password -passwordResetToken -emailVerificationToken")
      .sort({ createdAt: -1 });
    
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Update user - requires appropriate permissions
router.put("/users/:id", verifyToken, canManageUser, async (req, res) => {
  try {
    const { name, email, role, department, position, phone, isActive, employeeId, classroom } = req.body;
    const updates = {};
    const userRole = req.user.role;
    const userClassroom = req.user.classroom;

    // Only admins can change role and isActive
    if (["super_admin", "admin"].includes(userRole)) {
      if (role && ["super_admin", "admin", "manager", "hr", "employee"].includes(role)) {
        // Prevent non-super-admins from creating super admins
        if (role === "super_admin" && userRole !== "super_admin") {
          return res.status(403).json({ message: "Only super admins can assign super admin role" });
        }
        updates.role = role;
      }
      if (isActive !== undefined) updates.isActive = isActive;
    }

    // Classroom management
    if (classroom !== undefined) {
      // Only super admin can change classroom, or admin can set their own classroom
      if (userRole === "super_admin") {
        updates.classroom = classroom?.trim() || null;
      } else if (userRole === "admin" && userClassroom) {
        // Admin can only assign users to their own classroom
        updates.classroom = userClassroom;
      }
    }

    if (name) updates.name = name.trim();
    if (email) updates.email = email.toLowerCase().trim();
    if (department) updates.department = department.trim();
    if (position) updates.position = position.trim();
    if (phone) updates.phone = phone.trim();
    if (employeeId) updates.employeeId = employeeId.trim();

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password -passwordResetToken -emailVerificationToken");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User updated successfully", user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get attendance - accessible by admin, manager, hr
router.get("/attendance", verifyToken, requireMinRole("hr"), async (req, res) => {
  try {
    const { userId, date, startDate, endDate } = req.query;
    const filter = {};
    const userRole = req.user.role;
    const userClassroom = req.user.classroom;

    if (userId) filter.userId = userId;
    if (date) filter.date = date;
    if (startDate && endDate) {
      filter.date = { $gte: startDate, $lte: endDate };
    }

    // Apply classroom filtering based on role
    if (userRole !== "super_admin") {
      if (userRole === "admin" && userClassroom) {
        // Admin can only see attendance for users in their classroom
        const classroomUsers = await User.find({ classroom: userClassroom }).select("_id");
        filter.userId = { $in: classroomUsers.map(u => u._id) };
      } else if (userRole === "manager") {
        // Manager can only see their department and classroom
        const managerFilter = {};
        if (userClassroom) managerFilter.classroom = userClassroom;
        if (req.user.department) managerFilter.department = req.user.department;
        const departmentUsers = await User.find(managerFilter).select("_id");
        filter.userId = { $in: departmentUsers.map(u => u._id) };
      } else if (userRole === "hr" && userClassroom) {
        // HR can only see their classroom
        const classroomUsers = await User.find({ classroom: userClassroom }).select("_id");
        filter.userId = { $in: classroomUsers.map(u => u._id) };
      }
    }

    const attendance = await Attendance.find(filter)
      .populate("userId", "name email employeeId department classroom")
      .populate("approvedBy", "name email")
      .sort({ date: -1, createdAt: -1 });
    
    res.json(attendance);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Create/Update attendance - accessible by admin, manager, hr
router.post("/attendance", verifyToken, requireMinRole("hr"), async (req, res) => {
  try {
    const { userId, date, status, checkIn, checkOut, breakStart, breakEnd, notes } = req.body;

    if (!userId || !date) {
      return res.status(400).json({ message: "User ID and date are required" });
    }

    // Check if user can manage this user
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Managers can only manage their department
    if (req.user.role === "manager" && req.user.department !== targetUser.department) {
      return res.status(403).json({ message: "You can only manage users in your department" });
    }

    const existingRecord = await Attendance.findOne({ userId, date });

    if (existingRecord) {
      if (status) existingRecord.status = status;
      if (checkIn) existingRecord.checkIn = checkIn;
      if (checkOut) existingRecord.checkOut = checkOut;
      if (breakStart) existingRecord.breakStart = breakStart;
      if (breakEnd) existingRecord.breakEnd = breakEnd;
      if (notes !== undefined) existingRecord.notes = notes;
      existingRecord.approvedBy = req.user._id;
      existingRecord.approvedAt = new Date();
      
      await existingRecord.save();
      return res.json({ message: "Attendance updated", attendance: existingRecord });
    }

    const newAttendance = new Attendance({
      userId,
      date,
      status: status || "Present",
      checkIn,
      checkOut,
      breakStart,
      breakEnd,
      notes,
      approvedBy: req.user._id,
      approvedAt: new Date(),
    });
    
    await newAttendance.save();
    res.json({ message: "Attendance added", attendance: newAttendance });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get all attendance for a user
router.get("/attendance/all", verifyToken, requireMinRole("hr"), async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const filter = { userId };
    if (startDate && endDate) {
      filter.date = { $gte: startDate, $lte: endDate };
    }

    const attendanceRecords = await Attendance.find(filter)
      .populate("userId", "name email employeeId department")
      .populate("approvedBy", "name email")
      .sort({ date: -1 });
    
    res.json(attendanceRecords);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Delete attendance - only admins
router.delete("/attendance/:id", verifyToken, requireMinRole("admin"), async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);
    if (!attendance) {
      return res.status(404).json({ message: "Attendance record not found" });
    }
    res.json({ message: "Attendance deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Delete user - only admins, and cannot delete super admin
router.delete("/users/:id", verifyToken, requireMinRole("admin"), canManageUser, async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent deleting super admin
    if (user.role === "super_admin") {
      return res.status(403).json({ message: "Cannot delete super admin" });
    }

    // Soft delete - deactivate instead of delete
    user.isActive = false;
    await user.save();

    // Optionally delete attendance records
    // await Attendance.deleteMany({ userId });

    res.json({
      message: "User deactivated successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to deactivate user", error: error.message });
  }
});

// Update user role - only admins
router.put("/users/:id/role", verifyToken, requireMinRole("admin"), canManageUser, async (req, res) => {
  try {
    const { role } = req.body;
    const userRole = req.user.role;
    const userClassroom = req.user.classroom;
    
    if (!["super_admin", "admin", "manager", "hr", "employee"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Prevent non-super-admins from creating super admins
    if (role === "super_admin" && userRole !== "super_admin") {
      return res.status(403).json({ message: "Only super admins can assign super admin role" });
    }

    // Check classroom access for same-level admins
    if (userRole === "admin" && userClassroom) {
      const targetUser = await User.findById(req.params.id);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }
      // Admin can only change roles of users in their classroom
      if (targetUser.classroom !== userClassroom) {
        return res.status(403).json({ 
          message: "You can only manage users in your classroom" 
        });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password -passwordResetToken -emailVerificationToken");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Role updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Failed to update role", error: error.message });
  }
});

module.exports = router;
