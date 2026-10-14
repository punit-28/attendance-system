"use client";
import { useEffect, useState } from "react";
import { api } from "../../lib/client";
import { MIN_PERCENT } from "../../lib/stats";

export default function Reports() {
  const [data, setData] = useState(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [q, setQ] = useState("");
  const [error, setError] = useState("");

  const qs = new URLSearchParams({ ...(from && { from }), ...(to && { to }) }).toString();

  useEffect(() => {
    api(`/api/report?${qs}`).then((d) => { setData(d); setError(""); }).catch((e) => setError(e.message));
  }, [qs]);

  if (error) return <div className="msg err">{error}</div>;
  if (!data) return <p className="sub">Loading…</p>;

  const rows = data.students.filter((s) => (s.name + s.roll).toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <h1>Reports</h1>
      <p className="sub">{data.days} day{data.days === 1 ? "" : "s"} in this range. Leave days are not counted against the percentage.</p>

      <div className="panel">
        <div className="row" style={{ marginBottom: 12, justifyContent: "space-between" }}>
          <div className="row">
            <label>From <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></label>
            <label>To <input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></label>
            {(from || to) && <button className="btn ghost small" onClick={() => { setFrom(""); setTo(""); }}>All dates</button>}
          </div>
          <a className="btn" href={`/api/export?${qs}`} download>Download Excel</a>
        </div>
        <input type="search" placeholder="Search name or roll number" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search students" style={{ minWidth: 240, marginBottom: 12 }} />

        {rows.length === 0 ? (
          <p className="empty">{data.students.length ? "No student matches your search." : "No students yet."}</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Roll no.</th><th>Name</th><th>Branch</th><th className="num">P</th><th className="num">A</th><th className="num">L</th><th style={{ width: 130 }}>Attendance</th><th className="num"></th></tr>
              </thead>
              <tbody>
                {rows.map((s) => {
                  const low = s.pct !== null && s.pct < MIN_PERCENT;
                  return (
                    <tr key={s.id}>
                      <td>{s.roll}</td><td>{s.name}</td><td>{s.branch || "–"}</td>
                      <td className="num">{s.p}</td><td className="num">{s.a}</td><td className="num">{s.l}</td>
                      <td><div className="bar"><i className={low ? "low" : ""} style={{ width: `${s.pct ?? 0}%` }} /></div></td>
                      <td className="num">{s.pct === null ? <span className="pill none">–</span> : <span className={`pill ${low ? "low" : "ok"}`}>{s.pct}%</span>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
