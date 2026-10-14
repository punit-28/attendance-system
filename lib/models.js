import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema(
  {
    roll: { type: String, required: [true, "Roll number is required."], unique: true, trim: true },
    name: { type: String, required: [true, "Name is required."], trim: true },
    email: { type: String, trim: true, lowercase: true, default: "", match: [/^$|^\S+@\S+\.\S+$/, "Enter a valid email address."] },
    phone: { type: String, trim: true, default: "" },
    branch: { type: String, trim: true, default: "" },
    semester: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

const AttendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  status: { type: String, enum: ["P", "A", "L"], required: true },
});
AttendanceSchema.index({ student: 1, date: 1 }, { unique: true });

export const Student = mongoose.models.Student || mongoose.model("Student", StudentSchema);
export const Attendance = mongoose.models.Attendance || mongoose.model("Attendance", AttendanceSchema);
