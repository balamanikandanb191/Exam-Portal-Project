import mongoose from "mongoose";

// **Hardcoded MongoDB Connection String**
const MONGO_URI = "mongodb://localhost:27017/exam_platform";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGO_URI);
    console.log(`✅ MongoDB Connected Successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ FATAL: MongoDB initial connection failed: ${error.message}`);
    console.error("   Please ensure MongoDB server is running at", MONGO_URI);
    process.exit(1);
  }
};

export default connectDB;
