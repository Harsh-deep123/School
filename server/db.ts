import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import mysql, {
  Pool,
  PoolConnection,
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2/promise';
import {
  DIVISION_METRICS,
  FACULTY_MEMBERS,
  INITIAL_ALERTS,
  INITIAL_INVOICES,
  INITIAL_SESSIONS,
  INITIAL_STUDENTS,
  TERM_MILESTONES,
} from '../src/data/academicData.ts';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.join(__dirname, 'schema.mysql.sql');

function mysqlConfig() {
  return {
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD ?? '',
    database: process.env.MYSQL_DATABASE || 'ait_college_erp',
  };
}

let pool: Pool | null = null;
let readyPromise: Promise<void> | null = null;

function asRows<T extends RowDataPacket>(rows: unknown): T[] {
  return rows as T[];
}

export async function queryAll<T extends RowDataPacket = RowDataPacket>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  const db = await getPool();
  const [rows] = await db.query(sql, params);
  return asRows<T>(rows);
}

export async function queryOne<T extends RowDataPacket = RowDataPacket>(
  sql: string,
  params: unknown[] = [],
): Promise<T | undefined> {
  const rows = await queryAll<T>(sql, params);
  return rows[0];
}

export async function execute(
  sql: string,
  params: unknown[] = [],
): Promise<ResultSetHeader> {
  const db = await getPool();
  const [result] = await db.execute(sql, params);
  return result as ResultSetHeader;
}

