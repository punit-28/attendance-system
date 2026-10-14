import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { connectDB } from "../../../lib/mongodb";
import { Attendance } from "../../../lib/models";
import { getReport } from "../../../lib/report";
import { fail, dateFilter } from "../../../lib/api";
import { MIN_PERCENT } from "../../../lib/stats";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const FILL = {
  P: { argb: "FFDFF3EC" }, A: { argb: "FFFBE4E2" }, L: { argb: "FFFBF0D4" },
};
const HEAD = { type: "pattern", pattern: "solid", fgColor: { argb: "FF14213D" } };

function styleHeader(row) {
  row.font = { bold: true, color: { argb: "FFFFFFFF" } };
  row.alignment = { vertical: "middle", horizontal: "center" };
  row.eachCell((c) => { c.fill = HEAD; });
  row.height = 22;
}

export async function GET(req) {
  try {
    const sp = new URL(req.url).searchParams;
    const from = sp.get("from") || "", to = sp.get("to") || "";
    await connectDB();

    const { students, dates } = await getReport(from, to);
    const records = await Attendance.find(dateFilter(from, to)).lean();
    const lookup = new Map(records.map((r) => [`${r.student}|${r.date}`, r.status]));

    const wb = new ExcelJS.Workbook();
    wb.creator = "Roll Call";

    // Sheet 1: student details + totals
    const ws = wb.addWorksheet("Summary", { views: [{ state: "frozen", ySplit: 1 }] });
    ws.columns = [
      { header: "Roll No.", key: "roll", width: 14 },
      { header: "Name", key: "name", width: 26 },
      { header: "Email", key: "email", width: 28 },
      { header: "Phone", key: "phone", width: 16 },
      { header: "Branch", key: "branch", width: 18 },
      { header: "Semester", key: "semester", width: 11 },
      { header: "Present", key: "p", width: 10 },
      { header: "Absent", key: "a", width: 10 },
      { header: "Leave", key: "l", width: 10 },
      { header: "Attendance %", key: "pct", width: 14 },
    ];
    styleHeader(ws.getRow(1));
    for (const s of students) {
      const row = ws.addRow({ ...s, pct: s.pct === null ? "" : s.pct / 100 });
      row.getCell("pct").numFmt = "0%";
      row.getCell("pct").alignment = { horizontal: "center" };
      if (s.pct !== null && s.pct < MIN_PERCENT) row.getCell("pct").font = { bold: true, color: { argb: "FFC8443B" } };
    }
    ws.autoFilter = { from: "A1", to: "J1" };

    // Sheet 2: date-wise grid
    const dw = wb.addWorksheet("Daily Attendance", { views: [{ state: "frozen", xSplit: 2, ySplit: 1 }] });
    dw.columns = [
      { header: "Roll No.", key: "roll", width: 14 },
      { header: "Name", key: "name", width: 26 },
      ...dates.map((d) => ({ header: d, key: d, width: 12 })),
    ];
    styleHeader(dw.getRow(1));
    for (const s of students) {
      const data = { roll: s.roll, name: s.name };
      for (const d of dates) data[d] = lookup.get(`${s.id}|${d}`) || "";
      const row = dw.addRow(data);
      dates.forEach((d, i) => {
        const cell = row.getCell(i + 3);
        cell.alignment = { horizontal: "center" };
        if (FILL[cell.value]) cell.fill = { type: "pattern", pattern: "solid", fgColor: FILL[cell.value] };
      });
    }
    dw.addRow([]);
    dw.addRow(["P = Present, A = Absent, L = Leave"]).font = { italic: true };

    const buffer = await wb.xlsx.writeBuffer();
    const name = `attendance-report-${new Date().toISOString().slice(0, 10)}.xlsx`;
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${name}"`,
      },
    });
  } catch (e) { return fail(e); }
}
