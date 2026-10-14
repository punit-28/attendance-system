import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import { Attendance } from "../../../lib/models";
import { fail } from "../../../lib/api";

export const dynamic = "force-dynamic";
const DATE = /^\d{4}-\d{2}-\d{2}$/;

// GET /api/attendance?date=YYYY-MM-DD  ->  { [studentId]: "P" | "A" | "L" }
export async function GET(req) {
  try {
    const date = new URL(req.url).searchParams.get("date");
    if (!DATE.test(date || "")) return NextResponse.json({ error: "Invalid date." }, { status: 400 });
    await connectDB();
    const rows = await Attendance.find({ date }).lean();
    return NextResponse.json(Object.fromEntries(rows.map((r) => [String(r.student), r.status])));
  } catch (e) { return fail(e); }
}

// PUT { date, records: { [studentId]: status } }  ->  upserts one record per student for that date
export async function PUT(req) {
  try {
    const { date, records } = await req.json();
    if (!DATE.test(date || "") || !records || typeof records !== "object") {
      return NextResponse.json({ error: "Invalid date or records." }, { status: 400 });
    }
    await connectDB();
    const ops = Object.entries(records)
      .filter(([, status]) => ["P", "A", "L"].includes(status))
      .map(([student, status]) => ({
        updateOne: { filter: { student, date }, update: { $set: { status } }, upsert: true },
      }));
    if (ops.length) await Attendance.bulkWrite(ops);
    return NextResponse.json({ ok: true });
  } catch (e) { return fail(e); }
}
