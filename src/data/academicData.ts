export type ScreenId =
  | 'overview'
  | 'students'
  | 'bursar'
  | 'faculty'
  | 'campus'
  | 'admin';

export interface TermMilestone {
  id: number;
  date: string;
  title: string;
  division: string;
  status: string;
}

export type AcademicDivision =
  | 'Computer Science & Engg.'
  | 'Electronics & Communication'
  | 'Mechanical Engineering'
  | 'Business Administration';

export type EnrollmentStatus = 'Enrolled' | 'Pending' | 'At-Risk';
export type InvoiceStatus = 'Paid' | 'Pending' | 'Unpaid';
export type AttendanceStatus = 'Present' | 'Leave' | 'Absent';

export interface StudentRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
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

/** College brand — Indian higher-ed ERP (TCS iON / Academia / CCMS style) */
export const SCHOOL = {
  name: 'Aryavarta Institute of Technology',
  shortName: 'AIT',
  tagline: 'College Management ERP',
  affiliation: 'AICTE Approved · Affiliated to AKTU, Lucknow',
  academicYear: 'Odd Sem 2025–26',
  location: 'Knowledge Park III, Greater Noida · Uttar Pradesh',
} as const;

export const formatINR = (amount: number) =>
  `₹${amount.toLocaleString('en-IN')}`;

export const IMAGES = {
  campusHero: '/src/assets/images/campus_hero_architecture_1794515904998.jpg',
  libraryHall: '/src/assets/images/library_research_hall_1794515905811.jpg',
  engineeringLab: '/src/assets/images/engineering_robotics_lab_1794515905831.jpg',
  deanPortrait: '/src/assets/images/faculty_dean_portrait_1794515906361.jpg',
  campusQuad: '/src/assets/images/campus_quad_walkway_1794515906247.jpg',
} as const;

export const INITIAL_STUDENTS: StudentRecord[] = [
  {
    id: 'AIT/2023/CSE/0412',
    name: 'Ananya Sharma',
    email: 'ananya.sharma@ait.edu.in',
    phone: '98765 43210',
    division: 'Computer Science & Engg.',
    program: 'B.Tech CSE · Sem V',
    cohort: 'Batch 2023–27',
    gpa: 8.72,
    creditsEarned: 98,
    creditsTarget: 160,
    attendanceRate: 92.4,
    tuitionBalance: 0,
    status: 'Enrolled',
    advisor: 'Dr. Kavita Mehra',
  },
  {
    id: 'AIT/2024/ECE/0418',
    name: 'Arjun Reddy',
    email: 'arjun.reddy@ait.edu.in',
    phone: '98123 45678',
    division: 'Electronics & Communication',
    program: 'B.Tech ECE · Sem III',
    cohort: 'Batch 2024–28',
    gpa: 7.45,
    creditsEarned: 52,
    creditsTarget: 160,
    attendanceRate: 86.2,
    tuitionBalance: 48500,
    status: 'Pending',
    advisor: 'Prof. Suresh Iyer',
  },
  {
    id: 'AIT/2023/CSE/0423',
    name: 'Ishita Banerjee',
    email: 'ishita.banerjee@ait.edu.in',
    phone: '99887 76543',
    division: 'Computer Science & Engg.',
    program: 'B.Tech CSE · Sem V',
    cohort: 'Batch 2023–27',
    gpa: 9.12,
    creditsEarned: 102,
    creditsTarget: 160,
    attendanceRate: 95.8,
    tuitionBalance: 0,
    status: 'Enrolled',
    advisor: 'Dr. Kavita Mehra',
  },
  {
    id: 'AIT/2024/ME/0431',
    name: 'Rohan Gupta',
    email: 'rohan.gupta@ait.edu.in',
    phone: '97654 32109',
    division: 'Mechanical Engineering',
    program: 'B.Tech ME · Sem III',
    cohort: 'Batch 2024–28',
    gpa: 5.84,
    creditsEarned: 40,
    creditsTarget: 160,
    attendanceRate: 71.5,
    tuitionBalance: 92500,
    status: 'At-Risk',
    advisor: 'Dr. Nalini Desai',
  },
  {
    id: 'AIT/2022/MBA/0439',
    name: 'Priya Subramanian',
    email: 'priya.subramanian@ait.edu.in',
    phone: '99001 12233',
    division: 'Business Administration',
    program: 'MBA · Sem III',
    cohort: 'Batch 2024–26',
    gpa: 8.95,
    creditsEarned: 48,
    creditsTarget: 80,
    attendanceRate: 96.1,
    tuitionBalance: 0,
    status: 'Enrolled',
    advisor: 'Prof. Farida Khan',
  },
  {
    id: 'AIT/2023/ECE/0445',
    name: 'Kabir Malhotra',
    email: 'kabir.malhotra@ait.edu.in',
    phone: '91234 56780',
    division: 'Electronics & Communication',
    program: 'B.Tech ECE · Sem V',
    cohort: 'Batch 2023–27',
    gpa: 7.80,
    creditsEarned: 94,
    creditsTarget: 160,
    attendanceRate: 88.0,
    tuitionBalance: 32000,
    status: 'Pending',
    advisor: 'Prof. Suresh Iyer',
  },
  {
    id: 'AIT/2024/BBA/0452',
    name: 'Meera Nair',
    email: 'meera.nair@ait.edu.in',
    phone: '98700 11223',
    division: 'Business Administration',
    program: 'BBA · Sem III',
    cohort: 'Batch 2024–27',
    gpa: 8.40,
    creditsEarned: 56,
    creditsTarget: 120,
    attendanceRate: 93.2,
    tuitionBalance: 0,
    status: 'Enrolled',
    advisor: 'Prof. Farida Khan',
  },
  {
    id: 'AIT/2023/ME/0460',
    name: 'Aditya Verma',
    email: 'aditya.verma@ait.edu.in',
    phone: '96543 21098',
    division: 'Mechanical Engineering',
    program: 'B.Tech ME · Sem V',
    cohort: 'Batch 2023–27',
    gpa: 6.15,
    creditsEarned: 78,
    creditsTarget: 160,
    attendanceRate: 74.4,
    tuitionBalance: 67800,
    status: 'At-Risk',
    advisor: 'Dr. Nalini Desai',
  },
];

