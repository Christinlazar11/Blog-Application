// import mongoose from "mongoose";

// const MONGODB_URI = process.env.MONGODB_URI!;

// if (!MONGODB_URI) {
//   throw new Error("Please define the MONGODB_URI environment variable");
// }

// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// let cached = (global as any).mongoose;

// if (!cached) {
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
//   cached = (global as any).mongoose = { conn: null, promise: null };
// }

// export async function connectDB(): Promise<typeof import("mongoose")> {
//   if (cached.conn) return cached.conn;

//   if (!cached.promise) {
//     cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => mongoose);
//   }
//   cached.conn = await cached.promise;
//   return cached.conn;
// }
import mongoose from "mongoose";

// Import models to ensure they're registered
import User from "@/src/models/User";
import Blog from "@/src/models/Blog";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cached = (global as any).mongoose;

if (!cached) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDB(): Promise<typeof import("mongoose")> {
  if (cached.conn) {
    // Ensure models are registered even if connection exists
    registerModels();
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI).then((mongoose) => {
      // Register models after successful connection
      registerModels();
      return mongoose;
    });
  }
  
  cached.conn = await cached.promise;
  return cached.conn;
}

// Helper function to register models
function registerModels() {
  // Force registration by accessing the models
  // This ensures the imports are executed and models are registered
  if (User && Blog) {
    // Models are already registered through imports
    console.log("Models registered successfully");
  }
}
