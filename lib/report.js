import { Student, Attendance } from "./models";
import { byRoll, ser, dateFilter } from "./api";

export async function getReport(from, to) {
  const match = dateFilter(from, to);
  const count = (s) => ({ $sum: { $cond: [{ $eq: ["$status", s] }, 1, 0] } });
  const [students, agg, dates] = await Promise.all([
    Student.find().lean(),
    Attendance.aggregate([{ $match: match }, { $group: { _id: "$student", p: count("P"), a: count("A"), l: count("L") } }]),
    Attendance.distinct("date", match),
  ]);
  const totals = new Map(agg.map((r) => [String(r._id), r]));
  const rows = students.map((s) => {
    const t = totals.get(String(s._id)) || { p: 0, a: 0, l: 0 };
    const held = t.p + t.a;
    return { ...ser(s), p: t.p, a: t.a, l: t.l, pct: held ? Math.round((t.p / held) * 100) : null };
  });
  rows.sort(byRoll);
  return { students: rows, days: dates.length, dates: dates.sort() };
}
