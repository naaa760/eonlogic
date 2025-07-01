const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(morgan("combined"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "EonLogic AI Website Builder API is running",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.get("/api", (req, res) => {
  res.json({
    message: "Welcome to EonLogic AI Website Builder API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      ai: "/api/ai",
      projects: "/api/projects",
      websites: "/api/websites",
      templates: "/api/templates",
      users: "/api/users",
    },
  });
});

// AI Routes
app.get("/api/ai", (req, res) => {
  res.json({
    message: "AI service endpoint",
    available: true,
    features: ["website generation", "content creation", "SEO optimization"],
  });
});

// Projects Routes
app.get("/api/projects", (req, res) => {
  res.json({
    projects: [],
    message: "Projects endpoint ready",
  });
});

// Websites Routes
app.get("/api/websites", (req, res) => {
  res.json({
    websites: [],
    message: "Websites endpoint ready",
  });
});

// Templates Routes
app.get("/api/templates", (req, res) => {
  res.json({
    templates: [
      { id: 1, name: "Business", category: "corporate" },
      { id: 2, name: "Portfolio", category: "creative" },
      { id: 3, name: "E-commerce", category: "shop" },
    ],
    message: "Templates endpoint ready",
  });
});

// Users Routes
app.get("/api/users", (req, res) => {
  res.json({
    message: "Users endpoint ready",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    message: `Cannot ${req.method} ${req.originalUrl}`,
    availableRoutes: [
      "/health",
      "/api",
      "/api/ai",
      "/api/projects",
      "/api/websites",
      "/api/templates",
      "/api/users",
    ],
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Something went wrong",
  });
});

// Start server (only when not on Vercel)
if (process.env.VERCEL !== "1") {
  app.listen(PORT, () => {
    console.log(`🚀 EonLogic API Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  });
}

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  process.exit(0);
});

module.exports = app;
