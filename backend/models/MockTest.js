// src/models/MockTest.js

import mongoose from "mongoose";

const mockTestSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true },
    duration: { type: Number, required: true }, // Duration in minutes
    totalMarks: { type: Number, required: true },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }], // Array of Question IDs
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    // --- UPDATED FIELDS FOR DATE/TIME ---
    startDate: { type: Date }, // Optional
    endDate: { type: Date },   // Optional
    // --- END UPDATED FIELDS ---

}, { timestamps: true });

// --- ✅✅✅ சரிசெய்யப்பட்ட பகுதி (THE FIX) ✅✅✅ ---
// இந்த பகுதி உங்கள் ஃபைலில் இல்லை. இது _id-ஐ id-ஆக மாற்றும்.
mockTestSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});
// --- ✅✅✅ சரிசெய்யப்பட்டது முடிந்தது ✅✅✅ ---


const MockTest = mongoose.model("MockTest", mockTestSchema);
export default MockTest;