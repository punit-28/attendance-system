import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import { Student } from "../../../lib/models";
import { fail, pick, ser, byRoll } from "../../../lib/api";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();
    const list = (await Student.find().lean()).map(ser).sort(byRoll);
    return NextResponse.json(list);
  } catch (e) { return fail(e); }
}

export async function POST(req) {
  try {
    await connectDB();
    const student = await Student.create(pick(await req.json()));
    return NextResponse.json(ser(student), { status: 201 });
  } catch (e) { return fail(e); }
}
