// server/src/models/User.js
import { Schema, model } from "mongoose";

// DEMO-ONLY: plain text password fields for  project
const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true },
    password: { type: String, required: true },           // plain text (demo)
    emergencyPassword: { type: String, required: true },  // plain text (demo)
  },
  { timestamps: true }
);

export default model("User", userSchema);
