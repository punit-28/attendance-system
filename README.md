# Roll Call — Attendance System (Next.js + MongoDB)

- Students: full CRUD (roll, name, email, phone, branch, semester) stored in MongoDB
- Attendance: mark Present / Absent / Leave by date, past dates editable
- Reports: per-student totals and %, date-range filter
- Excel export (.xlsx): "Summary" sheet (student details + totals) and "Daily Attendance" sheet (date-wise, colour-coded)

## Setup
1. Install Node 18+ and have a MongoDB ready (local, or free MongoDB Atlas cluster).
2. `cp .env.local.example .env.local` and put your connection string in `MONGODB_URI`.
3. ```bash
   npm install
   npm run dev      # http://localhost:3000
   ```

Atlas: in Network Access, allow your IP, otherwise the connection will time out.
This setup also works on Vercel — just add MONGODB_URI in the project's environment variables.
