import { Router } from "express";
import mongoose from "mongoose";
import Student from "../models/Student.js";

const router = Router();
const writableFields = ["firstName", "lastName", "email", "phone", "grade", "section", "status"];
const sortableFields = new Set(["firstName", "lastName", "email", "grade", "section", "status", "enrollmentDate", "createdAt"]);
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function studentInput(body) {
  return Object.fromEntries(writableFields.filter((field) => Object.hasOwn(body, field)).map((field) => [field, body[field]]));
}
function requireObjectBody(request, response, next) {
  if (!request.body || typeof request.body !== "object" || Array.isArray(request.body)) {
    response.status(400).json({ message: "Request body must be a JSON object." });
    return;
  }
  next();
}

router.get("/", async (request, response, next) => {
  try {
    const page = Math.max(1, Number.parseInt(request.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(request.query.limit, 10) || 10));
    const sortBy = sortableFields.has(request.query.sortBy) ? request.query.sortBy : "createdAt";
    const sortOrder = request.query.sortOrder === "asc" ? 1 : -1;
    const filter = {};
    if (["Active", "Inactive"].includes(request.query.status)) filter.status = request.query.status;
    const query = String(request.query.q || "").trim();
    if (query) {
      const regex = new RegExp(escapeRegex(query), "i");
      filter.$or = ["firstName", "lastName", "email", "studentId", "grade", "section"].map((field) => ({ [field]: regex }));
    }
    const [data, total] = await Promise.all([
      Student.find(filter).sort({ [sortBy]: sortOrder, _id: 1 }).skip((page - 1) * limit).limit(limit).lean(),
      Student.countDocuments(filter),
    ]);
    response.json({ data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) { next(error); }
});

router.get("/:id", async (request, response, next) => {
  if (!mongoose.isValidObjectId(request.params.id)) return response.status(400).json({ message: "Invalid student ID." });
  try {
    const student = await Student.findById(request.params.id).lean();
    if (!student) return response.status(404).json({ message: "Student not found." });
    response.json({ data: student });
  } catch (error) { next(error); }
});

router.post("/", requireObjectBody, async (request, response, next) => {
  const input = studentInput(request.body);
  if (["firstName", "lastName", "email", "grade", "section"].some((field) => !Object.hasOwn(input, field))) {
    return response.status(400).json({ message: "First name, last name, email, grade, and section are required." });
  }
  try {
    const student = await Student.create(input);
    response.status(201).json({ data: student });
  } catch (error) { next(error); }
});

router.patch("/:id", requireObjectBody, async (request, response, next) => {
  if (!mongoose.isValidObjectId(request.params.id)) return response.status(400).json({ message: "Invalid student ID." });
  const updates = studentInput(request.body);
  if (!Object.keys(updates).length) return response.status(400).json({ message: "Provide at least one student field to update." });
  try {
    const student = await Student.findByIdAndUpdate(request.params.id, { $set: updates }, { new: true, runValidators: true });
    if (!student) return response.status(404).json({ message: "Student not found." });
    response.json({ data: student });
  } catch (error) { next(error); }
});

router.delete("/:id", async (request, response, next) => {
  if (!mongoose.isValidObjectId(request.params.id)) return response.status(400).json({ message: "Invalid student ID." });
  try {
    const student = await Student.findByIdAndDelete(request.params.id);
    if (!student) return response.status(404).json({ message: "Student not found." });
    response.json({ message: "Student removed." });
  } catch (error) { next(error); }
});
export default router;
