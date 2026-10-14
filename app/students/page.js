"use client";
import { useEffect, useState } from "react";
import { api } from "../../lib/client";

const EMPTY = { roll: "", name: "", email: "", phone: "", branch: "", semester: "" };

export default function Students() {
  const [students, setStudents] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [q, setQ] = useState("");
  const [msg, setMsg] = useState(null); // {type, text}
  const [busy, setBusy] = useState(false);

  const load = () => api("/api/students").then(setStudents).catch((e) => setMsg({ type: "err", text: e.message }));
  useEffect(() => { load(); }, []);

  const field = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function reset() { setForm(EMPTY); setEditingId(null); }

  async function submit(e) {
    e.preventDefault();
    setMsg(null); setBusy(true);
    try {
      if (editingId) await api(`/api/students/${editingId}`, { method: "PUT", body: JSON.stringify(form) });
      else await api("/api/students", { method: "POST", body: JSON.stringify(form) });
      setMsg({ type: "ok", text: editingId ? "Student updated." : "Student added." });
      reset(); await load();
    } catch (err) { setMsg({ type: "err", text: err.message }); }
    setBusy(false);
  }

  function edit(s) {
    setEditingId(s.id);
    setForm({ roll: s.roll, name: s.name, email: s.email, phone: s.phone, branch: s.branch, semester: s.semester });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function remove(s) {
    if (!confirm(`Delete ${s.name}? Their attendance records will be deleted too.`)) return;
    try { await api(`/api/students/${s.id}`, { method: "DELETE" }); if (editingId === s.id) reset(); await load(); setMsg({ type: "ok", text: "Student deleted." }); }
    catch (err) { setMsg({ type: "err", text: err.message }); }
  }

  const list = (students || []).filter((s) => Object.values(s).join(" ").toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <h1>Students</h1>
      <p className="sub">Add, edit or delete students. Everything is saved in MongoDB.</p>

      <form className="panel" onSubmit={submit}>
        <h2>{editingId ? "Edit student" : "Add student"}</h2>
        <div className="grid">
          <label>Roll number *<input type="text" value={form.roll} onChange={field("roll")} /></label>
          <label>Full name *<input type="text" value={form.name} onChange={field("name")} /></label>
          <label>Email<input type="text" inputMode="email" value={form.email} onChange={field("email")} /></label>
          <label>Phone<input type="text" inputMode="tel" value={form.phone} onChange={field("phone")} /></label>
          <label>Branch<input type="text" value={form.branch} onChange={field("branch")} placeholder="e.g. Information Technology" /></label>
          <label>Semester
            <select value={form.semester} onChange={field("semester")}>
              <option value="">Select</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
        </div>
        <div className="row" style={{ marginTop: 14 }}>
          <button className="btn" type="submit" disabled={busy}>{editingId ? "Save changes" : "Add student"}</button>
          {editingId && <button className="btn ghost" type="button" onClick={reset}>Cancel</button>}
        </div>
      </form>

      {msg && <div className={`msg ${msg.type}`}>{msg.text}</div>}

      <div className="panel">
        <div className="row" style={{ marginBottom: 12, justifyContent: "space-between" }}>
          <h2 style={{ margin: 0 }}>All students {students ? `(${students.length})` : ""}</h2>
          <input type="search" placeholder="Search students" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search students" />
        </div>
        {!students ? <p className="sub">Loading…</p> : list.length === 0 ? (
          <p className="empty">{students.length ? "No student matches your search." : "No students yet. Add one above."}</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Roll no.</th><th>Name</th><th>Contact</th><th>Branch</th><th>Sem</th><th></th></tr></thead>
              <tbody>
                {list.map((s) => (
                  <tr key={s.id}>
                    <td>{s.roll}</td>
                    <td>{s.name}</td>
                    <td>{s.email || "–"}<small>{s.phone}</small></td>
                    <td>{s.branch || "–"}</td>
                    <td>{s.semester || "–"}</td>
                    <td>
                      <div className="actions">
                        <button className="btn ghost small" onClick={() => edit(s)}>Edit</button>
                        <button className="btn danger" onClick={() => remove(s)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
