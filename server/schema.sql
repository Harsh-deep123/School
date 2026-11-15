-- Bharatiya Vidya Niketan — School ERP schema (SQLite)

CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  division TEXT NOT NULL,
  program TEXT NOT NULL,
  cohort TEXT NOT NULL,
  gpa REAL NOT NULL DEFAULT 0,
  credits_earned INTEGER NOT NULL DEFAULT 0,
  credits_target INTEGER NOT NULL DEFAULT 180,
  attendance_rate REAL NOT NULL DEFAULT 100,
  tuition_balance REAL NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('Enrolled', 'Pending', 'At-Risk')),
  advisor TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS invoices (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  division TEXT NOT NULL,
  term TEXT NOT NULL,
  description TEXT NOT NULL,
  due_date TEXT NOT NULL,
  amount REAL NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Paid', 'Pending', 'Unpaid')),
  FOREIGN KEY (student_id) REFERENCES students(id)
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  division TEXT NOT NULL,
  instructor TEXT NOT NULL,
  room TEXT NOT NULL,
  schedule TEXT NOT NULL,
  enrolled_count INTEGER NOT NULL,
  capacity INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS session_roster (
  session_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  attendance TEXT NOT NULL CHECK (attendance IN ('Present', 'Leave', 'Absent')),
  PRIMARY KEY (session_id, student_id),
  FOREIGN KEY (session_id) REFERENCES sessions(id),
  FOREIGN KEY (student_id) REFERENCES students(id)
);

CREATE TABLE IF NOT EXISTS alerts (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL CHECK (category IN ('Enrollment', 'Bursar', 'Attendance')),
  title TEXT NOT NULL,
  detail TEXT NOT NULL,
  student_id TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('At-Risk', 'Pending', 'Unpaid')),
  resolved INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (student_id) REFERENCES students(id)
);

CREATE TABLE IF NOT EXISTS faculty (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  division TEXT NOT NULL,
  office TEXT NOT NULL,
  courses_count INTEGER NOT NULL,
  advisees_count INTEGER NOT NULL,
  utilization_rate INTEGER NOT NULL,
  portrait_url TEXT
);

CREATE TABLE IF NOT EXISTS division_metrics (
  division TEXT PRIMARY KEY,
  enrolled INTEGER NOT NULL,
  capacity INTEGER NOT NULL,
  tuition_cleared_pct REAL NOT NULL,
  attendance_pct REAL NOT NULL,
  grant_allocation REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS term_milestones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  title TEXT NOT NULL,
  division TEXT NOT NULL,
  status TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_invoices_student ON invoices(student_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_roster_session ON session_roster(session_id);
CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON alerts(resolved);
