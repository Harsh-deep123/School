import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import {
  DIVISION_METRICS,
  FACULTY_MEMBERS,
  INITIAL_ALERTS,
  INITIAL_INVOICES,
  INITIAL_SESSIONS,
  INITIAL_STUDENTS,
  TERM_MILESTONES,
} from '../src/data/academicData.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.resolve(__dirname, '..', 'data');
const dbPath = path.join(dataDir, 'school.db');
const schemaPath = path.join(__dirname, 'schema.sql');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new DatabaseSync(dbPath);

db.exec('PRAGMA foreign_keys = ON;');
db.exec(fs.readFileSync(schemaPath, 'utf8'));

const studentColumns = (
  db.prepare(`PRAGMA table_info(students)`).all() as { name: string }[]
).map((col) => col.name);
if (!studentColumns.includes('phone')) {
  db.exec(`ALTER TABLE students ADD COLUMN phone TEXT NOT NULL DEFAULT ''`);
}

function seedIfEmpty() {
  const row = db.prepare('SELECT COUNT(*) AS count FROM students').get() as {
    count: number;
  };

  if (row.count > 0) return;

  const insertStudent = db.prepare(`
    INSERT INTO students (
      id, name, email, phone, division, program, cohort, gpa,
      credits_earned, credits_target, attendance_rate,
      tuition_balance, status, advisor
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertInvoice = db.prepare(`
    INSERT INTO invoices (
      id, student_id, student_name, division, term,
      description, due_date, amount, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertSession = db.prepare(`
    INSERT INTO sessions (
      id, code, title, division, instructor, room,
      schedule, enrolled_count, capacity
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertRoster = db.prepare(`
    INSERT INTO session_roster (
      session_id, student_id, student_name, attendance
    ) VALUES (?, ?, ?, ?)
  `);

  const insertAlert = db.prepare(`
    INSERT INTO alerts (
      id, category, title, detail, student_id,
      timestamp, severity, resolved
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertFaculty = db.prepare(`
    INSERT INTO faculty (
      id, name, role, division, office, courses_count,
      advisees_count, utilization_rate, portrait_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertDivision = db.prepare(`
    INSERT INTO division_metrics (
      division, enrolled, capacity, tuition_cleared_pct,
      attendance_pct, grant_allocation
    ) VALUES (?, ?, ?, ?, ?, ?)
  `);

  const insertMilestone = db.prepare(`
    INSERT INTO term_milestones (date, title, division, status)
    VALUES (?, ?, ?, ?)
  `);

  db.exec('BEGIN');
  try {
    for (const s of INITIAL_STUDENTS) {
      insertStudent.run(
        s.id,
        s.name,
        s.email,
        s.phone,
        s.division,
        s.program,
        s.cohort,
        s.gpa,
        s.creditsEarned,
        s.creditsTarget,
        s.attendanceRate,
        s.tuitionBalance,
        s.status,
        s.advisor,
      );
    }

    for (const inv of INITIAL_INVOICES) {
      insertInvoice.run(
        inv.id,
        inv.studentId,
        inv.studentName,
        inv.division,
        inv.term,
        inv.description,
        inv.dueDate,
        inv.amount,
        inv.status,
      );
    }

    for (const session of INITIAL_SESSIONS) {
      insertSession.run(
        session.id,
        session.code,
        session.title,
        session.division,
        session.instructor,
        session.room,
        session.schedule,
        session.enrolledCount,
        session.capacity,
      );
      for (const entry of session.roster) {
        insertRoster.run(
          session.id,
          entry.studentId,
          entry.studentName,
          entry.attendance,
        );
      }
    }

    for (const alert of INITIAL_ALERTS) {
      insertAlert.run(
        alert.id,
        alert.category,
        alert.title,
        alert.detail,
        alert.studentId,
        alert.timestamp,
        alert.severity,
        alert.resolved ? 1 : 0,
      );
    }

    for (const member of FACULTY_MEMBERS) {
      insertFaculty.run(
        member.id,
        member.name,
        member.role,
        member.division,
        member.office,
        member.coursesCount,
        member.adviseesCount,
        member.utilizationRate,
        member.portraitUrl ?? null,
      );
    }

    for (const div of DIVISION_METRICS) {
      insertDivision.run(
        div.division,
        div.enrolled,
        div.capacity,
        div.tuitionClearedPct,
        div.attendancePct,
        div.grantAllocation,
      );
    }

    for (const milestone of TERM_MILESTONES) {
      insertMilestone.run(
        milestone.date,
        milestone.title,
        milestone.division,
        milestone.status,
      );
    }

    db.exec('COMMIT');
    console.log(`Seeded SQLite database at ${dbPath}`);
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

seedIfEmpty();

export function mapStudent(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    phone: String(row.phone ?? ''),
    division: String(row.division),
    program: String(row.program),
    cohort: String(row.cohort),
    gpa: Number(row.gpa),
    creditsEarned: Number(row.credits_earned),
    creditsTarget: Number(row.credits_target),
    attendanceRate: Number(row.attendance_rate),
    tuitionBalance: Number(row.tuition_balance),
    status: String(row.status),
    advisor: String(row.advisor),
  };
}

export function mapInvoice(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    studentId: String(row.student_id),
    studentName: String(row.student_name),
    division: String(row.division),
    term: String(row.term),
    description: String(row.description),
    dueDate: String(row.due_date),
    amount: Number(row.amount),
    status: String(row.status),
  };
}

export function mapFaculty(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    name: String(row.name),
    role: String(row.role),
    division: String(row.division),
    office: String(row.office),
    coursesCount: Number(row.courses_count),
    adviseesCount: Number(row.advisees_count),
    utilizationRate: Number(row.utilization_rate),
    portraitUrl: row.portrait_url ? String(row.portrait_url) : undefined,
  };
}

export function mapDivision(row: Record<string, unknown>) {
  return {
    division: String(row.division),
    enrolled: Number(row.enrolled),
    capacity: Number(row.capacity),
    tuitionClearedPct: Number(row.tuition_cleared_pct),
    attendancePct: Number(row.attendance_pct),
    grantAllocation: Number(row.grant_allocation),
  };
}

export function mapMilestone(row: Record<string, unknown>) {
  return {
    id: Number(row.id),
    date: String(row.date),
    title: String(row.title),
    division: String(row.division),
    status: String(row.status),
  };
}

export function mapAlert(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    category: String(row.category),
    title: String(row.title),
    detail: String(row.detail),
    studentId: String(row.student_id),
    timestamp: String(row.timestamp),
    severity: String(row.severity),
    resolved: Number(row.resolved) === 1,
  };
}

export function getSessions() {
  const sessions = db
    .prepare(
      `SELECT id, code, title, division, instructor, room, schedule,
              enrolled_count, capacity
       FROM sessions
       ORDER BY id`,
    )
    .all() as Record<string, unknown>[];

  const rosterStmt = db.prepare(
    `SELECT student_id, student_name, attendance
     FROM session_roster
     WHERE session_id = ?
     ORDER BY student_name`,
  );

  return sessions.map((session) => {
    const roster = (
      rosterStmt.all(String(session.id)) as Record<string, unknown>[]
    ).map((entry) => ({
      studentId: String(entry.student_id),
      studentName: String(entry.student_name),
      attendance: String(entry.attendance),
    }));

    return {
      id: String(session.id),
      code: String(session.code),
      title: String(session.title),
      division: String(session.division),
      instructor: String(session.instructor),
      room: String(session.room),
      schedule: String(session.schedule),
      enrolledCount: Number(session.enrolled_count),
      capacity: Number(session.capacity),
      roster,
    };
  });
}

export function getBootstrap() {
  const students = (
    db.prepare('SELECT * FROM students ORDER BY name').all() as Record<
      string,
      unknown
    >[]
  ).map(mapStudent);

  const invoices = (
    db.prepare('SELECT * FROM invoices ORDER BY due_date').all() as Record<
      string,
      unknown
    >[]
  ).map(mapInvoice);

  const alerts = (
    db.prepare('SELECT * FROM alerts ORDER BY id').all() as Record<
      string,
      unknown
    >[]
  ).map(mapAlert);

  const faculty = (
    db.prepare('SELECT * FROM faculty ORDER BY id').all() as Record<
      string,
      unknown
    >[]
  ).map(mapFaculty);

  const divisions = (
    db.prepare('SELECT * FROM division_metrics').all() as Record<
      string,
      unknown
    >[]
  ).map(mapDivision);

  const milestones = (
    db
      .prepare(
        'SELECT id, date, title, division, status FROM term_milestones ORDER BY id',
      )
      .all() as Record<string, unknown>[]
  ).map(mapMilestone);

  return {
    students,
    invoices,
    sessions: getSessions(),
    alerts,
    faculty,
    divisions,
    milestones,
  };
}
