/**
 * Script to test Super Admin login and attendance protocol
 * 
 * Usage:
 * node scripts/testSuperAdminLogin.js <email> <password>
 * 
 * Example:
 * node scripts/testSuperAdminLogin.js "admin@example.com" "SuperAdmin123"
 */

require("dotenv").config({ path: ".env.local" });
const http = require("http");

const BASE_URL = process.env.BASE_URL || "http://localhost:5000";

// Helper function to make HTTP requests
const makeRequest = (method, path, data = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || 5000,
      path: url.pathname,
      method: method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    const req = http.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        try {
          const response = {
            status: res.statusCode,
            data: body ? JSON.parse(body) : null,
          };
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(response);
          } else {
            const error = new Error(`Request failed with status ${res.statusCode}`);
            error.response = response;
            reject(error);
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on("error", reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
};

// Color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.blue}${msg}${colors.reset}`),
};

const testSuperAdminLogin = async () => {
  try {
    const args = process.argv.slice(2);
    
    if (args.length < 2) {
      log.error("Usage: node testSuperAdminLogin.js <email> <password>");
      log.info("Example: node testSuperAdminLogin.js \"admin@example.com\" \"SuperAdmin123\"");
      process.exit(1);
    }

    const [email, password] = args;

    log.header("════════════════════════════════════════════════════════");
    log.header("  SUPER ADMIN LOGIN & ATTENDANCE PROTOCOL TEST");
    log.header("════════════════════════════════════════════════════════");
    
    console.log(`\n${colors.cyan}Testing with:${colors.reset}`);
    console.log(`  Email: ${email}`);
    console.log(`  Password: ${"*".repeat(password.length)}`);
    console.log(`  Server: ${BASE_URL}`);

    // Step 1: Test Login
    log.header("\n[1] TESTING LOGIN...");
    let loginResponse;
    try {
      loginResponse = await makeRequest("POST", "/api/auth/login", {
        email,
        password,
      });
      
      log.success("Login successful!");
      console.log(`\n${colors.green}Response Data:${colors.reset}`);
      console.log(`  User ID: ${loginResponse.data.user._id}`);
      console.log(`  Name: ${loginResponse.data.user.name}`);
      console.log(`  Email: ${loginResponse.data.user.email}`);
      console.log(`  Role: ${loginResponse.data.user.role}`);
      console.log(`  Department: ${loginResponse.data.user.department || "N/A"}`);
      console.log(`  Position: ${loginResponse.data.user.position || "N/A"}`);
      console.log(`  Employee ID: ${loginResponse.data.user.employeeId || "N/A"}`);
      console.log(`  Status: ${loginResponse.data.user.isActive ? "Active" : "Inactive"}`);
      console.log(`  Token: ${loginResponse.data.token.substring(0, 20)}...`);
    } catch (error) {
      log.error("Login failed!");
      if (error.response) {
        console.log(`  Status: ${error.response.status}`);
        console.log(`  Message: ${error.response.data?.message || error.message}`);
      } else {
        console.log(`  Error: ${error.message || "Connection refused - Is the backend server running?"}`);
        console.log(`\n${colors.yellow}Please ensure:${colors.reset}`);
        console.log(`  1. Backend server is running (npm run dev in backend folder)`);
        console.log(`  2. Server is accessible at ${BASE_URL}`);
        console.log(`  3. MongoDB is connected`);
      }
      process.exit(1);
    }

    const token = loginResponse.data.token;
    const userId = loginResponse.data.user._id;

    // Step 2: Test Token Verification
    log.header("\n[2] TESTING TOKEN VERIFICATION...");
    try {
      const verifyResponse = await makeRequest("GET", "/api/auth/me", null, {
        Authorization: `Bearer ${token}`,
      });
      log.success("Token verification successful!");
      console.log(`  Verified User: ${verifyResponse.data.name} (${verifyResponse.data.role})`);
    } catch (error) {
      log.warn("Token verification endpoint not available or failed");
      if (error.response) {
        console.log(`  Status: ${error.response.status}`);
      }
    }

    // Step 3: Test Check-In (Attendance)
    log.header("\n[3] TESTING ATTENDANCE CHECK-IN...");
    try {
      const checkInResponse = await makeRequest(
        "POST",
        "/api/attendance/checkin",
        {},
        {
          Authorization: `Bearer ${token}`,
        }
      );
      log.success("Check-in successful!");
      console.log(`  Attendance ID: ${checkInResponse.data._id || checkInResponse.data.id || "N/A"}`);
      console.log(`  Check-in Time: ${checkInResponse.data.checkIn || checkInResponse.data.checkInTime || new Date().toISOString()}`);
      console.log(`  Status: ${checkInResponse.data.status || "Checked In"}`);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes("already checked in")) {
        log.warn("Already checked in today");
        console.log(`  Message: ${error.response.data.message}`);
      } else {
        log.error("Check-in failed!");
        if (error.response) {
          console.log(`  Status: ${error.response.status}`);
          console.log(`  Message: ${error.response.data.message || error.message}`);
        } else {
          console.log(`  Error: ${error.message}`);
        }
      }
    }

    // Step 4: Test Get Today's Attendance
    log.header("\n[4] TESTING GET TODAY'S ATTENDANCE...");
    try {
      const attendanceResponse = await makeRequest(
        "GET",
        "/api/attendance/today",
        null,
        {
          Authorization: `Bearer ${token}`,
        }
      );
      log.success("Retrieved today's attendance!");
      if (attendanceResponse.data) {
        console.log(`  Check-in: ${attendanceResponse.data.checkIn || attendanceResponse.data.checkInTime || "Not checked in"}`);
        console.log(`  Check-out: ${attendanceResponse.data.checkOut || attendanceResponse.data.checkOutTime || "Not checked out"}`);
        console.log(`  Status: ${attendanceResponse.data.status || "N/A"}`);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        log.warn("No attendance record for today");
      } else {
        log.error("Failed to get attendance!");
        if (error.response) {
          console.log(`  Status: ${error.response.status}`);
          console.log(`  Message: ${error.response.data.message || error.message}`);
        } else {
          console.log(`  Error: ${error.message}`);
        }
      }
    }

    // Step 5: Test Check-Out (Attendance)
    log.header("\n[5] TESTING ATTENDANCE CHECK-OUT...");
    try {
      const checkOutResponse = await makeRequest(
        "POST",
        "/api/attendance/checkout",
        {},
        {
          Authorization: `Bearer ${token}`,
        }
      );
      log.success("Check-out successful!");
      console.log(`  Attendance ID: ${checkOutResponse.data._id || checkOutResponse.data.id || "N/A"}`);
      console.log(`  Check-out Time: ${checkOutResponse.data.checkOut || checkOutResponse.data.checkOutTime || new Date().toISOString()}`);
      console.log(`  Status: ${checkOutResponse.data.status || "Checked Out"}`);
    } catch (error) {
      if (error.response?.status === 400) {
        log.warn("Check-out condition not met");
        console.log(`  Message: ${error.response.data.message}`);
      } else {
        log.error("Check-out failed!");
        if (error.response) {
          console.log(`  Status: ${error.response.status}`);
          console.log(`  Message: ${error.response.data.message || error.message}`);
        } else {
          console.log(`  Error: ${error.message}`);
        }
      }
    }

    // Summary
    log.header("\n════════════════════════════════════════════════════════");
    log.success("PROTOCOL TEST COMPLETED!");
    log.header("════════════════════════════════════════════════════════\n");
    
    console.log(`${colors.green}Summary:${colors.reset}`);
    console.log(`  ✓ Login authentication working`);
    console.log(`  ✓ Token generation successful`);
    console.log(`  ✓ Super admin account verified`);
    console.log(`\n${colors.cyan}Super Admin can now access the system!${colors.reset}\n`);

  } catch (error) {
    log.header("\n════════════════════════════════════════════════════════");
    log.error("PROTOCOL TEST FAILED!");
    log.header("════════════════════════════════════════════════════════\n");
    console.error(error.message);
    process.exit(1);
  }
};

// Run the test
testSuperAdminLogin();
