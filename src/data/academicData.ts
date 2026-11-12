export type ScreenId = 'overview' | 'students' | 'bursar' | 'faculty' | 'campus';

export type AcademicDivision =
  | 'Applied Engineering'
  | 'Quantitative Economics'
  | 'Natural Sciences'
  | 'Humanities & Law';

export type EnrollmentStatus = 'Enrolled' | 'Pending' | 'At-Risk';
export type InvoiceStatus = 'Paid' | 'Pending' | 'Unpaid';
export type AttendanceStatus = 'Present' | 'Leave' | 'Absent';

export interface StudentRecord {
  id: string;
  name: string;
  email: string;
  division: AcademicDivision;
  program: string;
  cohort: string;
  gpa: number;
  creditsEarned: number;
  creditsTarget: number;
  attendanceRate: number;
  tuitionBalance: number;
  status: EnrollmentStatus;
  advisor: string;
}

export interface BursarInvoice {
  id: string;
  studentId: string;
  studentName: string;
  division: AcademicDivision;
  term: string;
  description: string;
  dueDate: string;
  amount: number;
  status: InvoiceStatus;
}

export interface CourseSession {
  id: string;
  code: string;
  title: string;
  division: AcademicDivision;
  instructor: string;
  room: string;
  schedule: string;
  enrolledCount: number;
  capacity: number;
  roster: {
    studentId: string;
    studentName: string;
    attendance: AttendanceStatus;
  }[];
}

export interface FacultyMember {
  id: string;
  name: string;
  role: string;
  division: AcademicDivision;
  office: string;
  coursesCount: number;
  adviseesCount: number;
  utilizationRate: number;
  portraitUrl?: string;
}

export interface OperationalAlert {
  id: string;
  category: 'Enrollment' | 'Bursar' | 'Attendance';
  title: string;
  detail: string;
  studentId: string;
  timestamp: string;
  severity: 'At-Risk' | 'Pending' | 'Unpaid';
  resolved: boolean;
}

export interface DivisionPerformance {
  division: AcademicDivision;
  enrolled: number;
  capacity: number;
  tuitionClearedPct: number;
  attendancePct: number;
  grantAllocation: number;
}

export const IMAGES = {
  campusHero: '/src/assets/images/campus_hero_architecture_1794515904998.jpg',
  libraryHall: '/src/assets/images/library_research_hall_1794515905811.jpg',
  engineeringLab: '/src/assets/images/engineering_robotics_lab_1794515905831.jpg',
  deanPortrait: '/src/assets/images/faculty_dean_portrait_1794515906361.jpg',
  campusQuad: '/src/assets/images/campus_quad_walkway_1794515906247.jpg',
} as const;

