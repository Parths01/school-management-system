import test from "node:test";
import assert from "node:assert/strict";
import Student from "../models/Student.js";

test("student schema trims names and normalizes email", async () => {
  const student = new Student({ firstName: " Ananya ", lastName: " Iyer ", email: " ANANYA@EXAMPLE.IN ", grade: " Grade 8 ", section: " A " });
  await student.validate();
  assert.equal(student.firstName, "Ananya");
  assert.equal(student.email, "ananya@example.in");
  assert.match(student.studentId, /^STU-/);
});

test("student schema rejects missing required fields and malformed email", async () => {
  const student = new Student({ firstName: "Ananya", lastName: "Iyer", email: "invalid", grade: "Grade 8", section: "A" });
  await assert.rejects(student.validate(), (error) => error.name === "ValidationError" && Boolean(error.errors.email));
});

test("student schema rejects unsupported enrollment status", async () => {
  const student = new Student({ firstName: "Ananya", lastName: "Iyer", email: "ananya@example.in", grade: "Grade 8", section: "A", status: "Pending" });
  await assert.rejects(student.validate(), (error) => error.name === "ValidationError" && Boolean(error.errors.status));
});
