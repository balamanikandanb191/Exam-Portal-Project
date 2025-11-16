import mongoose from "mongoose";

const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  type: { type: String, required: true }, // e.g., 'Video', 'Previous Year Paper', 'PDF'
  link: { type: String, required: true }, // Can be URL or file path like '/uploads/filename.pdf'
  uploaded_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

// Convert _id to id
resourceSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

const Resource = mongoose.model("Resource", resourceSchema);
export default Resource;
