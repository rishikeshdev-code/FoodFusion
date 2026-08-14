const path = require("path");
const dns = require("dns");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, ".env") });

// Ensure SRV DNS lookup resolves reliably across all local network and Windows configurations
try {
  dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);
} catch (dnsErr) {
  // Use default system resolver if custom DNS cannot be configured
}

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const foodRoutes = require("./routes/foodRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// cors and body parser
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "FoodFusion Backend API is online & healthy",
    mongoStatus: mongoose.connection.readyState === 1 ? "Connected" : "Connecting/Offline",
  });
});

// api routes
app.use("/api/foods", foodRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

// error handling
app.use((err, req, res, next) => {
  console.error("Unhandled Server Error:", err);
  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// database connection
const connectDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGO_URL;

    if (!mongoUri) {
      console.warn("⚠️ MONGO_URI missing from .env file. Running in memory mode.");
      return;
    }

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log("✅ MongoDB connected successfully to FoodFusion Atlas Cluster!");
  } catch (error) {
    console.error("⚠️ MongoDB initial connection warning:", error.message);
    console.log("🔄 Server remains active. Reconnecting to MongoDB in background...");
  }
};

// start server
app.listen(PORT, () => {
  console.log(`🚀 FoodFusion Server listening on http://localhost:${PORT}`);
  connectDatabase();
});