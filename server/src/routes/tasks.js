// server/src/routes/tasks.js
import { Router } from "express";
import Task from "../models/Task.js";

const r = Router();

/**
 * POST /api/tasks
 * Body: { userId, title }
 * Returns: created task
 */
r.post("/", async (req, res) => {
  try {
    const { userId, title } = req.body || {};
    if (!userId || !title) {
      return res.status(400).json({ error: "missing_userId_or_title" });
    }
    const task = await Task.create({ userId, title });
    res.status(201).json(task);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /api/tasks?userId=<id>
 * Returns: tasks (optionally filtered by userId), newest first
 */
r.get("/", async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = userId ? { userId } : {};
    const items = await Task.find(filter).sort({ createdAt: -1 }).lean();
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * PATCH /api/tasks/:id
 * Body: { title?, completed? }
 * Returns: updated task or 404
 */
r.patch("/:id", async (req, res) => {
  try {
    const { title, completed } = req.body || {};
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (completed !== undefined) updates.completed = completed;

    const t = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    );

    if (!t) return res.status(404).json({ error: "not_found" });
    res.json(t);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * DELETE /api/tasks/:id
 * Returns: { ok: boolean }
 */
r.delete("/:id", async (req, res) => {
  try {
    const deleted = await Task.findByIdAndDelete(req.params.id);
    res.json({ ok: !!deleted });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default r;
