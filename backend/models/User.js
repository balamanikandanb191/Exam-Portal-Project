import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false }, // Hide password by default
  role: { type: String, required: true, enum: ["student", "admin", "access"], default: "student" },
}, { timestamps: true });

// Convert _id to id and remove password when converting to JSON
userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.password; // Ensure password is never sent
  }
});

const User = mongoose.model("User", userSchema);
export default User;