export const INITIAL_STUDENTS: StudentRecord[] = [
  {
    id: 'STU-2026-0412',
    name: 'Clara Hendrickson',
    email: 'c.hendrickson@aldervale.edu',
    division: 'Applied Engineering',
    program: 'B.S. Mechatronics & Robotics',
    cohort: 'Class of 2027',
    gpa: 3.92,
    creditsEarned: 94,
    creditsTarget: 120,
    attendanceRate: 97.4,
    tuitionBalance: 0,
    status: 'Enrolled',
    advisor: 'Dr. Martin Keller',
  },
  {
    id: 'STU-2026-0418',
    name: 'Julian Morales',
    email: 'j.morales@aldervale.edu',
    division: 'Quantitative Economics',
    program: 'B.A. Econometrics & Policy',
    cohort: 'Class of 2028',
    gpa: 3.64,
    creditsEarned: 60,
    creditsTarget: 120,
    attendanceRate: 91.2,
    tuitionBalance: 4250,
    status: 'Pending',
    advisor: 'Prof. Nadia Okafor',
  },
  {
    id: 'STU-2026-0423',
    name: 'Hannah Lindqvist',
    email: 'h.lindqvist@aldervale.edu',
    division: 'Natural Sciences',
    program: 'B.S. Applied Photonics',
    cohort: 'Class of 2027',
    gpa: 3.87,
    creditsEarned: 98,
    creditsTarget: 120,
    attendanceRate: 95.8,
    tuitionBalance: 0,
    status: 'Enrolled',
    advisor: 'Dr. Kenji Takahashi',
  },
  {
    id: 'STU-2026-0431',
    name: 'Devon Mercer',
    email: 'd.mercer@aldervale.edu',
    division: 'Applied Engineering',
    program: 'B.S. Structural Systems',
    cohort: 'Class of 2029',
    gpa: 2.58,
    creditsEarned: 28,
    creditsTarget: 120,
    attendanceRate: 76.5,
    tuitionBalance: 8900,
    status: 'At-Risk',
    advisor: 'Dr. Martin Keller',
  },
  {
    id: 'STU-2026-0439',
    name: 'Priya Subramanian',
    email: 'p.subramanian@aldervale.edu',
    division: 'Humanities & Law',
    program: 'B.A. Constitutional History',
    cohort: 'Class of 2027',
    gpa: 3.95,
    creditsEarned: 102,
    creditsTarget: 120,
    attendanceRate: 98.1,
    tuitionBalance: 0,
    status: 'Enrolled',
    advisor: 'Prof. Eleanor Vance',
  },
  {
    id: 'STU-2026-0445',
    name: 'Lucas Bernstein',
    email: 'l.bernstein@aldervale.edu',
    division: 'Quantitative Economics',
    program: 'M.S. Financial Mathematics',
    cohort: 'Graduate 2027',
    gpa: 3.78,
    creditsEarned: 36,
    creditsTarget: 48,
    attendanceRate: 93.0,
    tuitionBalance: 2400,
    status: 'Pending',
    advisor: 'Prof. Nadia Okafor',
  },
  {
    id: 'STU-2026-0452',
    name: 'Amara Diallo',
    email: 'a.diallo@aldervale.edu',
    division: 'Natural Sciences',
    program: 'B.S. Molecular Biochemistry',
    cohort: 'Class of 2028',
    gpa: 3.81,
    creditsEarned: 64,
    creditsTarget: 120,
    attendanceRate: 96.2,
    tuitionBalance: 0,
    status: 'Enrolled',
    advisor: 'Dr. Kenji Takahashi',
  },
  {
    id: 'STU-2026-0460',
    name: 'Owen Gallagher',
    email: 'o.gallagher@aldervale.edu',
    division: 'Humanities & Law',
    program: 'B.A. Ethics & Public Governance',
    cohort: 'Class of 2028',
    gpa: 2.71,
    creditsEarned: 54,
    creditsTarget: 120,
    attendanceRate: 79.4,
    tuitionBalance: 6150,
    status: 'At-Risk',
    advisor: 'Prof. Eleanor Vance',
  },
];

export const INITIAL_INVOICES: BursarInvoice[] = [
  {
    id: 'INV-2026-8841',
    studentId: 'STU-2026-0412',
    studentName: 'Clara Hendrickson',
    division: 'Applied Engineering',
    term: 'Fall 2026',
    description: 'Full-Time Tuition & Mechatronics Lab Fee',
    dueDate: '2026-09-15',
    amount: 18450,
    status: 'Paid',
  },
  {
    id: 'INV-2026-8842',
    studentId: 'STU-2026-0418',
    studentName: 'Julian Morales',
    division: 'Quantitative Economics',
    term: 'Fall 2026',
    description: 'Fall Installment II & Data Archive Access',
    dueDate: '2026-11-18',
    amount: 4250,
    status: 'Pending',
  },
  {
    id: 'INV-2026-8843',
    studentId: 'STU-2026-0423',
    studentName: 'Hannah Lindqvist',
    division: 'Natural Sciences',
    term: 'Fall 2026',
    description: 'Full-Time Tuition & Photonics Cleanroom Fee',
    dueDate: '2026-09-15',
    amount: 19100,
    status: 'Paid',
  },
  {
    id: 'INV-2026-8844',
    studentId: 'STU-2026-0431',
    studentName: 'Devon Mercer',
    division: 'Applied Engineering',
    term: 'Fall 2026',
    description: 'Term Tuition Balance & Structural Workshop',
    dueDate: '2026-10-30',
    amount: 8900,
    status: 'Unpaid',
  },
  {
    id: 'INV-2026-8845',
    studentId: 'STU-2026-0439',
    studentName: 'Priya Subramanian',
    division: 'Humanities & Law',
    term: 'Fall 2026',
    description: 'Full-Time Tuition & Archival Research Stipend',
    dueDate: '2026-09-15',
    amount: 16800,
    status: 'Paid',
  },
  {
    id: 'INV-2026-8846',
    studentId: 'STU-2026-0445',
    studentName: 'Lucas Bernstein',
    division: 'Quantitative Economics',
    term: 'Fall 2026',
    description: 'Graduate Seminar & Quantitative Terminal Fee',
    dueDate: '2026-11-22',
    amount: 2400,
    status: 'Pending',
  },
  {
    id: 'INV-2026-8847',
    studentId: 'STU-2026-0452',
    studentName: 'Amara Diallo',
    division: 'Natural Sciences',
    term: 'Fall 2026',
    description: 'Full-Time Tuition & Wet Lab Instrumentation',
    dueDate: '2026-09-15',
    amount: 18900,
    status: 'Paid',
  },
  {
    id: 'INV-2026-8848',
    studentId: 'STU-2026-0460',
    studentName: 'Owen Gallagher',
    division: 'Humanities & Law',
    term: 'Fall 2026',
    description: 'Semester Tuition Balance & Commons Assessment',
    dueDate: '2026-10-25',
    amount: 6150,
    status: 'Unpaid',
  },
];

