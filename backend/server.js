// NO dotenv import needed

import express from "express";
import cors from "cors";
import connectDB from "./config/db.js"; // Uses hardcoded URI
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs'; // Import fs for directory check

// Route imports
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import accessRoutes from "./routes/accessRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, 'uploads'); // Define uploadDir globally

// --- Ensure uploads directory exists ---
// Moved directory check here for clarity before server starts fully
if (!fs.existsSync(uploadDir)) {
    try {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log(`✅ Created uploads directory at: ${uploadDir}`);
    } catch (err) {
        console.error(`❌ FATAL: Failed to create uploads directory at ${uploadDir}. File uploads will fail. Error:`, err);
        // process.exit(1); // Exit if uploads dir is critical and cannot be created
    }
} else {
    console.log(`ℹ️ Uploads directory found at: ${uploadDir}`);
}
// ------------------------------------

// Connect to Database
connectDB();

const app = express();

// --- Middleware ---
app.use(cors()); // Enable CORS for all origins
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Serve uploaded files statically
// Make sure this path correctly points to your 'uploads' directory relative to server.js
app.use('/uploads', express.static(uploadDir));
console.log(`ℹ️ Serving static files from /uploads mapped to ${uploadDir}`);


// --- API Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes); // Admin routes (View Only)
app.use("/api/access", accessRoutes); // Access Manager routes (CRUD for Resources & MockTests)
app.use("/api/student", studentRoutes); // Student routes (Get tests, resources, submit etc.)

// --- Basic Root Route ---
app.get('/', (req, res) => {
    res.send('EduPro Backend Server is Running!');
});

// --- Simple Not Found Middleware (Place AFTER all routes) ---
app.use((req, res, next) => {
    // Log unexpected route hits if needed
    // console.warn(`⚠️ 404 - Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
});


// --- Global Error Handling Middleware (Place VERY LAST) ---
app.use((err, req, res, next) => {
  // Log the error with more details
  console.error(`💥 Unhandled Error (${req.method} ${req.originalUrl}):`, err.stack || err.message || err);

  // Send a generic error response
  // Avoid sending stack trace in production for security reasons
  res.status(err.status || 500).json({
      message: err.message || 'An unexpected server error occurred. Please try again later.',
      // Optionally add error code or type in development for easier debugging
      ...(process.env.NODE_ENV === 'development' ? { errorType: err.name /* , stack: err.stack */ } : {})
  });
});


// --- Start Server ---
const PORT = 5000; // Hardcoded Port
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

