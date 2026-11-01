import { Router } from "express";
import School from "../models/School.js";

const router = Router();

router.get("/", async (_request, response, next) => {
  try {
    const school = await School.findById("school-profile").lean();
    response.json({ data: school });
  } catch (error) { next(error); }
});

router.patch("/", async (request, response, next) => {
  if (!request.body || typeof request.body !== "object" || Array.isArray(request.body)) {
    return response.status(400).json({ message: "Request body must be a JSON object." });
  }
  const { schoolName, administratorName, administratorTitle, academicYear = "" } = request.body;
  if (![schoolName, administratorName, administratorTitle].every((value) => typeof value === "string" && value.trim()) || typeof academicYear !== "string") {
    return response.status(400).json({ message: "School name, administrator name, and title are required." });
  }
  try {
    const school = await School.findByIdAndUpdate(
      "school-profile",
      { $set: { schoolName, administratorName, administratorTitle, academicYear } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
    );
    response.json({ data: school });
  } catch (error) { next(error); }
});

export default router;
