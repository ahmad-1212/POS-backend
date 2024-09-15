import mongoose from "mongoose";
import env from "./env";
/**
 * Function to connect to DB
 */
const connectDB = async (): Promise<void> => {
  try {
    // Replace password placeholder with actual password
    const URL = env.DB_URL.replace("<PASSWORD>", env.DB_PASSWORD);
    // const URL = env.DB_URL;
    await mongoose.connect(URL);
    console.log("DB connected successfully!");
  } catch (err: any) {
    throw new Error(err.message);
  }
};

export default connectDB;