export async function withTransaction<T>(
  fn: (conn: PoolConnection) => Promise<T>,
): Promise<T> {
  const db = await getPool();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const value = await fn(conn);
    await conn.commit();
    return value;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

async function ensureDatabase() {
  const cfg = mysqlConfig();
  const bootstrap = await mysql.createConnection({
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    password: cfg.password,
    multipleStatements: true,
  });
  try {
    await bootstrap.query(
      `CREATE DATABASE IF NOT EXISTS \`${cfg.database}\`
       CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
  } finally {
    await bootstrap.end();
  }
}

async function applySchema(db: Pool) {
  const sql = fs
    .readFileSync(schemaPath, 'utf8')
    .replace(/\r\n/g, '\n')
    // Strip full-line SQL comments before splitting statements
    .replace(/^--.*$/gm, '');

  const statements = sql
    .split(';')
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

  for (const statement of statements) {
    try {
      await db.query(statement);
    } catch (error) {
      const err = error as { code?: string };
      // Indexes / tables may already exist on re-run
      if (
        err.code === 'ER_DUP_KEYNAME' ||
        err.code === 'ER_TABLE_EXISTS_ERROR'
      ) {
        continue;
      }
      throw error;
    }
  }
}

async function seedIfEmpty(db: Pool) {
  const [rows] = await db.query<RowDataPacket[]>(
    'SELECT COUNT(*) AS count FROM students',
  );
  if (Number(rows[0]?.count) > 0) return;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    for (const s of INITIAL_STUDENTS) {
      await conn.execute(
        `INSERT INTO students (
           id, name, email, phone, division, program, cohort, gpa,
           credits_earned, credits_target, attendance_rate,
           tuition_balance, status, advisor
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
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
        ],
      );
    }

    for (const inv of INITIAL_INVOICES) {
      await conn.execute(
        `INSERT INTO invoices (
           id, student_id, student_name, division, term,
           description, due_date, amount, status
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          inv.id,
          inv.studentId,
          inv.studentName,
          inv.division,
          inv.term,
          inv.description,
          inv.dueDate,
          inv.amount,
          inv.status,
        ],
      );
    }

    for (const session of INITIAL_SESSIONS) {
      await conn.execute(
        `INSERT INTO sessions (
           id, code, title, division, instructor, room,
           schedule, enrolled_count, capacity
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          session.id,
          session.code,
          session.title,
          session.division,
          session.instructor,
          session.room,
          session.schedule,
          session.enrolledCount,
          session.capacity,
        ],
      );
      for (const entry of session.roster) {
        await conn.execute(
          `INSERT INTO session_roster (
             session_id, student_id, student_name, attendance
           ) VALUES (?, ?, ?, ?)`,
          [
            session.id,
            entry.studentId,
            entry.studentName,
            entry.attendance,
          ],
        );
      }
    }

    for (const alert of INITIAL_ALERTS) {
      await conn.execute(
        `INSERT INTO alerts (
           id, category, title, detail, student_id,
           timestamp, severity, resolved
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          alert.id,
          alert.category,
          alert.title,
          alert.detail,
          alert.studentId,
          alert.timestamp,
          alert.severity,
          alert.resolved ? 1 : 0,
        ],
      );
    }

    for (const member of FACULTY_MEMBERS) {
      await conn.execute(
        `INSERT INTO faculty (
           id, name, role, division, office, courses_count,
           advisees_count, utilization_rate, portrait_url
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          member.id,
          member.name,
          member.role,
          member.division,
          member.office,
          member.coursesCount,
          member.adviseesCount,
          member.utilizationRate,
          member.portraitUrl ?? null,
        ],
      );
    }

    for (const div of DIVISION_METRICS) {
      await conn.execute(
        `INSERT INTO division_metrics (
           division, enrolled, capacity, tuition_cleared_pct,
           attendance_pct, grant_allocation
         ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          div.division,
          div.enrolled,
          div.capacity,
          div.tuitionClearedPct,
          div.attendancePct,
          div.grantAllocation,
        ],
      );
    }

    for (const milestone of TERM_MILESTONES) {
      await conn.execute(
        `INSERT INTO term_milestones (date, title, division, status)
         VALUES (?, ?, ?, ?)`,
        [
          milestone.date,
          milestone.title,
          milestone.division,
          milestone.status,
        ],
      );
    }

    await conn.commit();
    console.log(`Seeded MySQL database \`${mysqlConfig().database}\``);
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

export async function initDb() {
  if (readyPromise) return readyPromise;
  readyPromise = (async () => {
    const cfg = mysqlConfig();
    await ensureDatabase();
    pool = mysql.createPool({
      host: cfg.host,
      port: cfg.port,
      user: cfg.user,
      password: cfg.password,
      database: cfg.database,
      waitForConnections: true,
      connectionLimit: 10,
      namedPlaceholders: false,
    });
    await applySchema(pool);
    await seedIfEmpty(pool);
    console.log(
      `MySQL ready → ${cfg.user}@${cfg.host}:${cfg.port}/${cfg.database}`,
    );
  })();
  return readyPromise;
}

async function getPool() {
  await initDb();
  if (!pool) throw new Error('MySQL pool not initialized.');
  return pool;
}

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

export async function getSessions() {
  const sessions = await queryAll(
    `SELECT id, code, title, division, instructor, room, schedule,
            enrolled_count, capacity
     FROM sessions
     ORDER BY id`,
  );

  const result = [];
  for (const session of sessions) {
    const roster = await queryAll(
      `SELECT student_id, student_name, attendance
       FROM session_roster
       WHERE session_id = ?
       ORDER BY student_name`,
      [String(session.id)],
    );

    result.push({
      id: String(session.id),
      code: String(session.code),
      title: String(session.title),
      division: String(session.division),
      instructor: String(session.instructor),
      room: String(session.room),
      schedule: String(session.schedule),
      enrolledCount: Number(session.enrolled_count),
      capacity: Number(session.capacity),
      roster: roster.map((entry) => ({
        studentId: String(entry.student_id),
        studentName: String(entry.student_name),
        attendance: String(entry.attendance),
      })),
    });
  }
  return result;
}

export async function getBootstrap() {
  const students = (await queryAll('SELECT * FROM students ORDER BY name')).map(
    mapStudent,
  );
  const invoices = (
    await queryAll('SELECT * FROM invoices ORDER BY due_date')
  ).map(mapInvoice);
  const alerts = (await queryAll('SELECT * FROM alerts ORDER BY id')).map(
    mapAlert,
  );
  const faculty = (await queryAll('SELECT * FROM faculty ORDER BY id')).map(
    mapFaculty,
  );
  const divisions = (await queryAll('SELECT * FROM division_metrics')).map(
    mapDivision,
  );
  const milestones = (
    await queryAll(
      'SELECT id, date, title, division, status FROM term_milestones ORDER BY id',
    )
  ).map(mapMilestone);

  return {
    students,
    invoices,
    sessions: await getSessions(),
    alerts,
    faculty,
    divisions,
    milestones,
  };
}

export function getMysqlConfigSummary() {
  const cfg = mysqlConfig();
  return {
    host: cfg.host,
    port: cfg.port,
    user: cfg.user,
    database: cfg.database,
  };
}
