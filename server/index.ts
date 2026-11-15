import cors from 'cors';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import type { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import {
  execute,
  getBootstrap,
  getMysqlConfigSummary,
  getSessions,
  initDb,
  mapDivision,
  mapFaculty,
  mapInvoice,
  mapMilestone,
  mapStudent,
  queryAll,
  queryOne,
  withTransaction,
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

function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    void fn(req, res, next).catch(next);
  };
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

app.get(
  '/api/health',
  asyncHandler(async (_req, res) => {
    await initDb();
    res.json({
      ok: true,
      database: 'mysql',
      ...getMysqlConfigSummary(),
    });
  }),
);

app.get(
  '/api/bootstrap',
  asyncHandler(async (_req, res) => {
    res.json(await getBootstrap());
  }),
);

app.post(
  '/api/students',
  asyncHandler(async (req, res) => {
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

    const countRow = await queryOne<RowDataPacket>(
      'SELECT COUNT(*) AS count FROM students',
    );
    const deptCode = String(division).includes('Computer')
      ? 'CSE'
      : String(division).includes('Electronics')
        ? 'ECE'
        : String(division).includes('Mechanical')
          ? 'ME'
          : 'MBA';
    const studentId = `AIT/2025/${deptCode}/${String(465 + Number(countRow?.count ?? 0)).padStart(4, '0')}`;

    const invoiceCount = await queryOne<RowDataPacket>(
      'SELECT COUNT(*) AS count FROM invoices',
    );
    const invoiceId = `FEE/2025/${8850 + Number(invoiceCount?.count ?? 0)}`;
    const amount = Number(feeAmount) || Number(tuitionBalance) || 0;

    try {
      await withTransaction(async (conn) => {
        await conn.execute(
          `INSERT INTO students (
             id, name, email, phone, division, program, cohort, gpa,
             credits_earned, credits_target, attendance_rate,
             tuition_balance, status, advisor
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
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
          ],
        );

        await conn.execute(
          `INSERT INTO invoices (
             id, student_id, student_name, division, term,
             description, due_date, amount, status
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            invoiceId,
            studentId,
            name,
            division,
            'Odd Sem 2025–26',
            `${program} · Admission / Semester Fee`,
            '2025-12-01',
            amount,
            amount === 0 ? 'Paid' : 'Pending',
          ],
        );
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to create admission.',
        detail: String(error),
      });
      return;
    }

    const studentRow = await queryOne('SELECT * FROM students WHERE id = ?', [
      studentId,
    ]);
    const invoiceRow = await queryOne('SELECT * FROM invoices WHERE id = ?', [
      invoiceId,
    ]);

    res.status(201).json({
      student: mapStudent(studentRow as Record<string, unknown>),
      invoice: mapInvoice(invoiceRow as Record<string, unknown>),
    });
  }),
);

app.patch(
  '/api/students/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body ?? {};

    if (!status) {
      res.status(400).json({ error: 'status is required.' });
      return;
    }

    const result = await execute(
      'UPDATE students SET status = ? WHERE id = ?',
      [status, id],
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Student not found.' });
      return;
    }

    const row = await queryOne('SELECT * FROM students WHERE id = ?', [id]);
    res.json(mapStudent(row as Record<string, unknown>));
  }),
);

app.post(
  '/api/students/:id/clear-balance',
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    try {
      await withTransaction(async (conn) => {
        const [updateResult] = await conn.execute<ResultSetHeader>(
          'UPDATE students SET tuition_balance = 0 WHERE id = ?',
          [id],
        );
        if (updateResult.affectedRows === 0) {
          throw Object.assign(new Error('Student not found.'), { status: 404 });
        }
        await conn.execute(
          `UPDATE invoices SET status = 'Paid' WHERE student_id = ?`,
          [id],
        );
      });
    } catch (error) {
      const err = error as { status?: number; message?: string };
      if (err.status === 404) {
        res.status(404).json({ error: 'Student not found.' });
        return;
      }
      res.status(500).json({
        error: 'Failed to clear balance.',
        detail: String(error),
      });
      return;
    }

    const student = await queryOne('SELECT * FROM students WHERE id = ?', [id]);
    const invoices = await queryAll(
      'SELECT * FROM invoices WHERE student_id = ?',
      [id],
    );

    res.json({
      student: mapStudent(student as Record<string, unknown>),
      invoices: invoices.map((row) =>
        mapInvoice(row as Record<string, unknown>),
      ),
    });
  }),
);

app.post(
  '/api/invoices/mark-paid',
  asyncHandler(async (req, res) => {
    const ids: string[] = req.body?.ids ?? [];
    if (!Array.isArray(ids) || ids.length === 0) {
      res.status(400).json({ error: 'ids array is required.' });
      return;
    }

    const placeholders = ids.map(() => '?').join(', ');
    const studentRows = await queryAll<{ student_id: string } & RowDataPacket>(
      `SELECT DISTINCT student_id FROM invoices WHERE id IN (${placeholders})`,
      ids,
    );

    try {
      await withTransaction(async (conn: PoolConnection) => {
        await conn.execute(
          `UPDATE invoices SET status = 'Paid' WHERE id IN (${placeholders})`,
          ids,
        );
        for (const row of studentRows) {
          await conn.execute(
            'UPDATE students SET tuition_balance = 0 WHERE id = ?',
            [row.student_id],
          );
        }
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to mark invoices paid.',
        detail: String(error),
      });
      return;
    }

    res.json(await getBootstrap());
  }),
);

