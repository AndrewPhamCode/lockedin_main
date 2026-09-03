// server/src/models/Task.js
import { Schema, model, Types } from "mongoose";

const taskSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default model("Task", taskSchema);
