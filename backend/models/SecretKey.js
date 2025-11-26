const mongoose = require("mongoose");

const SecretKeySchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  role: { 
    type: String, 
    enum: ["super_admin", "admin", "manager", "hr", "employee"],
    required: true 
  },
  classroom: { type: String, trim: true }, // Classroom/Division this key belongs to
  generatedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  generatedByRole: { 
    type: String, 
    enum: ["super_admin", "admin", "manager", "hr"],
    required: true 
  },
  generatedByClassroom: { type: String, trim: true }, // Classroom of the generator
  isActive: { type: Boolean, default: true },
  usedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  },
  usedAt: { type: Date },
  expiresAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

// Index for faster lookups
SecretKeySchema.index({ key: 1 });
SecretKeySchema.index({ role: 1, isActive: 1 });

module.exports = mongoose.model("SecretKey", SecretKeySchema);

