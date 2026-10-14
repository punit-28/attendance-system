import { NextResponse } from "next/server";

export const FIELDS = ["roll", "name", "email", "phone", "branch", "semester"];

export function pick(body) {
  const out = {};
  for (const f of FIELDS) if (typeof body?.[f] === "string") out[f] = body[f].trim();
  return out;
}

export const ser = (s) => ({
  id: String(s._id),
  roll: s.roll, name: s.name, email: s.email || "", phone: s.phone || "", branch: s.branch || "", semester: s.semester || "",
});

export const byRoll = (a, b) => a.roll.localeCompare(b.roll, undefined, { numeric: true });

export function fail(e) {
  if (e?.code === 11000) return NextResponse.json({ error: "A student with this roll number already exists." }, { status: 409 });
  if (e?.name === "ValidationError") return NextResponse.json({ error: Object.values(e.errors)[0].message }, { status: 400 });
  if (e?.name === "CastError") return NextResponse.json({ error: "Student not found." }, { status: 404 });
  console.error(e);
  const msg = e?.message?.includes("MONGODB_URI") ? e.message : "Could not reach MongoDB. Check your connection string and that the database is running.";
  return NextResponse.json({ error: msg }, { status: 500 });
}

export function dateFilter(from, to) {
  const match = {};
  if (from || to) {
    match.date = {};
    if (from) match.date.$gte = from;
    if (to) match.date.$lte = to;
  }
  return match;
}
