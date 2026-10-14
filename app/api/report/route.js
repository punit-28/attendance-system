import { NextResponse } from "next/server";
import { connectDB } from "../../../lib/mongodb";
import { getReport } from "../../../lib/report";
import { fail } from "../../../lib/api";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const sp = new URL(req.url).searchParams;
    await connectDB();
    const { students, days } = await getReport(sp.get("from") || "", sp.get("to") || "");
    return NextResponse.json({ students, days });
  } catch (e) { return fail(e); }
}
