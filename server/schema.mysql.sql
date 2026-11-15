-- AIT College ERP — MySQL schema

CREATE TABLE IF NOT EXISTS students (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(32) NOT NULL DEFAULT '',
  division VARCHAR(128) NOT NULL,
  program VARCHAR(255) NOT NULL,
  cohort VARCHAR(64) NOT NULL,
  gpa DOUBLE NOT NULL DEFAULT 0,
  credits_earned INT NOT NULL DEFAULT 0,
  credits_target INT NOT NULL DEFAULT 180,
  attendance_rate DOUBLE NOT NULL DEFAULT 100,
  tuition_balance DOUBLE NOT NULL DEFAULT 0,
  status VARCHAR(32) NOT NULL,
  advisor VARCHAR(255) NOT NULL,
  CONSTRAINT chk_students_status CHECK (status IN ('Enrolled', 'Pending', 'At-Risk'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS invoices (
  id VARCHAR(64) PRIMARY KEY,
  student_id VARCHAR(64) NOT NULL,
  student_name VARCHAR(255) NOT NULL,
  division VARCHAR(128) NOT NULL,
  term VARCHAR(64) NOT NULL,
  description VARCHAR(512) NOT NULL,
  due_date VARCHAR(32) NOT NULL,
  amount DOUBLE NOT NULL,
  status VARCHAR(32) NOT NULL,
  CONSTRAINT chk_invoices_status CHECK (status IN ('Paid', 'Pending', 'Unpaid')),
  CONSTRAINT fk_invoices_student FOREIGN KEY (student_id) REFERENCES students(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(64) PRIMARY KEY,
  code VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  division VARCHAR(128) NOT NULL,
  instructor VARCHAR(255) NOT NULL,
  room VARCHAR(128) NOT NULL,
  schedule VARCHAR(128) NOT NULL,
  enrolled_count INT NOT NULL,
  capacity INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS session_roster (
  session_id VARCHAR(64) NOT NULL,
  student_id VARCHAR(64) NOT NULL,
  student_name VARCHAR(255) NOT NULL,
  attendance VARCHAR(32) NOT NULL,
  PRIMARY KEY (session_id, student_id),
  CONSTRAINT chk_roster_attendance CHECK (attendance IN ('Present', 'Leave', 'Absent')),
  CONSTRAINT fk_roster_session FOREIGN KEY (session_id) REFERENCES sessions(id),
  CONSTRAINT fk_roster_student FOREIGN KEY (student_id) REFERENCES students(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS alerts (
  id VARCHAR(64) PRIMARY KEY,
  category VARCHAR(32) NOT NULL,
  title VARCHAR(255) NOT NULL,
  detail TEXT NOT NULL,
  student_id VARCHAR(64) NOT NULL,
  timestamp VARCHAR(64) NOT NULL,
  severity VARCHAR(32) NOT NULL,
  resolved TINYINT NOT NULL DEFAULT 0,
  CONSTRAINT chk_alerts_category CHECK (category IN ('Enrollment', 'Bursar', 'Attendance')),
  CONSTRAINT chk_alerts_severity CHECK (severity IN ('At-Risk', 'Pending', 'Unpaid')),
  CONSTRAINT fk_alerts_student FOREIGN KEY (student_id) REFERENCES students(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS faculty (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  division VARCHAR(128) NOT NULL,
  office VARCHAR(255) NOT NULL,
  courses_count INT NOT NULL,
  advisees_count INT NOT NULL,
  utilization_rate INT NOT NULL,
  portrait_url VARCHAR(512) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS division_metrics (
  division VARCHAR(128) PRIMARY KEY,
  enrolled INT NOT NULL,
  capacity INT NOT NULL,
  tuition_cleared_pct DOUBLE NOT NULL,
  attendance_pct DOUBLE NOT NULL,
  grant_allocation DOUBLE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS term_milestones (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  date VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  division VARCHAR(128) NOT NULL,
  status VARCHAR(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_invoices_student ON invoices(student_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_roster_session ON session_roster(session_id);
CREATE INDEX idx_alerts_resolved ON alerts(resolved);
