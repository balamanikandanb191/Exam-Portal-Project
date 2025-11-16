import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  isCorrect: { type: Boolean, required: true, default: false }
});

const questionSchema = new mongoose.Schema({
  mockTest: { type: mongoose.Schema.Types.ObjectId, ref: 'MockTest', required: true },
  questionText: { type: String, required: true },
  options: [optionSchema], 
  questionType: { type: String, enum: ['MCQ'], default: 'MCQ' }, 
  marks: { type: Number, default: 1 }, 
}, { timestamps: true });
questionSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  
  }
});


const Question = mongoose.model("Question", questionSchema);
export default Question;
