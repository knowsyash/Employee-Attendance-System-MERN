/**
 * Script to create Admin user from backend
 * 
 * Usage:
 * node scripts/createAdmin.js <name> <email> <password> [employeeId] [department] [position] [classroom] [phone]
 * 
 * Example:
 * node scripts/createAdmin.js "Jane Smith" "jane@company.com" "SecurePassword123" "ADM001" "Administration" "Admin" "Classroom-A" "+1234567890"
 */

require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const args = process.argv.slice(2);
    
    if (args.length < 3) {
      console.error("Usage: node createAdmin.js <name> <email> <password> [employeeId] [department] [position] [classroom] [phone]");
      console.error("Example: node createAdmin.js \"Jane Smith\" \"jane@company.com\" \"SecurePassword123\"");
      console.error("Full Example: node createAdmin.js \"Jane Smith\" \"jane@company.com\" \"SecurePassword123\" \"ADM001\" \"Admin\" \"Administrator\" \"Classroom-A\" \"+1234567890\"");
      process.exit(1);
    }

    const [name, email, password, employeeId, department, position, classroom, phone] = args;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error("Error: Invalid email format");
      process.exit(1);
    }

    if (password.length < 6) {
      console.error("Error: Password must be at least 6 characters");
      process.exit(1);
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.error(`Error: User with email ${email} already exists`);
      process.exit(1);
    }

    if (employeeId) {
      const existingEmployeeId = await User.findOne({ employeeId });
      if (existingEmployeeId) {
        console.error(`Error: Employee ID ${employeeId} already exists`);
        process.exit(1);
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "admin",
      classroom: classroom?.trim() || null,
      employeeId: employeeId?.trim(),
      department: department?.trim(),
      position: position?.trim(),
      phone: phone?.trim(),
      isActive: true,
      isEmailVerified: true,
    });

    await admin.save();

    console.log("\n✅ Admin created successfully and saved to MongoDB!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`MongoDB ID: ${admin._id}`);
    console.log(`Name: ${admin.name}`);
    console.log(`Email: ${admin.email}`);
    console.log(`Role: ${admin.role}`);
    console.log(`Employee ID: ${admin.employeeId || "N/A"}`);
    console.log(`Department: ${admin.department || "N/A"}`);
    console.log(`Position: ${admin.position || "N/A"}`);
    console.log(`Classroom: ${admin.classroom || "N/A"}`);
    console.log(`Phone: ${admin.phone || "N/A"}`);
    console.log(`Status: ${admin.isActive ? "Active" : "Inactive"}`);
    console.log(`Email Verified: ${admin.isEmailVerified ? "Yes" : "No"}`);
    console.log(`Created At: ${admin.createdAt}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅  All details have been saved to MongoDB database.");
    console.log("\n");

    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
};

createAdmin();

