import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB... " + process.env.MONGO_URI || 'mongodb://localhost:27017/openjdk_jobs');
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/openjdk_jobs');

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;