export const INITIAL_INVOICES: BursarInvoice[] = [
  {
    id: 'FEE/2025/8841',
    studentId: 'AIT/2023/CSE/0412',
    studentName: 'Ananya Sharma',
    division: 'Computer Science & Engg.',
    term: 'Odd Sem 2025–26',
    description: 'Tuition + Lab Fee · Odd Sem',
    dueDate: '2025-08-15',
    amount: 125000,
    status: 'Paid',
  },
  {
    id: 'FEE/2025/8842',
    studentId: 'AIT/2024/ECE/0418',
    studentName: 'Arjun Reddy',
    division: 'Electronics & Communication',
    term: 'Odd Sem 2025–26',
    description: 'Semester installment II + hostel mess',
    dueDate: '2025-11-18',
    amount: 48500,
    status: 'Pending',
  },
  {
    id: 'FEE/2025/8843',
    studentId: 'AIT/2023/CSE/0423',
    studentName: 'Ishita Banerjee',
    division: 'Computer Science & Engg.',
    term: 'Odd Sem 2025–26',
    description: 'Tuition + computing lab fee',
    dueDate: '2025-08-15',
    amount: 125000,
    status: 'Paid',
  },
  {
    id: 'FEE/2025/8844',
    studentId: 'AIT/2024/ME/0431',
    studentName: 'Rohan Gupta',
    division: 'Mechanical Engineering',
    term: 'Odd Sem 2025–26',
    description: 'Outstanding tuition + workshop fee',
    dueDate: '2025-10-30',
    amount: 92500,
    status: 'Unpaid',
  },
  {
    id: 'FEE/2025/8845',
    studentId: 'AIT/2022/MBA/0439',
    studentName: 'Priya Subramanian',
    division: 'Business Administration',
    term: 'Odd Sem 2025–26',
    description: 'MBA tuition · Odd Sem',
    dueDate: '2025-08-15',
    amount: 145000,
    status: 'Paid',
  },
  {
    id: 'FEE/2025/8846',
    studentId: 'AIT/2023/ECE/0445',
    studentName: 'Kabir Malhotra',
    division: 'Electronics & Communication',
    term: 'Odd Sem 2025–26',
    description: 'Balance tuition + exam form fee',
    dueDate: '2025-11-22',
    amount: 32000,
    status: 'Pending',
  },
  {
    id: 'FEE/2025/8847',
    studentId: 'AIT/2024/BBA/0452',
    studentName: 'Meera Nair',
    division: 'Business Administration',
    term: 'Odd Sem 2025–26',
    description: 'BBA tuition · Odd Sem',
    dueDate: '2025-08-15',
    amount: 78000,
    status: 'Paid',
  },
  {
    id: 'FEE/2025/8848',
    studentId: 'AIT/2023/ME/0460',
    studentName: 'Aditya Verma',
    division: 'Mechanical Engineering',
    term: 'Odd Sem 2025–26',
    description: 'Outstanding fee + hostel block B',
    dueDate: '2025-10-25',
    amount: 67800,
    status: 'Unpaid',
  },
];

