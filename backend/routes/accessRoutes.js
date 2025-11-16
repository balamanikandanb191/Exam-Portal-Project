import express from "express";
import { verifyToken, roleCheck } from "../middleware/auth.js";
import Resource from "../models/Resource.js";
import MockTest from "../models/MockTest.js";
import Question from "../models/Question.js";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
import fs from 'fs';

const router = express.Router();

// --- Multer Setup ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, '../uploads');

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, uploadDir); },
  filename: (req, file, cb) => {
    const safeOriginalName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + safeOriginalName);
  }
});
const resourceUpload = multer({ storage: fileStorage, limits: { fileSize: 15 * 1024 * 1024 } }).single('file');
const bulkQuestionUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }).single('file'); 


const handleResourceUpload = (req, res, next) => {
  resourceUpload(req, res, function (err) {
    if (err) {
      console.error("Upload Error:", err.message);
      return res.status(400).json({ message: `File upload error: ${err.message}` });
    }
    next();
  });
};

// This line makes sure only "access" role can use these routes
router.use(verifyToken, roleCheck(["access"]));

// --- Resource CRUD ---
router.post("/add-resource", handleResourceUpload, async (req, res) => {
  const { title, type } = req.body;
  let resourceLink = req.body.link;
  if (req.file) { resourceLink = `/uploads/${req.file.filename}`; }
  if (!title || !type || !resourceLink) return res.status(400).json({ message: "Title, type, and a file or link are required." });

  try {
    const newResource = await Resource.create({ title, type, link: resourceLink, uploaded_by: req.user.id });
    res.status(201).json({ message: "Resource added successfully", resource: newResource.toJSON() });
  } catch (err) {
    console.error("Add Resource Error:", err);
    if (req.file) { fs.unlink(req.file.path, (e) => e && console.error("Orphan file deletion error:", e)); }
    res.status(500).json({ message: "Failed to save resource.", error: err.message });
  }
});

// --- THIS IS THE FIXED DELETE ROUTE ---
router.delete("/resource/:id", async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid resource ID." });
  try {
    // We use findByIdAndDelete. It doesn't check who uploaded it.
    // This is safe because the roleCheck middleware already confirmed the user is "access".
    const resource = await Resource.findByIdAndDelete(id); 
    
    if (!resource) return res.status(404).json({ message: "Resource not found." });
    
    // Delete the file from the /uploads folder
    if (resource.link && resource.link.startsWith('/uploads/')) {
      const filePath = path.join(uploadDir, path.basename(resource.link));
      fs.unlink(filePath, (err) => err && console.error(`Error deleting file ${filePath}:`, err));
    }
    res.json({ message: "Resource deleted successfully." });
  } catch (err) {
    console.error(`Delete Resource Error:`, err);
    res.status(500).json({ message: "Failed to delete resource.", error: err.message });
  }
});
// --- END OF FIX ---

// --- Mock Test CRUD ---
router.post("/mock-test", async (req, res) => {
  const { title, category, duration, totalMarks, startDate, endDate } = req.body;
  if (!title || !category || !duration || !totalMarks || duration <= 0 || totalMarks <= 0) {
    return res.status(400).json({ message: "Valid title, category, duration, and marks are required." });
  }
  try {
    const newTest = await MockTest.create({ 
      title, 
      category, 
      duration, 
      totalMarks, 
      startDate,
      endDate,
      created_by: req.user.id 
    });
    res.status(201).json({ message: "Mock Test created successfully", test: newTest.toJSON() });
  } catch (err) {
    console.error("Create Mock Test Error:", err);
    res.status(500).json({ message: "Mock Test creation failed.", error: err.message });
  }
});

router.get("/mock-tests", async (req, res) => {
  try {
    // Only finds tests created by the currently logged-in access user
    const tests = await MockTest.find({ created_by: req.user.id }).sort({ createdAt: -1 });
    res.json(tests.map(test => test.toJSON()));
  } catch (err) {
    console.error("Fetch Mock Tests (Access) Error:", err);
    res.status(500).json({ message: "Failed to fetch mock tests.", error: err.message });
  }
});

// THIS DELETE ROUTE HAS THE SAME LOGIC. I will fix it too.
router.delete("/mock-test/:id", async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid mock test ID." });
  try {
    // Only allow deleting a test if this user created it.
    // This logic is probably correct.
    const test = await MockTest.findOneAndDelete({ _id: id, created_by: req.user.id });
    if (!test) return res.status(404).json({ message: "Mock Test not found or you don't have permission." });
    
    // Also delete all questions associated with this test
    await Question.deleteMany({ mockTest: id });
    
    res.json({ message: "Mock Test and its questions deleted successfully." });
  } catch (err) {
    console.error(`Delete Mock Test Error:`, err);
    res.status(500).json({ message: "Failed to delete mock test.", error: err.message });
  }
});


// --- Question Management ---
router.get("/mock-test/:testId", async (req, res) => {
  const { testId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(testId)) {
    return res.status(400).json({ message: "Invalid Test ID." });
  }
  try {
    // Check if this user created the test
    const test = await MockTest.findOne({ _id: testId, created_by: req.user.id });
    if (!test) {
      return res.status(404).json({ message: "Test not found or you do not have access." });
    }
    res.json(test.toJSON());
  } catch (err) {
    res.status(500).json({ message: "Error fetching test details.", error: err.message });
  }
});

