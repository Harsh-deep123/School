import cors from 'cors';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import {
  db,
  getBootstrap,
  getSessions,
  mapFaculty,
  mapInvoice,
  mapMilestone,
  mapStudent,
  mapDivision,
} from './db.ts';

dotenv.config();

const app = express();
const PORT = Number(process.env.API_PORT || 3001);
const SUPER_ADMIN_USER = process.env.SUPER_ADMIN_USER || 'superadmin';
const SUPER_ADMIN_PASS = process.env.SUPER_ADMIN_PASS || 'ait@admin';
const SUPER_ADMIN_TOKEN =
  process.env.SUPER_ADMIN_TOKEN || 'ait-super-admin-token';

app.use(cors());
app.use(express.json());

function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (token !== SUPER_ADMIN_TOKEN) {
    res.status(401).json({ error: 'Super Admin login required.' });
    return;
  }
  next();
}

app.get('/', (_req, res) => {
  res.type('html').send(`
    <!doctype html>
    <html><body style="font-family:sans-serif;padding:2rem">
      <h1>AIT College ERP API</h1>
      <p>API is running on port ${PORT}. Open the app UI at
      <a href="http://localhost:3000">http://localhost:3000</a>.</p>
      <p>Try <a href="/api/health">/api/health</a> or
      <a href="/api/bootstrap">/api/bootstrap</a>.</p>
    </body></html>
  `);
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, database: 'sqlite', file: 'data/school.db' });
});

app.get('/api/bootstrap', (_req, res) => {
  res.json(getBootstrap());
});

app.post('/api/students', (req, res) => {
  const {
    name,
    email,
    phone = '',
    division,
    program,
    cohort,
    gpa = 0,
    creditsEarned = 0,
    creditsTarget = 180,
    attendanceRate = 100,
    tuitionBalance = 0,
    status = 'Pending',
    advisor,
    feeAmount = 0,
  } = req.body ?? {};

  if (!name || !email || !division || !program || !cohort || !advisor) {
    res.status(400).json({ error: 'Missing required student fields.' });
    return;
  }

  const countRow = db
    .prepare('SELECT COUNT(*) AS count FROM students')
    .get() as { count: number };
  const deptCode =
    String(division).includes('Computer')
      ? 'CSE'
      : String(division).includes('Electronics')
        ? 'ECE'
        : String(division).includes('Mechanical')
          ? 'ME'
          : 'MBA';
  const studentId = `AIT/2025/${deptCode}/${String(465 + countRow.count).padStart(4, '0')}`;

  const invoiceCount = db
    .prepare('SELECT COUNT(*) AS count FROM invoices')
    .get() as { count: number };
  const invoiceId = `FEE/2025/${8850 + invoiceCount.count}`;

  const amount = Number(feeAmount) || Number(tuitionBalance) || 0;

  db.exec('BEGIN');
  try {
    db.prepare(
      `INSERT INTO students (
         id, name, email, phone, division, program, cohort, gpa,
         credits_earned, credits_target, attendance_rate,
         tuition_balance, status, advisor
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      studentId,
      name,
      email,
      String(phone).trim(),
      division,
      program,
      cohort,
      Number(gpa),
      Number(creditsEarned),
      Number(creditsTarget),
      Number(attendanceRate),
      amount,
      status,
      advisor,
    );

    db.prepare(
      `INSERT INTO invoices (
         id, student_id, student_name, division, term,
         description, due_date, amount, status
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      invoiceId,
      studentId,
      name,
      division,
      'Odd Sem 2025–26',
      `${program} · Admission / Semester Fee`,
      '2025-12-01',
      amount,
      amount === 0 ? 'Paid' : 'Pending',
    );

    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    res.status(500).json({ error: 'Failed to create admission.', detail: String(error) });
    return;
  }

  const student = mapStudent(
    db.prepare('SELECT * FROM students WHERE id = ?').get(studentId) as Record<
      string,
      unknown
    >,
  );
  const invoice = mapInvoice(
    db.prepare('SELECT * FROM invoices WHERE id = ?').get(invoiceId) as Record<
      string,
      unknown
    >,
  );

  res.status(201).json({ student, invoice });
});

app.patch('/api/students/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body ?? {};

  if (!status) {
    res.status(400).json({ error: 'status is required.' });
    return;
  }

  const result = db
    .prepare('UPDATE students SET status = ? WHERE id = ?')
    .run(status, id);

  if (result.changes === 0) {
    res.status(404).json({ error: 'Student not found.' });
    return;
  }

  res.json(
    mapStudent(
      db.prepare('SELECT * FROM students WHERE id = ?').get(id) as Record<
        string,
        unknown
      >,
    ),
  );
});

