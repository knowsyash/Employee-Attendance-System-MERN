const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: String, required: true },
  status: {
    type: String,
    enum: ["Present", "Absent", "Leave", "Half Day", "Work From Home"],
    default: "Present",
  },
  checkIn: { type: Date },
  checkOut: { type: Date },
  breakStart: { type: Date },
  breakEnd: { type: Date },
  totalHours: { type: Number, default: 0 }, // in hours
  overtimeHours: { type: Number, default: 0 }, // in hours
  notes: { type: String, trim: true },
  location: { 
    latitude: { type: Number },
    longitude: { type: Number },
    address: { type: String }
  },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  approvedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Calculate total hours before saving
AttendanceSchema.pre("save", function(next) {
  if (this.checkIn && this.checkOut) {
    const checkInTime = new Date(this.checkIn);
    const checkOutTime = new Date(this.checkOut);
    let totalMs = checkOutTime - checkInTime;
    
    // Subtract break time if exists
    if (this.breakStart && this.breakEnd) {
      const breakStart = new Date(this.breakStart);
      const breakEnd = new Date(this.breakEnd);
      totalMs -= (breakEnd - breakStart);
    }
    
    this.totalHours = Math.round((totalMs / (1000 * 60 * 60)) * 100) / 100;
    
    // Calculate overtime (more than 8 hours)
    if (this.totalHours > 8) {
      this.overtimeHours = Math.round((this.totalHours - 8) * 100) / 100;
    }
  }
  
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Attendance", AttendanceSchema);
