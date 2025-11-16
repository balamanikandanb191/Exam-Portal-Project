  import mongoose from "mongoose";

  const examSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { type: String, required: true },
    date: { type: Date, required: true },
    duration: { type: Number, required: true }, // duration in minutes
    marks: { type: Number, required: true },
    created_by: {
      type: mongoose.Schema.Types.ObjectId, // This links to a User
      ref: "User", // 'User' model-a refer pannuthu
      required: true,
    },
  }, { timestamps: true });

  // This transforms _id to id
  examSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString();
      delete returnedObject._id;
      delete returnedObject.__v;
    }
  });

  const Exam = mongoose.model("Exam", examSchema);
  export default Exam;