const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const { errorHandler, notFound } = require("./middleware/errorHandler");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ─── Middleware ──────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || "*", // Set CLIENT_URL in production
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());           // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// ─── Routes ─────────────────────────────────────────────────────
app.use("/api/auth", require("./routes/authRoutes"));
app.use('/api/users', require('./routes/userRoutes'));
app.use("/api/posts", require("./routes/postRoutes"));

// Health check route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Social App API is running 🚀",
    version: "1.0.0",
  });
});

// ─── Error Handling ──────────────────────────────────────────────
app.use(notFound);       // 404 handler for undefined routes
app.use(errorHandler);   // Global error handler

// ─── Start Server ────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`);
});