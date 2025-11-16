import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
    selectedOptionText: { type: String }, // Store the text of the selected option
    isCorrect: { type: Boolean }
});

const attemptSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  mockTest: { type: mongoose.Schema.Types.ObjectId, ref: 'MockTest', required: true },
  answers: [answerSchema],
  score: { type: Number, required: true, default: 0 },
  totalMarks: { type: Number, required: true }, // Store total marks of the test at time of attempt
  timeTaken: { type: Number }, // Time in seconds
  submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });


// Convert _id to id
attemptSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    // Optionally format dates etc.
  }
});

const Attempt = mongoose.model("Attempt", attemptSchema);
export default Attempt;
