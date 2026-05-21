const express = require("express");
const cors = require("cors");
require("dotenv").config();
const pool = require("./config/database");

const app = express();
const PORT = process.env.PORT || 5000;

// Trust the first proxy (Vercel/Render/etc.) so req.ip and rate-limit
// keying are based on the real client IP and not the proxy's.
app.set('trust proxy', 1);

// ============================================
// CORS CONFIGURATION
// ============================================
const allowedOrigins = [
  "https://geniuspreptuition.com",
  "https://www.geniuspreptuition.com",
  "https://genius-prep-website.vercel.app",
  "https://genius-prep-tuition.vercel.app",
  "https://www.geniusaccelerator.co.za",
  "https://geniusaccelerator.co.za",
  process.env.FRONTEND_URL,
  "http://localhost:3000",
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require("./routes/authRoutes");
const tutorRoutes = require("./routes/tutorRoutes");
const studentRoutes = require("./routes/studentRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const gpaRoutes = require("./routes/gpaRoutes");
const adminRoutes = require("./routes/adminRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const chatRoutes = require("./routes/chatRoutes");
const adminBookingRoutes = require("./routes/adminBookingRoutes");
const tutorRequestRoutes = require("./routes/tutorRequestRoutes");
const documentRoutes = require("./routes/documentRoutes");

app.get("/", (req, res) => {
  res.json({ message: "Genius Prep API is running!" });
});

app.get("/api/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ message: "Database connected!", time: result.rows[0].now });
  } catch (err) {
    console.error("Database test error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/tutors", tutorRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/gpa", gpaRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/admin", adminBookingRoutes);
app.use("/api/tutor-requests", tutorRequestRoutes);
app.use("/api/documents", documentRoutes);

app.get("/api/test-payment-route", (req, res) => {
  res.json({ message: "Payment routes loaded", version: "1.0.1" });
});

app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`CORS enabled for: ${allowedOrigins.join(", ")}`);
  console.log(`Test database connection: http://localhost:${PORT}/api/test-db`);
});

module.exports = app;