app.post('/api/students/:id/clear-balance', (req, res) => {
  const { id } = req.params;

  db.exec('BEGIN');
  try {
    const studentUpdate = db
      .prepare('UPDATE students SET tuition_balance = 0 WHERE id = ?')
      .run(id);

    if (studentUpdate.changes === 0) {
      db.exec('ROLLBACK');
      res.status(404).json({ error: 'Student not found.' });
      return;
    }

    db.prepare(
      `UPDATE invoices SET status = 'Paid' WHERE student_id = ?`,
    ).run(id);

    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    res.status(500).json({ error: 'Failed to clear balance.', detail: String(error) });
    return;
  }

  res.json({
    student: mapStudent(
      db.prepare('SELECT * FROM students WHERE id = ?').get(id) as Record<
        string,
        unknown
      >,
    ),
    invoices: (
      db
        .prepare('SELECT * FROM invoices WHERE student_id = ?')
        .all(id) as Record<string, unknown>[]
    ).map(mapInvoice),
  });
});

app.post('/api/invoices/mark-paid', (req, res) => {
  const ids: string[] = req.body?.ids ?? [];
  if (!Array.isArray(ids) || ids.length === 0) {
    res.status(400).json({ error: 'ids array is required.' });
    return;
  }

  const placeholders = ids.map(() => '?').join(', ');
  const studentRows = db
    .prepare(
      `SELECT DISTINCT student_id FROM invoices WHERE id IN (${placeholders})`,
    )
    .all(...ids) as { student_id: string }[];

  db.exec('BEGIN');
  try {
    db.prepare(
      `UPDATE invoices SET status = 'Paid' WHERE id IN (${placeholders})`,
    ).run(...ids);

    for (const row of studentRows) {
      db.prepare(
        'UPDATE students SET tuition_balance = 0 WHERE id = ?',
      ).run(row.student_id);
    }

    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    res.status(500).json({ error: 'Failed to mark invoices paid.', detail: String(error) });
    return;
  }

  res.json(getBootstrap());
});

app.patch('/api/sessions/:sessionId/attendance', (req, res) => {
  const { sessionId } = req.params;
  const { studentId, status } = req.body ?? {};

  if (!studentId || !status) {
    res.status(400).json({ error: 'studentId and status are required.' });
    return;
  }

  const result = db
    .prepare(
      `UPDATE session_roster
       SET attendance = ?
       WHERE session_id = ? AND student_id = ?`,
    )
    .run(status, sessionId, studentId);

  if (result.changes === 0) {
    res.status(404).json({ error: 'Roster entry not found.' });
    return;
  }

  res.json({ sessions: getSessions() });
});

app.patch('/api/alerts/:id/resolve', (req, res) => {
  const { id } = req.params;
  const result = db
    .prepare('UPDATE alerts SET resolved = 1 WHERE id = ?')
    .run(id);

  if (result.changes === 0) {
    res.status(404).json({ error: 'Alert not found.' });
    return;
  }

  res.json({
    alert: {
      id,
      resolved: true,
    },
  });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body ?? {};
  if (username === SUPER_ADMIN_USER && password === SUPER_ADMIN_PASS) {
    res.json({
      token: SUPER_ADMIN_TOKEN,
      name: 'Super Admin',
      role: 'super_admin',
    });
    return;
  }
  res.status(401).json({ error: 'Invalid Super Admin credentials.' });
});

app.patch('/api/admin/sessions/:id', requireSuperAdmin, (req, res) => {
  const { id } = req.params;
  const {
    code,
    title,
    division,
    instructor,
    room,
    schedule,
    enrolledCount,
    capacity,
  } = req.body ?? {};

  const existing = db.prepare('SELECT * FROM sessions WHERE id = ?').get(id) as
    | Record<string, unknown>
    | undefined;
  if (!existing) {
    res.status(404).json({ error: 'Session not found.' });
    return;
  }

  db.prepare(
    `UPDATE sessions SET
       code = ?, title = ?, division = ?, instructor = ?,
       room = ?, schedule = ?, enrolled_count = ?, capacity = ?
     WHERE id = ?`,
  ).run(
    code ?? existing.code,
    title ?? existing.title,
    division ?? existing.division,
    instructor ?? existing.instructor,
    room ?? existing.room,
    schedule ?? existing.schedule,
    enrolledCount ?? existing.enrolled_count,
    capacity ?? existing.capacity,
    id,
  );

  res.json({ sessions: getSessions() });
});

