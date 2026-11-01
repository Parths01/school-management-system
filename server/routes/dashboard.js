import { Router } from "express";
import Student from "../models/Student.js";

const router = Router();

router.get("/", async (_request, response, next) => {
  try {
    const [totalStudents, activeStudents, classes, recentStudents] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ status: "Active" }),
      Student.aggregate([
        { $group: { _id: { grade: "$grade", section: "$section" }, count: { $sum: 1 } } },
        { $group: { _id: "$_id.grade", students: { $sum: "$count" }, classCount: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Student.find().sort({ enrollmentDate: -1, createdAt: -1 }).limit(4).lean(),
    ]);
    response.json({ data: {
      totalStudents,
      activeStudents,
      classCount: classes.reduce((total, grade) => total + grade.classCount, 0),
      gradeCounts: classes.map(({ _id, students }) => ({ grade: _id, students })),
      recentStudents,
    } });
  } catch (error) { next(error); }
});

export default router;
