// server/src/routes/health.js
import { Router } from "express";
import mongoose from "mongoose";

const r = Router();

r.get("/", (_req, res) => {
  const states = ["disconnected", "connected", "connecting", "disconnecting", "unauthorized", "unknown"];
  const dbState = states[mongoose.connection.readyState] || "unknown";
  res.json({ ok: true, db: dbState, now: new Date().toISOString() });
});

export default r;