app.patch(
  '/api/sessions/:sessionId/attendance',
  asyncHandler(async (req, res) => {
    const { sessionId } = req.params;
    const { studentId, status } = req.body ?? {};

    if (!studentId || !status) {
      res.status(400).json({ error: 'studentId and status are required.' });
      return;
    }

    const result = await execute(
      `UPDATE session_roster
       SET attendance = ?
       WHERE session_id = ? AND student_id = ?`,
      [status, sessionId, studentId],
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Roster entry not found.' });
      return;
    }

    res.json({ sessions: await getSessions() });
  }),
);

app.patch(
  '/api/alerts/:id/resolve',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await execute(
      'UPDATE alerts SET resolved = 1 WHERE id = ?',
      [id],
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Alert not found.' });
      return;
    }

    res.json({ alert: { id, resolved: true } });
  }),
);

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

app.patch(
  '/api/admin/sessions/:id',
  requireSuperAdmin,
  asyncHandler(async (req, res) => {
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

    const existing = await queryOne('SELECT * FROM sessions WHERE id = ?', [id]);
    if (!existing) {
      res.status(404).json({ error: 'Session not found.' });
      return;
    }

    await execute(
      `UPDATE sessions SET
         code = ?, title = ?, division = ?, instructor = ?,
         room = ?, schedule = ?, enrolled_count = ?, capacity = ?
       WHERE id = ?`,
      [
        code ?? existing.code,
        title ?? existing.title,
        division ?? existing.division,
        instructor ?? existing.instructor,
        room ?? existing.room,
        schedule ?? existing.schedule,
        enrolledCount ?? existing.enrolled_count,
        capacity ?? existing.capacity,
        id,
      ],
    );

    res.json({ sessions: await getSessions() });
  }),
);

