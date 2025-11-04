// server/src/routes/users.js
import { Router } from "express";
import User from "../models/User.js";

const r = Router();

/**
 * POST /api/users/login
 * Body: { name, email, password, emergencyPassword }
 * If a user with email exists → return it.
 * Otherwise create it and return (201).
 */
r.post("/login", async (req, res) => {
  try {
    const { name, email, password, emergencyPassword } = req.body || {};
    if (!email) return res.status(400).json({ error: "missing_email" });

    const normalized = String(email).toLowerCase().trim();

    let user = await User.findOne({ email: normalized });
    if (!user) {
      user = await User.create({
        name: name || normalized.split("@")[0],
        email: normalized,
        password: password ?? "",
        emergencyPassword: emergencyPassword ?? (password ?? ""),
      });
      return res.status(201).json(user);
    }

    res.json(user);
  } catch (e) {
    // handle unique email race if you later add unique index
    if (e && e.code === 11000) {
      try {
        const existing = await User.findOne({
          email: String(req.body.email).toLowerCase().trim(),
        });
        if (existing) return res.json(existing);
      } catch {}
    }
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /api/users/by-email?email=...
 * NOTE: must be declared BEFORE the /:id route.
 */
r.get("/by-email", async (req, res) => {
  try {
    const { email } = req.query || {};
    if (!email) return res.status(400).json({ error: "missing_email" });
    const u = await User.findOne({ email: String(email).toLowerCase().trim() }).lean();
    if (!u) return res.status(404).json({ error: "not_found" });
    res.json(u);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * POST /api/users
 * Body: { name, email, password, emergencyPassword }
 * Demo-only create
 */
r.post("/", async (req, res) => {
  try {
    const { name, email, password, emergencyPassword } = req.body || {};
    if (!name || !email || !password || !emergencyPassword) {
      return res.status(400).json({ error: "missing_fields" });
    }
    const user = await User.create({
      name,
      email: String(email).toLowerCase().trim(),
      password,
      emergencyPassword,
    });
    res.status(201).json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /api/users
 */
r.get("/", async (_req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).lean();
    res.json(users);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * GET /api/users/:id
 * IMPORTANT: this must come AFTER /by-email or it will catch "by-email" as :id
 */
r.get("/:id", async (req, res) => {
  try {
    const u = await User.findById(req.params.id).lean();
    if (!u) return res.status(404).json({ error: "not_found" });
    res.json(u);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * DELETE /api/users/:email
 * Permanently deletes a user by email
 */
r.delete("/:email", async (req, res) => {
  try {
    const { email } = req.params;
    const deletedUser = await User.findOneAndDelete({
      email: String(email).toLowerCase().trim(),
    });

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default r;
