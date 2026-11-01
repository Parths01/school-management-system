import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      unique: true,
      index: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address."],
    },
    phone: {
      type: String,
      trim: true,
      maxlength: 25,
      default: "",
    },
    grade: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },
    section: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
    enrollmentDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

studentSchema.index({ firstName: 1, lastName: 1 });
studentSchema.index({ grade: 1, section: 1 });
studentSchema.index({ status: 1, createdAt: -1 });

studentSchema.pre("validate", async function assignStudentId() {
  if (!this.studentId && this.isNew) {
    this.studentId = `STU-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 900 + 100)}`;
  }
});

export default mongoose.model("Student", studentSchema);
