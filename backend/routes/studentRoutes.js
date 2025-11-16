import express from "express";
import { verifyToken } from "../middleware/auth.js";
import Resource from "../models/Resource.js";
import MockTest from "../models/MockTest.js";
import Question from "../models/Question.js";
import Attempt from "../models/Attempt.js";
import mongoose from "mongoose";
import QuestionQuery from "../models/QuestionQuery.js";

const router = express.Router();

router.use(verifyToken);

// --- Get Resources ---
router.get("/resources", async (req, res) => {
  try {
    const resources = await Resource.find().sort({ createdAt: -1 });
    res.json(resources.map(r => r.toJSON()));
  } catch (err) {
    console.error("Fetch Resources Error:", err);
    res.status(500).json({ message: "Failed to fetch resources", error: err.message });
  }
});

// --- Mock Test Routes ---
router.get("/mock-tests", async (req, res) => {
  try {
    const tests = await MockTest.find()
      // --- UPDATED: Added startDate and endDate ---
      .select('title category duration totalMarks createdAt startDate endDate')
      .sort({ createdAt: -1 });
    res.json(tests.map(t => t.toJSON()));
  } catch (err) {
    console.error("Fetch Mock Tests (Student) Error:", err);
    res.status(500).json({ message: "Failed to fetch mock tests", error: err.message });
  }
});

router.get("/mock-test/:testId/start", async (req, res) => {
  const { testId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(testId)) return res.status(400).json({ message: "Invalid Test ID." });

  try {
    // --- UPDATED: Added startDate and endDate ---
    const mockTest = await MockTest.findById(testId).select('title duration totalMarks startDate endDate');
    if (!mockTest) return res.status(404).json({ message: "Mock Test not found." });

    // --- Check if test is active ---
    const now = new Date();
    if (mockTest.startDate && now < new Date(mockTest.startDate)) {
      return res.status(403).json({ message: `This test is not yet available. It starts on ${new Date(mockTest.startDate).toLocaleString()}` });
    }
    if (mockTest.endDate && now > new Date(mockTest.endDate)) {
      return res.status(403).json({ message: `This test has expired. It ended on ${new Date(mockTest.endDate).toLocaleString()}` });
    }
    // --- End Check ---

    const questions = await Question.find({ mockTest: testId })
      .select('-options.isCorrect'); 

    if (!questions || questions.length === 0) return res.status(404).json({ message: "No questions found for this test." });

    res.json({ test: mockTest.toJSON(), questions: questions.map(q => q.toJSON()) });

  } catch (err) {
    console.error("Start Test Error:", err);
    res.status(500).json({ message: "Failed to start mock test", error: err.message });
  }
});

router.post("/mock-test/:testId/submit", async (req, res) => {
  const { testId } = req.params;
  const studentId = req.user.id;
  const { answers, timeTaken } = req.body; 

  if (!mongoose.Types.ObjectId.isValid(testId)) return res.status(400).json({ message: "Invalid Test ID." });
  if (!Array.isArray(answers)) return res.status(400).json({ message: "Answers must be an array." });

  try {
    const mockTest = await MockTest.findById(testId).populate('questions');
    if (!mockTest) return res.status(404).json({ message: "Mock Test not found." });

    let score = 0;
    const processedAnswers = [];

    for (const submittedAnswer of answers) {
      const question = mockTest.questions.find(q => q.id === submittedAnswer.questionId);
      if (!question) continue; 

      const correctOption = question.options.find(opt => opt.isCorrect);
      const isCorrect = correctOption && correctOption.text === submittedAnswer.selectedOptionText;

      if (isCorrect) {
        score += question.marks || 1;
      }

      processedAnswers.push({
        question: question._id,
        selectedOptionText: submittedAnswer.selectedOptionText,
        isCorrect: isCorrect || false
      });
    }

    const newAttempt = await Attempt.create({
      student: studentId,
      mockTest: testId,
      answers: processedAnswers,
      score: score,
      totalMarks: mockTest.totalMarks,
      timeTaken: timeTaken ? parseInt(timeTaken, 10) : null
    });

    res.status(201).json({
      message: "Test submitted successfully!",
      result: {
        attemptId: newAttempt.id,
        score: newAttempt.score,
        totalMarks: newAttempt.totalMarks
      }
    });

  } catch (err) {
    console.error("Submit Test Error:", err);
    res.status(500).json({ message: "Failed to submit mock test", error: err.message });
  }
});

router.get("/my-attempts", async (req, res) => {
  try {
    const attempts = await Attempt.find({ student: req.user.id })
      .populate('mockTest', 'title category')
      .select('score totalMarks submittedAt mockTest')
      .sort({ submittedAt: -1 });
    res.json(attempts.map(a => a.toJSON()));
  } catch (err) {
    console.error("Fetch Attempts Error:", err);
    res.status(500).json({ message: "Failed to fetch your attempts", error: err.message });
  }
});

router.get("/my-attempt/:attemptId", async (req, res) => {
  const { attemptId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(attemptId)) {
    return res.status(400).json({ message: "Invalid Attempt ID." });
  }
  try {
    const attempt = await Attempt.findOne({ 
        _id: attemptId, 
        student: req.user.id
      })
      // --- UPDATED: Populate new fields ---
      .populate('mockTest', 'title startDate endDate');
      
    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found." });
    }
    res.json({
      id: attempt.id,
      score: attempt.score,
      totalMarks: attempt.totalMarks,
      submittedAt: attempt.submittedAt,
      mockTest: attempt.mockTest
    });
  } catch (err) {
    console.error("Fetch Single Attempt Error:", err);
    res.status(500).json({ message: "Failed to fetch your attempt", error: err.message });
  }
});

router.post("/query-question", async (req, res) => {
    const { questionId, queryText } = req.body;
    if (!mongoose.Types.ObjectId.isValid(questionId)) {
         return res.status(400).json({ message: "Invalid Question ID." });
    }
    if (!queryText || queryText.trim().length === 0) {
         return res.status(400).json({ message: "Query text is required." });
    }

    try {
        const question = await Question.findById(questionId);
        if (!question) {
            return res.status(404).json({ message: "Question not found." });
        }

        const newQuery = await QuestionQuery.create({
            student: req.user.id,
            mockTest: question.mockTest,
            question: questionId,
            queryText: queryText
        });

        res.status(201).json({ message: "Query submitted successfully.", query: newQuery.toJSON() });
    } catch (err) {
         console.error("Submit Query Error:", err);
         res.status(500).json({ message: "Failed to submit query.", error: err.message });
    }
});

export default router;
