"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../lib/client";
import { todayStr, MIN_PERCENT } from "../lib/stats";

export default function Overview() {
  const [data, setData] = useState(null);
  const [today, setToday] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api("/api/report"), api(`/api/attendance?date=${todayStr()}`)])
      .then(([r, t]) => { setData(r); setToday(t); })
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="msg err">{error}</div>;
  if (!data) return <p className="sub">Loading…</p>;

  const { students } = data;
  const marked = Object.keys(today).length > 0;
  const count = (v) => Object.values(today).filter((x) => x === v).length;
  const rated = students.filter((s) => s.pct !== null);
  const avg = rated.length ? Math.round(rated.reduce((n, s) => n + s.pct, 0) / rated.length) : null;
  const atRisk = rated.filter((s) => s.pct < MIN_PERCENT).sort((a, b) => a.pct - b.pct);

  return (
    <>
      <h1>Overview</h1>
      <p className="sub">{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>

      {students.length === 0 ? (
        <div className="panel empty">No students yet. <Link href="/students">Add your first student</Link> to begin.</div>
      ) : (
        <>
          <div className="stats">
            <div className="stat"><b>{students.length}</b><span>Students enrolled</span></div>
            <div className="stat"><b>{marked ? count("P") : "–"}</b><span>Present today</span></div>
            <div className="stat"><b>{marked ? count("A") : "–"}</b><span>Absent today</span></div>
            <div className="stat"><b>{avg === null ? "–" : avg + "%"}</b><span>Class average</span></div>
          </div>

          {!marked && (
            <div className="panel row" style={{ justifyContent: "space-between" }}>
              <span>Attendance for today hasn’t been marked yet.</span>
              <Link href="/attendance" className="btn">Take attendance</Link>
            </div>
          )}

          <div className="panel">
            <h2>Below {MIN_PERCENT}% attendance</h2>
            {atRisk.length === 0 ? (
              <p className="empty" style={{ padding: 8 }}>{rated.length ? "Everyone is at or above the minimum." : "Percentages appear after the first day is marked."}</p>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Roll no.</th><th>Name</th><th className="num">Present</th><th className="num">Absent</th><th className="num">Attendance</th></tr></thead>
                  <tbody>
                    {atRisk.map((s) => (
                      <tr key={s.id}>
                        <td>{s.roll}</td><td>{s.name}</td>
                        <td className="num">{s.p}</td><td className="num">{s.a}</td>
                        <td className="num"><span className="pill low">{s.pct}%</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
