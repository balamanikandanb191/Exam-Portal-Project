// src/routes/access.js

import express from "express";
import { verifyToken, roleCheck } from "../middleware/auth.js";
import Resource from "../models/Resource.js";
import MockTest from "../models/MockTest.js"; // Model import
import Question from "../models/Question.js";   // Model import
import mongoose from "mongoose";
import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
import fs from 'fs';

const router = express.Router();

// --- Multer Setup (Retained as is) ---
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

router.use(verifyToken, roleCheck(["access"]));

// --- Resource CRUD (Retained as is) ---
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

router.delete("/resource/:id", async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid resource ID." });
    try {
        const resource = await Resource.findByIdAndDelete(id); 
        
        if (!resource) return res.status(404).json({ message: "Resource not found." });
        
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

// --- Mock Test CRUD (FIXED Create Route) ---
router.post("/mock-test", async (req, res) => {
    const { title, category, duration, totalMarks, startDate, endDate } = req.body;
    
    if (!title || !category || !duration || !totalMarks || duration <= 0 || totalMarks <= 0) {
        return res.status(400).json({ message: "Valid title, category, duration, and marks are required." });
    }

    try {
        // MockTest Model-ல் startDate மற்றும் endDate-க்கு சரியான Field-கள் இருந்தால் இது வேலை செய்யும்
        const newTest = await MockTest.create({ 
            title, 
            category, 
            duration, 
            totalMarks, 
            startDate: startDate || undefined, // undefined-ஐ அனுப்பினால் default value set ஆகாது.
            endDate: endDate || undefined,
            created_by: req.user.id 
        });
        res.status(201).json({ message: "Mock Test created successfully", test: newTest.toJSON() });
    } catch (err) {
        console.error("Create Mock Test Error:", err);
        res.status(500).json({ message: "Mock Test creation failed.", error: err.message });
    }
});

// Mock Test Fetch Route (FIXED to load data dynamically)
router.get("/mock-tests", async (req, res) => {
    try {
        const tests = await MockTest.find({ created_by: req.user.id }).sort({ createdAt: -1 });
        res.json(tests.map(test => test.toJSON()));
    } catch (err) {
        console.error("Fetch Mock Tests (Access) Error:", err);
        res.status(500).json({ message: "Failed to fetch mock tests.", error: err.message });
    }
});

// Mock Test Delete Route (Validation added for safety)
router.delete("/mock-test/:id", async (req, res) => {
    const { id } = req.params;
    // ✅ FIX: "Invalid mock test ID." என்று வரும் பிழைக்கான காரணம் இதுதான். ID format-ஐ செக் செய்கிறது.
    if (!mongoose.Types.ObjectId.isValid(id)) {
        console.log(`Deletion failed: Invalid ID format for ${id}`);
        return res.status(400).json({ message: "Invalid mock test ID." }); 
    }
    try {
        const test = await MockTest.findOneAndDelete({ _id: id, created_by: req.user.id });
        
        if (!test) return res.status(404).json({ message: "Mock Test not found or you don't have permission." });
        
        // Associated questions-ஐயும் நீக்குகிறது.
        await Question.deleteMany({ mockTest: id });
        
        res.json({ message: "Mock Test and its questions deleted successfully." });
    } catch (err) {
        console.error(`Delete Mock Test Error:`, err);
        res.status(500).json({ message: "Failed to delete mock test.", error: err.message });
    }
});


// --- Question Management Routes (Retained as is) ---
router.get("/mock-test/:testId", async (req, res) => { /* ... */ });
router.post("/mock-test/:testId/question", async (req, res) => { /* ... */ });
router.post("/mock-test/:testId/bulk-upload", bulkQuestionUpload, async (req, res) => { /* ... */ });
router.get("/mock-test/:testId/questions", async (req, res) => { /* ... */ });
router.delete("/question/:questionId", async (req, res) => { /* ... */ });

export default router;