app.post(
  '/api/admin/sessions',
  requireSuperAdmin,
  asyncHandler(async (req, res) => {
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

    const countRow = await queryOne<RowDataPacket>(
      'SELECT COUNT(*) AS count FROM sessions',
    );
    const id = `SES-${String(Number(countRow?.count ?? 0) + 1).padStart(2, '0')}`;

    await execute(
      `INSERT INTO sessions (
         id, code, title, division, instructor, room,
         schedule, enrolled_count, capacity
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        code,
        title,
        division,
        instructor,
        room,
        schedule,
        Number(enrolledCount),
        Number(capacity),
      ],
    );

    res.status(201).json({ sessions: await getSessions() });
  }),
);

app.delete(
  '/api/admin/sessions/:id',
  requireSuperAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
      await withTransaction(async (conn) => {
        await conn.execute(
          'DELETE FROM session_roster WHERE session_id = ?',
          [id],
        );
        const [result] = await conn.execute<ResultSetHeader>(
          'DELETE FROM sessions WHERE id = ?',
          [id],
        );
        if (result.affectedRows === 0) {
          throw Object.assign(new Error('Session not found.'), { status: 404 });
        }
      });
    } catch (error) {
      const err = error as { status?: number };
      if (err.status === 404) {
        res.status(404).json({ error: 'Session not found.' });
        return;
      }
      res.status(500).json({
        error: 'Failed to delete session.',
        detail: String(error),
      });
      return;
    }

    res.json({ sessions: await getSessions() });
  }),
);

async function getAllFaculty() {
  const rows = await queryAll('SELECT * FROM faculty ORDER BY id');
  return rows.map((row) => mapFaculty(row as Record<string, unknown>));
}

app.patch(
  '/api/admin/faculty/:id',
  requireSuperAdmin,
  asyncHandler(async (req, res) => {
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

    const existing = await queryOne('SELECT * FROM faculty WHERE id = ?', [id]);
    if (!existing) {
      res.status(404).json({ error: 'Faculty member not found.' });
      return;
    }

    await execute(
      `UPDATE faculty SET
         name = ?, role = ?, division = ?, office = ?,
         courses_count = ?, advisees_count = ?, utilization_rate = ?
       WHERE id = ?`,
      [
        name ?? existing.name,
        role ?? existing.role,
        division ?? existing.division,
        office ?? existing.office,
        coursesCount ?? existing.courses_count,
        adviseesCount ?? existing.advisees_count,
        utilizationRate ?? existing.utilization_rate,
        id,
      ],
    );

    res.json({ faculty: await getAllFaculty() });
  }),
);

app.post(
  '/api/admin/faculty',
  requireSuperAdmin,
  asyncHandler(async (req, res) => {
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

    const countRow = await queryOne<RowDataPacket>(
      'SELECT COUNT(*) AS count FROM faculty',
    );
    const id = `FAC-${String(Number(countRow?.count ?? 0) + 1).padStart(2, '0')}`;

    await execute(
      `INSERT INTO faculty (
         id, name, role, division, office, courses_count,
         advisees_count, utilization_rate, portrait_url
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL)`,
      [
        id,
        name,
        role,
        division,
        office,
        Number(coursesCount),
        Number(adviseesCount),
        Number(utilizationRate),
      ],
    );

    res.status(201).json({ faculty: await getAllFaculty() });
  }),
);

app.delete(
  '/api/admin/faculty/:id',
  requireSuperAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await execute('DELETE FROM faculty WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Faculty member not found.' });
      return;
    }
    res.json({ faculty: await getAllFaculty() });
  }),
);

async function getAllMilestones() {
  const rows = await queryAll(
    'SELECT id, date, title, division, status FROM term_milestones ORDER BY id',
  );
  return rows.map((row) => mapMilestone(row as Record<string, unknown>));
}

app.patch(
  '/api/admin/milestones/:id',
  requireSuperAdmin,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const { date, title, division, status } = req.body ?? {};

    const existing = await queryOne(
      'SELECT * FROM term_milestones WHERE id = ?',
      [id],
    );
    if (!existing) {
      res.status(404).json({ error: 'Milestone not found.' });
      return;
    }

    await execute(
      `UPDATE term_milestones SET date = ?, title = ?, division = ?, status = ?
       WHERE id = ?`,
      [
        date ?? existing.date,
        title ?? existing.title,
        division ?? existing.division,
        status ?? existing.status,
        id,
      ],
    );

    res.json({ milestones: await getAllMilestones() });
  }),
);

app.post(
  '/api/admin/milestones',
  requireSuperAdmin,
  asyncHandler(async (req, res) => {
    const { date, title, division, status = 'Pending' } = req.body ?? {};
    if (!date || !title || !division) {
      res.status(400).json({ error: 'date, title and division are required.' });
      return;
    }

    await execute(
      `INSERT INTO term_milestones (date, title, division, status)
       VALUES (?, ?, ?, ?)`,
      [date, title, division, status],
    );

    res.status(201).json({ milestones: await getAllMilestones() });
  }),
);

app.delete(
  '/api/admin/milestones/:id',
  requireSuperAdmin,
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const result = await execute(
      'DELETE FROM term_milestones WHERE id = ?',
      [id],
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ error: 'Milestone not found.' });
      return;
    }
    res.json({ milestones: await getAllMilestones() });
  }),
);

app.patch(
  '/api/admin/students/:id',
  requireSuperAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const body = req.body ?? {};

    const existing = await queryOne('SELECT * FROM students WHERE id = ?', [
      id,
    ]);
    if (!existing) {
      res.status(404).json({ error: 'Student not found.' });
      return;
    }

    await execute(
      `UPDATE students SET
         name = ?, email = ?, phone = ?, division = ?, program = ?, cohort = ?,
         gpa = ?, credits_earned = ?, credits_target = ?, attendance_rate = ?,
         tuition_balance = ?, status = ?, advisor = ?
       WHERE id = ?`,
      [
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
      ],
    );

    const row = await queryOne('SELECT * FROM students WHERE id = ?', [id]);
    res.json({ student: mapStudent(row as Record<string, unknown>) });
  }),
);

app.patch(
  '/api/admin/divisions/:division',
  requireSuperAdmin,
  asyncHandler(async (req, res) => {
    const division = decodeURIComponent(req.params.division);
    const {
      enrolled,
      capacity,
      tuitionClearedPct,
      attendancePct,
      grantAllocation,
    } = req.body ?? {};

    const existing = await queryOne(
      'SELECT * FROM division_metrics WHERE division = ?',
      [division],
    );
    if (!existing) {
      res.status(404).json({ error: 'Department not found.' });
      return;
    }

    await execute(
      `UPDATE division_metrics SET
         enrolled = ?, capacity = ?, tuition_cleared_pct = ?,
         attendance_pct = ?, grant_allocation = ?
       WHERE division = ?`,
      [
        enrolled ?? existing.enrolled,
        capacity ?? existing.capacity,
        tuitionClearedPct ?? existing.tuition_cleared_pct,
        attendancePct ?? existing.attendance_pct,
        grantAllocation ?? existing.grant_allocation,
        division,
      ],
    );

    const divisions = await queryAll('SELECT * FROM division_metrics');
    res.json({
      divisions: divisions.map((row) =>
        mapDivision(row as Record<string, unknown>),
      ),
    });
  }),
);

app.use(
  (
    error: Error,
    _req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    console.error(error);
    res.status(500).json({
      error: 'Server error',
      detail: error.message,
    });
  },
);

async function start() {
  try {
    await initDb();
  } catch (error) {
    console.error('MySQL connection failed.');
    console.error(error);
    console.error(
      'Set MYSQL_HOST, MYSQL_PORT, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE in .env',
    );
    process.exit(1);
  }

  const server = app.listen(PORT, () => {
    console.log(`College ERP API listening on http://localhost:${PORT}`);
    console.log('Database: MySQL', getMysqlConfigSummary());
  });

  server.on('error', (error: NodeJS.ErrnoException) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Run: npm run free-ports`);
    } else {
      console.error(error);
    }
    process.exit(1);
  });
}

void start();