export const INITIAL_SESSIONS: CourseSession[] = [
  {
    id: 'SES-101',
    code: 'MECH-304',
    title: 'Applied Mechatronics & Control Loops',
    division: 'Applied Engineering',
    instructor: 'Dr. Martin Keller',
    room: 'Hayes Center · Lab 2.14',
    schedule: '09:00 – 10:50',
    enrolledCount: 28,
    capacity: 30,
    roster: [
      { studentId: 'STU-2026-0412', studentName: 'Clara Hendrickson', attendance: 'Present' },
      { studentId: 'STU-2026-0431', studentName: 'Devon Mercer', attendance: 'Absent' },
      { studentId: 'STU-2026-0423', studentName: 'Hannah Lindqvist', attendance: 'Present' },
      { studentId: 'STU-2026-0452', studentName: 'Amara Diallo', attendance: 'Present' },
    ],
  },
  {
    id: 'SES-102',
    code: 'ECON-210',
    title: 'Econometric Modeling & Fiscal Policy',
    division: 'Quantitative Economics',
    instructor: 'Prof. Nadia Okafor',
    room: 'Alder Hall · Seminar 108',
    schedule: '11:15 – 12:45',
    enrolledCount: 34,
    capacity: 36,
    roster: [
      { studentId: 'STU-2026-0418', studentName: 'Julian Morales', attendance: 'Present' },
      { studentId: 'STU-2026-0445', studentName: 'Lucas Bernstein', attendance: 'Leave' },
      { studentId: 'STU-2026-0439', studentName: 'Priya Subramanian', attendance: 'Present' },
      { studentId: 'STU-2026-0460', studentName: 'Owen Gallagher', attendance: 'Present' },
    ],
  },
  {
    id: 'SES-103',
    code: 'PHYS-118',
    title: 'Quantum Optics & Laser Interferometry',
    division: 'Natural Sciences',
    instructor: 'Dr. Kenji Takahashi',
    room: 'North Science Pavilion · 302',
    schedule: '14:00 – 15:45',
    enrolledCount: 22,
    capacity: 24,
    roster: [
      { studentId: 'STU-2026-0423', studentName: 'Hannah Lindqvist', attendance: 'Present' },
      { studentId: 'STU-2026-0452', studentName: 'Amara Diallo', attendance: 'Present' },
      { studentId: 'STU-2026-0412', studentName: 'Clara Hendrickson', attendance: 'Present' },
      { studentId: 'STU-2026-0431', studentName: 'Devon Mercer', attendance: 'Leave' },
    ],
  },
];

