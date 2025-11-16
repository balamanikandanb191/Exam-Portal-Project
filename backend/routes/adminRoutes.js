import express from "express";
import { verifyToken, roleCheck } from "../middleware/auth.js";
import MockTest from "../models/MockTest.js"; // Use MockTest model
import User from "../models/User.js";
import Resource from "../models/Resource.js";
import mongoose from "mongoose";

// --- ADDED IMPORTS ---
import QuestionQuery from "../models/QuestionQuery.js";
import Question from "../models/Question.js";
// --- END ---

const router = express.Router();

// Role check middleware for all admin routes
router.use(verifyToken, roleCheck(["admin"]));

// Quick Stats Route
router.get("/stats", async (req, res) => {
  try {
    const studentCount = await User.countDocuments({ role: 'student' });
    const mockTestCount = await MockTest.countDocuments(); // Count Mock Tests
    const resourceCount = await Resource.countDocuments();
    const videoCount = await Resource.countDocuments({ type: 'Video' });

    res.json({
      studentCount,
      mockTestCount, // Changed from examCount
      resourceCount,
      videoCount
    });
  } catch (err) {
    console.error("Error fetching admin stats:", err); // Log error
    res.status(500).json({ message: "Error fetching stats", error: err.message });
  }
});

// Recent Mock Tests Route
router.get("/recent-mock-tests", async (req, res) => {
  try {
    // Fetch latest 5 tests based on creation date
    const tests = await MockTest.find()
                                .sort({ createdAt: -1 }) // Sort by newest first
                                .limit(5)
                                .populate('created_by', 'name'); // Optionally show who created it (name only)

    res.json(tests);
  } catch (err) {
    console.error("Error fetching recent mock tests:", err); // Log error
    res.status(500).json({ message: "Error fetching recent mock tests", error: err.message });
  }
});

// View all students
router.get("/students", async (req, res) => {
  try {
    // Fetch students, sort by newest, exclude password
    const students = await User.find({ role: "student" })
                               .sort({ createdAt: -1 }); // The toJSON transform handles password removal
    res.json(students);
  } catch (err) {
    console.error("Error fetching students:", err); // Log error
    res.status(500).json({ message: "Error fetching students", error: err.message });
  }
});


// --- NEW ROUTE TO GET PENDING QUERIES ---
router.get("/pending-queries", async (req, res) => {
  try {
    const queries = await QuestionQuery.find({ status: 'Pending' })
      .populate('student', 'name email') // Get student details
      .populate('question', 'questionText') // Get question text
      .populate('mockTest', 'title') // Get test title
      .sort({ createdAt: -1 });
    
    res.json(queries.map(q => q.toJSON()));
  } catch (err) {
    console.error("Error fetching pending queries:", err);
    res.status(500).json({ message: "Error fetching queries", error: err.message });
  }
});

// --- NEW ROUTE TO RESOLVE A QUERY ---
router.patch("/resolve-query/:queryId", async (req, res) => {
  const { queryId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(queryId)) {
    return res.status(400).json({ message: "Invalid query ID." });
  }
  try {
    const query = await QuestionQuery.findByIdAndUpdate(
      queryId,
      { status: 'Resolved' }, // Set status to Resolved
      { new: true }
    );
    if (!query) {
      return res.status(404).json({ message: "Query not found." });
    }
    res.json({ message: "Query marked as resolved.", query: query.toJSON() });
  } catch (err) {
    console.error("Error resolving query:", err);
    res.status(500).json({ message: "Failed to resolve query.", error: err.message });
  }
});
// --- END OF NEW ROUTES ---


// --- Performance Analysis Routes (Placeholders) ---

// Placeholder: Get overall performance summary (e.g., average scores per test)
router.get("/performance/summary", async (req, res) => {
  try {
    // TODO: Implement logic using Attempt.aggregate(...)
    console.log("Admin requested performance summary");
    // Example placeholder data:
    const summaryData = [
        { testTitle: "TNPSC Group 4 Mock", averageScore: 75, attempts: 15 },
        { testTitle: "General Aptitude Test 1", averageScore: 60, attempts: 8 },
    ];
    res.json({ message: "Performance summary endpoint - Placeholder Data", data: summaryData });
  } catch(err){
      console.error("Error fetching performance summary:", err);
      res.status(500).json({ message: "Error fetching summary", error: err.message });
  }
});

// Placeholder: Get results (attempts) for a specific test
router.get("/performance/test/:testId", async (req, res) => {
  const { testId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(testId)) { return res.status(400).json({ message: "Invalid test ID" }); }
  try {
    // TODO: Find Attempts for this testId, populate student and test details
    // const attempts = await Attempt.find({ mockTest: testId }).populate('student', 'name email').populate('mockTest', 'title');
    console.log(`Admin requested performance for test: ${testId}`);
    res.json({ message: `Performance for test ${testId} - Not implemented yet`, data: [] /* placeholder */ });
  } catch(err){
      console.error(`Error fetching performance for test ${testId}:`, err);
      res.status(500).json({ message: "Error fetching test performance", error: err.message });
  }
});

// Placeholder: Get performance (attempts) for a specific student
router.get("/performance/student/:studentId", async (req, res) => {
  const { studentId } = req.params;
   if (!mongoose.Types.ObjectId.isValid(studentId)) { return res.status(400).json({ message: "Invalid student ID" }); }
  try {
    // TODO: Find Attempts for this studentId, populate test details
    // const attempts = await Attempt.find({ student: studentId }).populate('mockTest', 'title category');
    console.log(`Admin requested performance for student: ${studentId}`);
    res.json({ message: `Performance for student ${studentId} - Not implemented yet`, data: [] /* placeholder */ });
   } catch(err){
      console.error(`Error fetching performance for student ${studentId}:`, err);
      res.status(500).json({ message: "Error fetching student performance", error: err.message });
  }
});


export default router;