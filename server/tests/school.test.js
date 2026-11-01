import test from "node:test";
import assert from "node:assert/strict";
import School from "../models/School.js";

test("school profile trims saved school and administrator details", async () => {
  const school = new School({ schoolName: " Vidya School ", administratorName: " Ananya Iyer ", administratorTitle: " Principal " });
  await school.validate();
  assert.equal(school.schoolName, "Vidya School");
  assert.equal(school.administratorName, "Ananya Iyer");
  assert.equal(school._id, "school-profile");
});

test("school profile requires school and administrator details", async () => {
  const school = new School({});
  await assert.rejects(school.validate(), (error) => error.name === "ValidationError" && Boolean(error.errors.schoolName));
});
