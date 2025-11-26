const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const { verifyToken, requireMinRole } = require("../middleware/rbac");

const router = express.Router();

// Input validation helper
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

// Register - Only admins can create users with elevated roles
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, employeeId, department, position, phone, secretKey, classroom } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Check if employeeId is unique if provided
    if (employeeId) {
      const existingEmployeeId = await User.findOne({ employeeId });
      if (existingEmployeeId) {
        return res.status(400).json({ message: "Employee ID already exists" });
      }
    }

    // Determine requested role
    let userRole = role && ["super_admin", "admin", "manager", "hr", "employee"].includes(role) 
      ? role 
      : "employee";

    // Super admin cannot be created through registration API - only through backend
    if (userRole === "super_admin") {
      return res.status(403).json({ 
        message: "Super admin accounts cannot be created through registration. Contact system administrator." 
      });
    }

    // Check if user is trying to register with a role higher than employee
    const elevatedRoles = ["admin", "manager", "hr"];
    if (elevatedRoles.includes(userRole)) {
      // Require secret key for elevated roles
      if (!secretKey) {
        return res.status(400).json({ 
          message: "Secret key is required to register as " + userRole 
        });
      }

      // Verify secret key against database (generated keys)
      const SecretKey = require("../models/SecretKey");
      const keyRecord = await SecretKey.findOne({ 
        key: secretKey, 
        role: userRole,
        isActive: true 
      });

      let assignedClassroom = null;

      if (!keyRecord) {
        // Fallback to environment variable for backward compatibility
        const validSecretKey = process.env.REGISTRATION_SECRET_KEY || process.env.SECRET_KEY;
        if (!validSecretKey || secretKey !== validSecretKey) {
          return res.status(403).json({ 
            message: "Invalid secret key. Registration with elevated role denied." 
          });
        }
      } else {
        // Check if key has expired
        if (keyRecord.expiresAt && new Date() > keyRecord.expiresAt) {
          return res.status(403).json({ 
            message: "Secret key has expired. Please request a new key." 
          });
        }

        // Assign classroom from key
        assignedClassroom = keyRecord.classroom;

        // Mark key as used
        keyRecord.usedBy = null; // Will be set after user creation
        keyRecord.usedAt = new Date();
        await keyRecord.save();
      }

      // Set classroom for the user
      if (assignedClassroom) {
        // Classroom comes from secret key
      } else if (classroom) {
        // Or from request body (if provided)
        assignedClassroom = classroom;
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Determine classroom assignment
    let userClassroom = null;
    if (elevatedRoles.includes(userRole)) {
      // For elevated roles, classroom comes from secret key or request
      const SecretKey = require("../models/SecretKey");
      const keyRecord = await SecretKey.findOne({ key: secretKey });
      if (keyRecord && keyRecord.classroom) {
        userClassroom = keyRecord.classroom;
      } else if (classroom) {
        userClassroom = classroom.trim();
      }
    } else {
      // For employees, classroom is optional
      userClassroom = classroom?.trim() || null;
    }

    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: userRole,
      classroom: userClassroom,
      employeeId: employeeId?.trim(),
      department: department?.trim(),
      position: position?.trim(),
      phone: phone?.trim(),
      createdBy: req.user?._id,
    });

    await newUser.save();

    // Update secret key with user ID if it was used
    if (elevatedRoles.includes(userRole) && secretKey) {
      const SecretKey = require("../models/SecretKey");
      await SecretKey.findOneAndUpdate(
        { key: secretKey, role: userRole },
        { usedBy: newUser._id }
      );
    }

    // Remove password from response
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({ 
      message: "User registered successfully",
      user: userResponse
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log("Login attempt:", { email, passwordLength: password?.length });

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    console.log("User found:", user ? `Yes (${user.email})` : "No");

    if (!user) {
      console.log("User not found for email:", email);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isActive) {
      console.log("User account is deactivated:", email);
      return res.status(403).json({ message: "Account is deactivated. Please contact administrator." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("Password valid:", isPasswordValid);
    
    if (!isPasswordValid) {
      console.log("Invalid password for user:", email);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Remove sensitive data from response
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.passwordResetToken;
    delete userResponse.emailVerificationToken;

    res.json({
      message: "Login successful",
      token,
      refreshToken,
      user: userResponse,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get current user profile
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password -passwordResetToken -emailVerificationToken");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Update profile
router.put("/me", verifyToken, async (req, res) => {
  try {
    const { name, phone, department, position } = req.body;
    const updates = {};

    if (name) updates.name = name.trim();
    if (phone) updates.phone = phone.trim();
    if (department) updates.department = department.trim();
    if (position) updates.position = position.trim();

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password -passwordResetToken -emailVerificationToken");

    res.json({ message: "Profile updated successfully", user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Change password
router.put("/change-password", verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user._id);
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Refresh token
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const newToken = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({ token: newToken });
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired refresh token" });
  }
});

// Request password reset
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    
    // Don't reveal if user exists for security
    if (!user) {
      return res.json({ message: "If the email exists, a password reset link has been sent" });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // In production, send email here
    // For now, return token (remove in production)
    res.json({ 
      message: "Password reset token generated",
      resetToken: resetToken // Remove this in production
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Reset password
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required" });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