app.post('/api/admin/sessions', requireSuperAdmin, (req, res) => {
  const {
    code,
    title,
    division,
    instructor,
    room,
    schedule,
    enrolledCount = 0,
    capacity = 60,
  } = req.body ?? {};

  if (!code || !title || !division || !instructor || !room || !schedule) {
    res.status(400).json({ error: 'Missing required session fields.' });
    return;
  }

  const count = (
    db.prepare('SELECT COUNT(*) AS count FROM sessions').get() as {
      count: number;
    }
  ).count;
  const id = `SES-${String(count + 1).padStart(2, '0')}`;

  db.prepare(
    `INSERT INTO sessions (
       id, code, title, division, instructor, room,
       schedule, enrolled_count, capacity
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    id,
    code,
    title,
    division,
    instructor,
    room,
    schedule,
    Number(enrolledCount),
    Number(capacity),
  );

  res.status(201).json({ sessions: getSessions() });
});

app.delete('/api/admin/sessions/:id', requireSuperAdmin, (req, res) => {
  const { id } = req.params;
  db.exec('BEGIN');
  try {
    db.prepare('DELETE FROM session_roster WHERE session_id = ?').run(id);
    const result = db.prepare('DELETE FROM sessions WHERE id = ?').run(id);
    if (result.changes === 0) {
      db.exec('ROLLBACK');
      res.status(404).json({ error: 'Session not found.' });
      return;
    }
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    res.status(500).json({
      error: 'Failed to delete session.',
      detail: String(error),
    });
    return;
  }
  res.json({ sessions: getSessions() });
});

function getAllFaculty() {
  return (
    db.prepare('SELECT * FROM faculty ORDER BY id').all() as Record<
      string,
      unknown
    >[]
  ).map(mapFaculty);
}

app.patch('/api/admin/faculty/:id', requireSuperAdmin, (req, res) => {
  const { id } = req.params;
  const {
    name,
    role,
    division,
    office,
    coursesCount,
    adviseesCount,
    utilizationRate,
  } = req.body ?? {};

  const existing = db.prepare('SELECT * FROM faculty WHERE id = ?').get(id) as
    | Record<string, unknown>
    | undefined;
  if (!existing) {
    res.status(404).json({ error: 'Faculty member not found.' });
    return;
  }

  db.prepare(
    `UPDATE faculty SET
       name = ?, role = ?, division = ?, office = ?,
       courses_count = ?, advisees_count = ?, utilization_rate = ?
     WHERE id = ?`,
  ).run(
    name ?? existing.name,
    role ?? existing.role,
    division ?? existing.division,
    office ?? existing.office,
    coursesCount ?? existing.courses_count,
    adviseesCount ?? existing.advisees_count,
    utilizationRate ?? existing.utilization_rate,
    id,
  );

  res.json({ faculty: getAllFaculty() });
});

app.post('/api/admin/faculty', requireSuperAdmin, (req, res) => {
  const {
    name,
    role,
    division,
    office,
    coursesCount = 0,
    adviseesCount = 0,
    utilizationRate = 0,
  } = req.body ?? {};

  if (!name || !role || !division || !office) {
    res
      .status(400)
      .json({ error: 'name, role, division and office are required.' });
    return;
  }

  const count = (
    db.prepare('SELECT COUNT(*) AS count FROM faculty').get() as {
      count: number;
    }
  ).count;
  const id = `FAC-${String(count + 1).padStart(2, '0')}`;

  db.prepare(
    `INSERT INTO faculty (
       id, name, role, division, office, courses_count,
       advisees_count, utilization_rate, portrait_url
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL)`,
  ).run(
    id,
    name,
    role,
    division,
    office,
    Number(coursesCount),
    Number(adviseesCount),
    Number(utilizationRate),
  );

  res.status(201).json({ faculty: getAllFaculty() });
});

app.delete('/api/admin/faculty/:id', requireSuperAdmin, (req, res) => {
  const { id } = req.params;
  const result = db.prepare('DELETE FROM faculty WHERE id = ?').run(id);
  if (result.changes === 0) {
    res.status(404).json({ error: 'Faculty member not found.' });
    return;
  }
  res.json({ faculty: getAllFaculty() });
});

app.patch('/api/admin/milestones/:id', requireSuperAdmin, (req, res) => {
  const id = Number(req.params.id);
  const { date, title, division, status } = req.body ?? {};

  const existing = db
    .prepare('SELECT * FROM term_milestones WHERE id = ?')
    .get(id) as Record<string, unknown> | undefined;
  if (!existing) {
    res.status(404).json({ error: 'Milestone not found.' });
    return;
  }

  db.prepare(
    `UPDATE term_milestones SET date = ?, title = ?, division = ?, status = ?
     WHERE id = ?`,
  ).run(
    date ?? existing.date,
    title ?? existing.title,
    division ?? existing.division,
    status ?? existing.status,
    id,
  );

  const milestones = (
    db
      .prepare(
        'SELECT id, date, title, division, status FROM term_milestones ORDER BY id',
      )
      .all() as Record<string, unknown>[]
  ).map(mapMilestone);

  res.json({ milestones });
});

app.post('/api/admin/milestones', requireSuperAdmin, (req, res) => {
  const { date, title, division, status = 'Pending' } = req.body ?? {};
  if (!date || !title || !division) {
    res.status(400).json({ error: 'date, title and division are required.' });
    return;
  }

  db.prepare(
    `INSERT INTO term_milestones (date, title, division, status)
     VALUES (?, ?, ?, ?)`,
  ).run(date, title, division, status);

  const milestones = (
    db
      .prepare(
        'SELECT id, date, title, division, status FROM term_milestones ORDER BY id',
      )
      .all() as Record<string, unknown>[]
  ).map(mapMilestone);

  res.status(201).json({ milestones });
});

app.delete('/api/admin/milestones/:id', requireSuperAdmin, (req, res) => {
  const id = Number(req.params.id);
  const result = db.prepare('DELETE FROM term_milestones WHERE id = ?').run(id);
  if (result.changes === 0) {
    res.status(404).json({ error: 'Milestone not found.' });
    return;
  }

  const milestones = (
    db
      .prepare(
        'SELECT id, date, title, division, status FROM term_milestones ORDER BY id',
      )
      .all() as Record<string, unknown>[]
  ).map(mapMilestone);

  res.json({ milestones });
});

app.patch('/api/admin/students/:id', requireSuperAdmin, (req, res) => {
  const { id } = req.params;
  const body = req.body ?? {};

  const existing = db.prepare('SELECT * FROM students WHERE id = ?').get(id) as
    | Record<string, unknown>
    | undefined;
  if (!existing) {
    res.status(404).json({ error: 'Student not found.' });
    return;
  }

  db.prepare(
    `UPDATE students SET
       name = ?, email = ?, phone = ?, division = ?, program = ?, cohort = ?,
       gpa = ?, credits_earned = ?, credits_target = ?, attendance_rate = ?,
       tuition_balance = ?, status = ?, advisor = ?
     WHERE id = ?`,
  ).run(
    body.name ?? existing.name,
    body.email ?? existing.email,
    body.phone ?? existing.phone ?? '',
    body.division ?? existing.division,
    body.program ?? existing.program,
    body.cohort ?? existing.cohort,
    body.gpa ?? existing.gpa,
    body.creditsEarned ?? existing.credits_earned,
    body.creditsTarget ?? existing.credits_target,
    body.attendanceRate ?? existing.attendance_rate,
    body.tuitionBalance ?? existing.tuition_balance,
    body.status ?? existing.status,
    body.advisor ?? existing.advisor,
    id,
  );

  res.json({
    student: mapStudent(
      db.prepare('SELECT * FROM students WHERE id = ?').get(id) as Record<
        string,
        unknown
      >,
    ),
  });
});

app.patch('/api/admin/divisions/:division', requireSuperAdmin, (req, res) => {
  const division = decodeURIComponent(req.params.division);
  const {
    enrolled,
    capacity,
    tuitionClearedPct,
    attendancePct,
    grantAllocation,
  } = req.body ?? {};

  const existing = db
    .prepare('SELECT * FROM division_metrics WHERE division = ?')
    .get(division) as Record<string, unknown> | undefined;
  if (!existing) {
    res.status(404).json({ error: 'Department not found.' });
    return;
  }

  db.prepare(
    `UPDATE division_metrics SET
       enrolled = ?, capacity = ?, tuition_cleared_pct = ?,
       attendance_pct = ?, grant_allocation = ?
     WHERE division = ?`,
  ).run(
    enrolled ?? existing.enrolled,
    capacity ?? existing.capacity,
    tuitionClearedPct ?? existing.tuition_cleared_pct,
    attendancePct ?? existing.attendance_pct,
    grantAllocation ?? existing.grant_allocation,
    division,
  );

  const divisions = (
    db.prepare('SELECT * FROM division_metrics').all() as Record<
      string,
      unknown
    >[]
  ).map(mapDivision);

  res.json({ divisions });
});

const server = app.listen(PORT, () => {
  console.log(`College ERP API listening on http://localhost:${PORT}`);
  console.log('SQLite tables ready in data/school.db');
  console.log(
    `Super Admin login: ${SUPER_ADMIN_USER} / ${SUPER_ADMIN_PASS}`,
  );
});

server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.error(
      `Port ${PORT} is already in use. Run: npm run free-ports`,
    );
  } else {
    console.error(error);
  }
  process.exit(1);
});