export const INITIAL_SESSIONS: CourseSession[] = [
  {
    id: 'SES-101',
    code: 'CSE-501',
    title: 'Database Management Systems',
    division: 'Computer Science & Engg.',
    instructor: 'Dr. Kavita Mehra',
    room: 'Block A · Lab 204',
    schedule: '09:00 – 09:55',
    enrolledCount: 58,
    capacity: 60,
    roster: [
      { studentId: 'AIT/2023/CSE/0412', studentName: 'Ananya Sharma', attendance: 'Present' },
      { studentId: 'AIT/2024/ME/0431', studentName: 'Rohan Gupta', attendance: 'Absent' },
      { studentId: 'AIT/2023/CSE/0423', studentName: 'Ishita Banerjee', attendance: 'Present' },
      { studentId: 'AIT/2024/BBA/0452', studentName: 'Meera Nair', attendance: 'Present' },
    ],
  },
  {
    id: 'SES-102',
    code: 'ECE-301',
    title: 'Digital Electronics',
    division: 'Electronics & Communication',
    instructor: 'Prof. Suresh Iyer',
    room: 'Block B · Room 118',
    schedule: '10:00 – 10:55',
    enrolledCount: 52,
    capacity: 55,
    roster: [
      { studentId: 'AIT/2024/ECE/0418', studentName: 'Arjun Reddy', attendance: 'Present' },
      { studentId: 'AIT/2023/ECE/0445', studentName: 'Kabir Malhotra', attendance: 'Leave' },
      { studentId: 'AIT/2022/MBA/0439', studentName: 'Priya Subramanian', attendance: 'Present' },
      { studentId: 'AIT/2023/ME/0460', studentName: 'Aditya Verma', attendance: 'Present' },
    ],
  },
  {
    id: 'SES-103',
    code: 'MBA-203',
    title: 'Financial Management',
    division: 'Business Administration',
    instructor: 'Prof. Farida Khan',
    room: 'MBA Block · Seminar 02',
    schedule: '11:00 – 11:55',
    enrolledCount: 40,
    capacity: 45,
    roster: [
      { studentId: 'AIT/2023/CSE/0423', studentName: 'Ishita Banerjee', attendance: 'Present' },
      { studentId: 'AIT/2024/BBA/0452', studentName: 'Meera Nair', attendance: 'Present' },
      { studentId: 'AIT/2023/CSE/0412', studentName: 'Ananya Sharma', attendance: 'Present' },
      { studentId: 'AIT/2024/ME/0431', studentName: 'Rohan Gupta', attendance: 'Leave' },
    ],
  },
];

