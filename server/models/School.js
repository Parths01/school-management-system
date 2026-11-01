import mongoose from "mongoose";

const schoolSchema = new mongoose.Schema(
  {
    _id: { type: String, default: "school-profile" },
    schoolName: { type: String, required: true, trim: true, maxlength: 120 },
    administratorName: { type: String, required: true, trim: true, maxlength: 100 },
    administratorTitle: { type: String, required: true, trim: true, maxlength: 80 },
    academicYear: { type: String, trim: true, maxlength: 30, default: "" },
  },
  { timestamps: true },
);

export default mongoose.model("School", schoolSchema);
