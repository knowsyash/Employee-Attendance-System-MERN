/**
 * Script to create Super Admin user from backend
 * 
 * Usage:
 * node scripts/createSuperAdmin.js <name> <email> <password> [employeeId] [department] [position] [classroom] [phone]
 * 
 * Example:
 * node scripts/createSuperAdmin.js "John Doe" "admin@company.com" "SecurePassword123" "EMP001" "IT" "System Administrator" "MainOffice" "+1234567890"
 * 
 * Note: Super Admin doesn't need a classroom, but can be assigned one for organization
 */

require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const createSuperAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    // Get arguments from command line
    const args = process.argv.slice(2);
    
    if (args.length < 3) {
      console.error("Usage: node createSuperAdmin.js <name> <email> <password> [employeeId] [department] [position] [classroom] [phone]");
      console.error("Example: node createSuperAdmin.js \"John Doe\" \"admin@company.com\" \"SecurePassword123\"");
      console.error("Full Example: node createSuperAdmin.js \"John Doe\" \"admin@company.com\" \"SecurePassword123\" \"EMP001\" \"IT\" \"System Admin\" \"MainOffice\" \"+1234567890\"");
      process.exit(1);
    }

    const [name, email, password, employeeId, department, position, classroom, phone] = args;

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error("Error: Invalid email format");
      process.exit(1);
    }

    // Validate password
    if (password.length < 6) {
      console.error("Error: Password must be at least 6 characters");
      process.exit(1);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.error(`Error: User with email ${email} already exists`);
      process.exit(1);
    }

    // Check if employeeId is unique if provided
    if (employeeId) {
      const existingEmployeeId = await User.findOne({ employeeId });
      if (existingEmployeeId) {
        console.error(`Error: Employee ID ${employeeId} already exists`);
        process.exit(1);
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create super admin user
    const superAdmin = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "super_admin",
      classroom: classroom?.trim() || null, // Super admin can have classroom for organization
      employeeId: employeeId?.trim(),
      department: department?.trim(),
      position: position?.trim(),
      phone: phone?.trim(),
      isActive: true,
      isEmailVerified: true, // Auto-verify for super admin
    });

    await superAdmin.save();

    console.log("\n✅ Super Admin created successfully and saved to MongoDB!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`MongoDB ID: ${superAdmin._id}`);
    console.log(`Name: ${superAdmin.name}`);
    console.log(`Email: ${superAdmin.email}`);
    console.log(`Role: ${superAdmin.role}`);
    console.log(`Employee ID: ${superAdmin.employeeId || "N/A"}`);
    console.log(`Department: ${superAdmin.department || "N/A"}`);
    console.log(`Position: ${superAdmin.position || "N/A"}`);
    console.log(`Classroom: ${superAdmin.classroom || "N/A"}`);
    console.log(`Phone: ${superAdmin.phone || "N/A"}`);
    console.log(`Status: ${superAdmin.isActive ? "Active" : "Inactive"}`);
    console.log(`Email Verified: ${superAdmin.isEmailVerified ? "Yes" : "No"}`);
    console.log(`Created At: ${superAdmin.createdAt}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n⚠️  IMPORTANT: Keep these credentials secure!");
    console.log("⚠️  Do not share the password with unauthorized personnel.");
    console.log("✅  All details have been saved to MongoDB database.");
    console.log("\n");

    process.exit(0);
  } catch (error) {
    console.error("Error creating super admin:", error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
};

// Run the script
createSuperAdmin();

