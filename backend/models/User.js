const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ["super_admin", "admin", "manager", "hr", "employee"], 
    default: "employee" 
  },
  classroom: { type: String, trim: true }, // Classroom/Division identifier
  employeeId: { type: String, unique: true, sparse: true },
  department: { type: String, trim: true },
  position: { type: String, trim: true },
  phone: { type: String, trim: true },
  isActive: { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

// Index for classroom-based queries
UserSchema.index({ classroom: 1, role: 1 });

// Update the updatedAt field before saving
UserSchema.pre("save", function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("User", UserSchema);
