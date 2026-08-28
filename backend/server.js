const path = require("path");
const dns = require("dns");
const dotenv = require("dotenv");

dotenv.config({
  path: path.join(__dirname, ".env"),
});

// ============================================================
// DNS CONFIGURATION
// ============================================================

try {
  dns.setServers([
    "8.8.8.8",
    "8.8.4.4",
    "1.1.1.1",
  ]);
} catch (dnsErr) {
  console.warn(
    "⚠️ Custom DNS configuration unavailable. Using system DNS."
  );
}

// ============================================================
// IMPORTS
// ============================================================

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo").default || require("connect-mongo");
const passport = require("./config/passport");

const foodRoutes = require("./routes/foodRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");

// ============================================================
// APP CONFIGURATION
// ============================================================

const app = express();

const parsedPort = Number.parseInt(process.env.PORT, 10);
const PORT = Number.isInteger(parsedPort) && parsedPort > 0 ? parsedPort : 5000;

// Trust Render / reverse proxy
app.set("trust proxy", 1);

// ============================================================
// ENVIRONMENT
// ============================================================

const isProduction =
  process.env.NODE_ENV === "production" ||
  Boolean(
    process.env.FRONTEND_URL &&
      process.env.FRONTEND_URL.includes("netlify.app")
  );

// ============================================================
// CORS
// ============================================================

const allowedOrigins = [
  "https://momsfood-fusion.netlify.app",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5000",
  process.env.FRONTEND_URL?.replace(/\/$/, ""),
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no Origin header
      // such as health checks and server-to-server requests.
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin.replace(/\/$/, ""))) {
        return callback(null, true);
      }

      console.warn(`❌ CORS blocked origin: ${origin}`);

      return callback(new Error("Not allowed by CORS"));
    },

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
    ],

    credentials: true,
  })
);

// ============================================================
// BODY PARSING
// ============================================================

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

// ============================================================
// SESSION CONFIGURATION
// ============================================================

const mongoUri = (process.env.MONGO_URI || process.env.MONGO_URL || "").trim();

const sessionSecret =
  process.env.SESSION_SECRET ||
  (isProduction
    ? null
    : "FoodFusion_Development_Session_Secret_2026");

if (isProduction && !sessionSecret) {
  console.error(
    "❌ SESSION_SECRET is missing in production environment variables."
  );

  process.exit(1);
}

if (!mongoUri) {
  console.error(
    "❌ MONGO_URI or MONGO_URL is missing."
  );
}

if (!sessionSecret) {
  // Prevent express-session from throwing a less useful configuration error.
  process.exitCode = 1;
  throw new Error("SESSION_SECRET must be configured before starting the server.");
}

// ============================================================
// EXPRESS SESSION
// ============================================================

app.use(
  session({
    secret: sessionSecret,

    resave: false,

    saveUninitialized: false,

    proxy: true,

    store: mongoUri
      ? MongoStore.create({
          mongoUrl: mongoUri,

          collectionName: "sessions",

          ttl: 24 * 60 * 60,

          autoRemove: "native",
        })
      : undefined,

    cookie: {
      secure: isProduction,

      httpOnly: true,

      sameSite: isProduction
        ? "none"
        : "lax",

      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);

// ============================================================
// PASSPORT
// ============================================================

app.use(passport.initialize());

app.use(passport.session());

// ============================================================
// HEALTH CHECK
// ============================================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,

    message:
      "FoodFusion Backend API is online & healthy",

    mongoStatus:
      mongoose.connection.readyState === 1
        ? "Connected"
        : "Connecting/Offline",
  });
});

// ============================================================
// API ROUTES
// ============================================================

// Authentication
app.use("/auth", authRoutes);

app.use("/api/auth", authRoutes);

// Food
app.use("/api/foods", foodRoutes);

// Users
app.use("/api/users", userRoutes);

// Orders
app.use("/api/orders", orderRoutes);

// Admin
app.use("/api/admin", adminRoutes);

// ============================================================
// ERROR HANDLER
// ============================================================

app.use((err, req, res, next) => {
  console.error(
    "Unhandled Server Error:",
    err
  );

  if (res.headersSent) {
    return next(err);
  }

  res.status(err.statusCode || err.status || 500).json({
    success: false,

    message: err.message || "Internal Server Error",
  });
});

// ============================================================
// MONGODB CONNECTION
// ============================================================

const connectDatabase = async () => {
  try {
    if (!mongoUri) {
      console.error(
        "❌ MongoDB connection string is missing."
      );

      return;
    }

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(
      "✅ MongoDB connected successfully to FoodFusion Atlas Cluster!"
    );
  } catch (error) {
    console.error(
      "⚠️ MongoDB initial connection warning:",
      error.message
    );

    console.log(
      "🔄 Server remains active. MongoDB will retry automatically."
    );
  }
};

// ============================================================
// MONGOOSE CONNECTION EVENTS
// ============================================================

mongoose.connection.on(
  "connected",
  () => {
    console.log(
      "🟢 MongoDB connection established."
    );
  }
);

mongoose.connection.on(
  "error",
  (error) => {
    console.error(
      "🔴 MongoDB error:",
      error.message
    );
  }
);

mongoose.connection.on(
  "disconnected",
  () => {
    console.warn(
      "🟡 MongoDB disconnected."
    );
  }
);

// ============================================================
// START SERVER
// ============================================================

const server = app.listen(PORT, () => {
  console.log(
    `🚀 FoodFusion Server listening on http://localhost:${PORT}`
  );

  void connectDatabase();
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} is already in use.`);
  } else {
    console.error("❌ Server startup error:", error.message);
  }

  process.exit(1);
});
