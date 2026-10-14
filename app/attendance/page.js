"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../../lib/client";
import { todayStr } from "../../lib/stats";

const OPTIONS = [["P", "Present"], ["A", "Absent"], ["L", "Leave"]];

export default function Attendance() {
  const [date, setDate] = useState(todayStr());
  const [students, setStudents] = useState(null);
  const [records, setRecords] = useState({});
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { api("/api/students").then(setStudents).catch((e) => setStatus({ type: "err", text: e.message })); }, []);

  useEffect(() => {
    setStatus(null);
    api(`/api/attendance?date=${date}`).then(setRecords).catch((e) => setStatus({ type: "err", text: e.message }));
  }, [date]);

  const set = (id, v) => setRecords((r) => ({ ...r, [id]: v }));
  const markAll = (v) => setRecords(Object.fromEntries(students.map((s) => [s.id, v])));
  const unmarked = students ? students.filter((s) => !records[s.id]).length : 0;

  async function save() {
    if (unmarked) return setStatus({ type: "err", text: `${unmarked} student(s) still unmarked.` });
    setSaving(true);
    try {
      await api("/api/attendance", { method: "PUT", body: JSON.stringify({ date, records }) });
      setStatus({ type: "ok", text: `Attendance saved for ${date}.` });
    } catch (e) { setStatus({ type: "err", text: e.message }); }
    setSaving(false);
  }

  if (!students) return status ? <div className="msg err">{status.text}</div> : <p className="sub">Loading…</p>;

  return (
    <>
      <h1>Take attendance</h1>
      <p className="sub">Pick a date, mark each student, then save. Past dates can be edited.</p>

      {students.length === 0 ? (
        <div className="panel empty">No students to mark. <Link href="/students">Add students</Link> first.</div>
      ) : (
        <div className="panel">
          <div className="row" style={{ marginBottom: 8 }}>
            <label>Date <input type="date" value={date} max={todayStr()} onChange={(e) => e.target.value && setDate(e.target.value)} /></label>
            <button className="btn ghost" onClick={() => markAll("P")}>Mark all present</button>
            <button className="btn ghost" onClick={() => setRecords({})}>Clear</button>
          </div>

          {status && <div className={`msg ${status.type}`}>{status.text}</div>}

          {students.map((s) => (
            <div className="mark" key={s.id}>
              <div><b>{s.name}</b><small>Roll {s.roll}{s.branch ? ` · ${s.branch}` : ""}</small></div>
              <div className="seg" role="group" aria-label={`Attendance for ${s.name}`}>
                {OPTIONS.map(([k, label]) => (
                  <button key={k} type="button" className={`${k} ${records[s.id] === k ? "on" : ""}`} aria-pressed={records[s.id] === k} onClick={() => set(s.id, k)}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="row" style={{ marginTop: 16, justifyContent: "space-between" }}>
            <span className="sub" style={{ margin: 0 }}>{unmarked ? `${unmarked} unmarked` : "All students marked"}</span>
            <button className="btn" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save attendance"}</button>
          </div>
        </div>
      )}
    </>
  );
}