export const FACULTY_MEMBERS: FacultyMember[] = [
  {
    id: 'FAC-01',
    name: 'Dr. Arthur Pendelton',
    role: 'Provost & Vice President of Academic Affairs',
    division: 'Applied Engineering',
    office: 'Founders Pavilion · Suite 400',
    coursesCount: 2,
    adviseesCount: 18,
    utilizationRate: 94,
    portraitUrl: IMAGES.deanPortrait,
  },
  {
    id: 'FAC-02',
    name: 'Dr. Martin Keller',
    role: 'Chair, Applied Engineering & Mechatronics',
    division: 'Applied Engineering',
    office: 'Hayes Center · Office 210',
    coursesCount: 4,
    adviseesCount: 32,
    utilizationRate: 91,
  },
  {
    id: 'FAC-03',
    name: 'Prof. Nadia Okafor',
    role: 'Chair, Quantitative Economics',
    division: 'Quantitative Economics',
    office: 'Alder Hall · Office 312',
    coursesCount: 3,
    adviseesCount: 27,
    utilizationRate: 88,
  },
  {
    id: 'FAC-04',
    name: 'Dr. Kenji Takahashi',
    role: 'Director of Natural Sciences Labs',
    division: 'Natural Sciences',
    office: 'North Science Pavilion · 204',
    coursesCount: 4,
    adviseesCount: 24,
    utilizationRate: 96,
  },
  {
    id: 'FAC-05',
    name: 'Prof. Eleanor Vance',
    role: 'Senior Fellow, Humanities & Law',
    division: 'Humanities & Law',
    office: 'Sterling Library · Mezzanine 14',
    coursesCount: 3,
    adviseesCount: 29,
    utilizationRate: 85,
  },
];

export const INITIAL_ALERTS: OperationalAlert[] = [
  {
    id: 'ALT-01',
    category: 'Attendance',
    title: 'Attendance threshold drop below 80%',
    detail: 'Devon Mercer recorded 3 consecutive missed lab sessions in MECH-304.',
    studentId: 'STU-2026-0431',
    timestamp: '2 hours ago',
    severity: 'At-Risk',
    resolved: false,
  },
  {
    id: 'ALT-02',
    category: 'Bursar',
    title: 'Overdue Fall 2026 tuition invoice',
    detail: 'Owen Gallagher carries an unsettled $6,150 balance past October 25 due date.',
    studentId: 'STU-2026-0460',
    timestamp: '5 hours ago',
    severity: 'Unpaid',
    resolved: false,
  },
  {
    id: 'ALT-03',
    category: 'Enrollment',
    title: 'Graduate seminar registration clearance',
    detail: 'Lucas Bernstein awaits bursar installment verification for 48-credit track.',
    studentId: 'STU-2026-0445',
    timestamp: 'Yesterday',
    severity: 'Pending',
    resolved: false,
  },
];

export const DIVISION_METRICS: DivisionPerformance[] = [
  {
    division: 'Applied Engineering',
    enrolled: 1140,
    capacity: 1200,
    tuitionClearedPct: 94.2,
    attendancePct: 93.8,
    grantAllocation: 4250000,
  },
  {
    division: 'Quantitative Economics',
    enrolled: 890,
    capacity: 950,
    tuitionClearedPct: 91.6,
    attendancePct: 92.4,
    grantAllocation: 2180000,
  },
  {
    division: 'Natural Sciences',
    enrolled: 960,
    capacity: 1020,
    tuitionClearedPct: 96.4,
    attendancePct: 95.7,
    grantAllocation: 3890000,
  },
  {
    division: 'Humanities & Law',
    enrolled: 740,
    capacity: 840,
    tuitionClearedPct: 89.8,
    attendancePct: 91.1,
    grantAllocation: 1640000,
  },
];

export const TERM_MILESTONES = [
  {
    date: 'Nov 18, 2026',
    title: 'Fall Installment II Settlement Deadline',
    division: 'Office of the Bursar',
    status: 'Pending' as const,
  },
  {
    date: 'Nov 25, 2026',
    title: 'Mid-Term Academic Standing Review',
    division: 'Dean of Faculty Council',
    status: 'Enrolled' as const,
  },
  {
    date: 'Dec 07, 2026',
    title: 'Laboratory & Cleanroom Safety Certification',
    division: 'Applied Engineering & Sciences',
    status: 'Present' as const,
  },
  {
    date: 'Dec 14, 2026',
    title: 'Fall 2026 Final Examinations Convene',
    division: 'Registrar & Academic Operations',
    status: 'Enrolled' as const,
  },
];