export const FACULTY_MEMBERS: FacultyMember[] = [
  {
    id: 'FAC-01',
    name: 'Dr. Rajesh Krishnan',
    role: 'Director & Dean (Academics)',
    division: 'Computer Science & Engg.',
    office: 'Admin Block · Director\'s Office',
    coursesCount: 2,
    adviseesCount: 18,
    utilizationRate: 94,
    portraitUrl: IMAGES.deanPortrait,
  },
  {
    id: 'FAC-02',
    name: 'Dr. Kavita Mehra',
    role: 'HOD · Computer Science & Engg.',
    division: 'Computer Science & Engg.',
    office: 'Block A · Faculty Cabin 12',
    coursesCount: 4,
    adviseesCount: 42,
    utilizationRate: 91,
  },
  {
    id: 'FAC-03',
    name: 'Prof. Suresh Iyer',
    role: 'HOD · Electronics & Communication',
    division: 'Electronics & Communication',
    office: 'Block B · Faculty Cabin 08',
    coursesCount: 3,
    adviseesCount: 38,
    utilizationRate: 88,
  },
  {
    id: 'FAC-04',
    name: 'Dr. Nalini Desai',
    role: 'HOD · Mechanical Engineering',
    division: 'Mechanical Engineering',
    office: 'Workshop Block · Cabin 04',
    coursesCount: 4,
    adviseesCount: 44,
    utilizationRate: 96,
  },
  {
    id: 'FAC-05',
    name: 'Prof. Farida Khan',
    role: 'HOD · Business Administration',
    division: 'Business Administration',
    office: 'MBA Block · Cabin 14',
    coursesCount: 3,
    adviseesCount: 36,
    utilizationRate: 85,
  },
];

export const INITIAL_ALERTS: OperationalAlert[] = [
  {
    id: 'ALT-01',
    category: 'Attendance',
    title: 'Attendance below 75% (university norm)',
    detail: 'Rohan Gupta is below the AKTU attendance threshold in Workshop Practice.',
    studentId: 'AIT/2024/ME/0431',
    timestamp: '2 hours ago',
    severity: 'At-Risk',
    resolved: false,
  },
  {
    id: 'ALT-02',
    category: 'Bursar',
    title: 'Overdue Odd Sem fee invoice',
    detail: 'Aditya Verma has an unsettled ₹67,800 balance past 25 Oct due date.',
    studentId: 'AIT/2023/ME/0460',
    timestamp: '5 hours ago',
    severity: 'Unpaid',
    resolved: false,
  },
  {
    id: 'ALT-03',
    category: 'Enrollment',
    title: 'Exam form clearance pending',
    detail: 'Kabir Malhotra awaits accounts clearance before Odd Sem exam form submission.',
    studentId: 'AIT/2023/ECE/0445',
    timestamp: 'Yesterday',
    severity: 'Pending',
    resolved: false,
  },
];

export const DIVISION_METRICS: DivisionPerformance[] = [
  {
    division: 'Computer Science & Engg.',
    enrolled: 720,
    capacity: 780,
    tuitionClearedPct: 94.2,
    attendancePct: 91.8,
    grantAllocation: 4200000,
  },
  {
    division: 'Electronics & Communication',
    enrolled: 540,
    capacity: 600,
    tuitionClearedPct: 91.6,
    attendancePct: 89.4,
    grantAllocation: 3100000,
  },
  {
    division: 'Mechanical Engineering',
    enrolled: 480,
    capacity: 540,
    tuitionClearedPct: 88.4,
    attendancePct: 87.1,
    grantAllocation: 2800000,
  },
  {
    division: 'Business Administration',
    enrolled: 360,
    capacity: 400,
    tuitionClearedPct: 96.4,
    attendancePct: 93.7,
    grantAllocation: 1950000,
  },
];

export const TERM_MILESTONES = [
  {
    date: '18 Nov 2025',
    title: 'Odd Sem Fee Settlement Deadline',
    division: 'Accounts Office',
    status: 'Pending' as const,
  },
  {
    date: '25 Nov 2025',
    title: 'University Exam Form Submission',
    division: 'Examination Cell',
    status: 'Enrolled' as const,
  },
  {
    date: '07 Dec 2025',
    title: 'TechFest & Placement Drive Week',
    division: 'Training & Placement',
    status: 'Present' as const,
  },
  {
    date: '14 Dec 2025',
    title: 'Odd Sem End-Term Examinations',
    division: 'Controller of Examinations',
    status: 'Enrolled' as const,
  },
];
