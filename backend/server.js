require("dotenv").config({ path: ".env.local" });
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB connection with proper options
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("✅ MongoDB Connected Successfully");
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    console.log("\n⚠️  SOLUTION: Please whitelist your IP address in MongoDB Atlas:");
    console.log("   1. Go to https://cloud.mongodb.com/");
    console.log("   2. Navigate to Network Access");
    console.log("   3. Click 'Add IP Address'");
    console.log("   4. Add your current IP or click 'Allow Access from Anywhere'\n");
    // Don't exit, let the server run for API testing
  }
};

connectDB();

// Handle MongoDB connection errors after initial connection
mongoose.connection.on('error', err => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected - attempting to reconnect...');
});

mongoose.connection.on('connected', () => {
  console.log('MongoDB reconnected successfully');
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api/attendance", require("./routes/attendance"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/secret-keys", require("./routes/secretKeys"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
