import mongoose from "mongoose";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const dbConnect = async () => {
  const MONGODB_URL = process.env.MONGODB_URL || process.env.MONGODB_URI;
  const DB_NAME = process.env.DB_NAME || "musify";

  if (!MONGODB_URL) {
    console.warn("MONGODB_URL environment variable is not defined");
    return null;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      dbName: DB_NAME,
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose
      .connect(MONGODB_URL, opts)
      .then((mongooseInstance) => {
        console.log("Connected to MongoDB successfully");
        return mongooseInstance;
      })
      .catch((err) => {
        console.error("MongoDB connection failed:", err.message);
        cached.promise = null;
        return null;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    return null;
  }

  return cached.conn;
};

export default dbConnect;