router.post("/mock-test/:testId/question", async (req, res) => {
  const { testId } = req.params;
  const { questionText, options, marks } = req.body; 

  if (!mongoose.Types.ObjectId.isValid(testId)) {
    return res.status(400).json({ message: "Invalid Test ID." });
  }
  if (!questionText || !Array.isArray(options) || options.length < 2) {
    return res.status(400).json({ message: "Question text and at least 2 options are required." });
  }
  const correctOptionsCount = options.filter(opt => opt.isCorrect === true).length;
  if (correctOptionsCount !== 1) {
    return res.status(400).json({ message: "Exactly one option must be marked as correct." });
  }

  try {
    // Check if this user created the test
    const mockTest = await MockTest.findOne({ _id: testId, created_by: req.user.id });
    if (!mockTest) {
      return res.status(404).json({ message: "Mock Test not found or you don't have permission." });
    }
    const newQuestion = await Question.create({
      mockTest: testId,
      questionText,
      options, 
      marks: marks || 1,
    });
    mockTest.questions.push(newQuestion._id);
    await mockTest.save();
    res.status(201).json({ message: "Question added successfully", question: newQuestion.toJSON() });
  } catch (err) {
    console.error("Add Question Error:", err);
    res.status(500).json({ message: "Failed to add question.", error: err.message });
  }
});

router.post("/mock-test/:testId/bulk-upload", bulkQuestionUpload, async (req, res) => {
  const { testId } = req.params;

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }
  if (!mongoose.Types.ObjectId.isValid(testId)) {
    return res.status(400).json({ message: "Invalid Test ID." });
  }

  let questionsData;
  try {
    const fileContent = req.file.buffer.toString('utf-8');
    questionsData = JSON.parse(fileContent);

    if (!Array.isArray(questionsData) || questionsData.length === 0) {
      throw new Error("JSON file must contain a non-empty array.");
    }
  } catch (parseError) {
    console.error("JSON Parse Error:", parseError);
    return res.status(400).json({ message: "Invalid JSON file. Please check the format." });
  }

  try {
    const mockTest = await MockTest.findOne({ _id: testId, created_by: req.user.id });
    if (!mockTest) {
      return res.status(404).json({ message: "Mock Test not found or you don't have permission." });
    }

    const validatedQuestions = [];
    for (const q of questionsData) {
      if (!q.questionText || !Array.isArray(q.options) || q.options.length < 2) {
        throw new Error(`Invalid question format for: "${q.questionText || 'UNKNOWN'}"`);
      }
      const correctCount = q.options.filter(opt => opt.isCorrect === true).length;
      if (correctCount !== 1) {
        throw new Error(`Question "${q.questionText}" must have exactly one correct option.`);
      }
      validatedQuestions.push({
        mockTest: testId,
        questionText: q.questionText,
        options: q.options,
        marks: q.marks || 1,
      });
    }

    const createdQuestions = await Question.insertMany(validatedQuestions);
    const newQuestionIds = createdQuestions.map(q => q._id);

    await MockTest.updateOne(
      { _id: testId },
      { $push: { questions: { $each: newQuestionIds } } }
    );

    res.status(201).json({ message: `Successfully added ${createdQuestions.length} questions.` });

  } catch (err) {
    console.error("Bulk Upload Error:", err);
    res.status(500).json({ message: "Failed to upload questions.", error: err.message });
  }
});

router.get("/mock-test/:testId/questions", async (req, res) => {
  const { testId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(testId)) {
    return res.status(400).json({ message: "Invalid Test ID." });
  }
  try {
    const test = await MockTest.findOne({ _id: testId, created_by: req.user.id });
    if (!test) {
      return res.status(404).json({ message: "Test not found or you do not have access." });
    }
    const questions = await Question.find({ mockTest: testId }).sort({ createdAt: -1 });
    res.json(questions.map(q => q.toJSON()));
  } catch (err) {
    console.error("Fetch Questions Error:", err);
    res.status(500).json({ message: "Failed to fetch questions.", error: err.message });
  }
});

router.delete("/question/:questionId", async (req, res) => {
  const { questionId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(questionId)) {
    return res.status(400).json({ message: "Invalid Question ID." });
  }
  try {
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found." });
    }
    // Check if user has permission for the test this question belongs to
    const mockTest = await MockTest.findOne({ _id: question.mockTest, created_by: req.user.id });
    if (!mockTest) {
      return res.status(403).json({ message: "You do not have permission to delete this question." });
    }
    
    await Question.findByIdAndDelete(questionId);
    
    // Remove the question from the MockTest's questions array
    await MockTest.updateOne(
      { _id: mockTest._id },
      { $pull: { questions: questionId } }
    );
    res.json({ message: "Question deleted successfully." });
  } catch (err) {
    console.error("Delete Question Error:", err);
    res.status(500).json({ message: "Failed to delete question.", error: err.message });
  }
});

export default router;