// server/src/index.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";

import healthRouter from "./routes/health.js";
import usersRouter from "./routes/users.js";
import tasksRouter from "./routes/tasks.js";
import userRoutes from "./routes/users.js";


const app = express();

// CORS — allow your Vite dev server
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/health", healthRouter);
app.use("/api/users", usersRouter);
app.use("/api/tasks", tasksRouter);
app.use("/api/users", userRoutes);

// Start server after DB connects
const PORT = process.env.PORT || 4000;

app.get("/", (req, res) => {
  res.send("Hello from Express!");
}
);

mongoose
  .connect(process.env.MONGO_URI, {
    // you can add options here if needed
  })
  .then(() => {
    console.log("✅ Connected to MongoDB (Atlas)");
    app.listen(PORT, () =>
      console.log(`🚀 API running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ Mongo connect error:", err.message);
    process.exit(1);
  });



