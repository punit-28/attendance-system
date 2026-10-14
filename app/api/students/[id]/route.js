import { NextResponse } from "next/server";
import { connectDB } from "../../../../lib/mongodb";
import { Student, Attendance } from "../../../../lib/models";
import { fail, pick, ser } from "../../../../lib/api";

export const dynamic = "force-dynamic";

export async function GET(_req, { params }) {
  try {
    await connectDB();
    const s = await Student.findById(params.id).lean();
    if (!s) return NextResponse.json({ error: "Student not found." }, { status: 404 });
    return NextResponse.json(ser(s));
  } catch (e) { return fail(e); }
}

export async function PUT(req, { params }) {
  try {
    await connectDB();
    const s = await Student.findByIdAndUpdate(params.id, pick(await req.json()), { new: true, runValidators: true }).lean();
    if (!s) return NextResponse.json({ error: "Student not found." }, { status: 404 });
    return NextResponse.json(ser(s));
  } catch (e) { return fail(e); }
}

export async function DELETE(_req, { params }) {
  try {
    await connectDB();
    const s = await Student.findByIdAndDelete(params.id);
    if (!s) return NextResponse.json({ error: "Student not found." }, { status: 404 });
    await Attendance.deleteMany({ student: params.id });
    return NextResponse.json({ ok: true });
  } catch (e) { return fail(e); }
}
