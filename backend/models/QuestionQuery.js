import mongoose from "mongoose";

const questionQuerySchema = new mongoose.Schema({
  student: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  mockTest: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'MockTest', 
    required: true 
  },
  question: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Question', 
    required: true 
  },
  queryText: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 500 
  },
  status: { 
    type: String, 
    enum: ['Pending', 'Resolved'], 
    default: 'Pending' 
  },
}, { timestamps: true });

// Convert _id to id
questionQuerySchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

const QuestionQuery = mongoose.model("QuestionQuery", questionQuerySchema);
export default QuestionQuery;