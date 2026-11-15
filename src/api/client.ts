import {
  AttendanceStatus,
  BursarInvoice,
  CourseSession,
  DivisionPerformance,
  EnrollmentStatus,
  FacultyMember,
  OperationalAlert,
  StudentRecord,
  TermMilestone,
} from '../data/academicData';
import { loadSuperAdminSession } from '../auth/superAdmin';

export interface BootstrapPayload {
  students: StudentRecord[];
  invoices: BursarInvoice[];
  sessions: CourseSession[];
  alerts: OperationalAlert[];
  faculty: FacultyMember[];
  divisions: DivisionPerformance[];
  milestones: TermMilestone[];
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const session = loadSuperAdminSession();
  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...(session?.token
        ? { Authorization: `Bearer ${session.token}` }
        : {}),
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ||
        `Request failed (${response.status})`,
    );
  }

  return response.json() as Promise<T>;
}

export function fetchBootstrap() {
  return request<BootstrapPayload>('/api/bootstrap');
}

export function createAdmission(
  student: Omit<StudentRecord, 'id'>,
  feeAmount: number,
) {
  return request<{ student: StudentRecord; invoice: BursarInvoice }>(
    '/api/students',
    {
      method: 'POST',
      body: JSON.stringify({
        ...student,
        feeAmount,
      }),
    },
  );
}

export function updateStudentStatus(studentId: string, status: EnrollmentStatus) {
  return request<StudentRecord>(`/api/students/${encodeURIComponent(studentId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function clearStudentBalance(studentId: string) {
  return request<{ student: StudentRecord; invoices: BursarInvoice[] }>(
    `/api/students/${encodeURIComponent(studentId)}/clear-balance`,
    { method: 'POST' },
  );
}

export function markInvoicesPaid(ids: string[]) {
  return request<BootstrapPayload>('/api/invoices/mark-paid', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  });
}

export function updateAttendance(
  sessionId: string,
  studentId: string,
  status: AttendanceStatus,
) {
  return request<{ sessions: CourseSession[] }>(
    `/api/sessions/${encodeURIComponent(sessionId)}/attendance`,
    {
      method: 'PATCH',
      body: JSON.stringify({ studentId, status }),
    },
  );
}

export function resolveAlert(alertId: string) {
  return request<{ alert: { id: string; resolved: boolean } }>(
    `/api/alerts/${encodeURIComponent(alertId)}/resolve`,
    { method: 'PATCH' },
  );
}

export function loginSuperAdmin(username: string, password: string) {
  return request<{
    token: string;
    name: string;
    role: 'super_admin';
  }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export function updateSessionAdmin(
  sessionId: string,
  payload: Partial<
    Pick<
      CourseSession,
      | 'code'
      | 'title'
      | 'division'
      | 'instructor'
      | 'room'
      | 'schedule'
      | 'enrolledCount'
      | 'capacity'
    >
  >,
) {
  return request<{ sessions: CourseSession[] }>(
    `/api/admin/sessions/${encodeURIComponent(sessionId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  );
}

export function createSessionAdmin(
  payload: Omit<CourseSession, 'id' | 'roster'>,
) {
  return request<{ sessions: CourseSession[] }>('/api/admin/sessions', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function deleteSessionAdmin(sessionId: string) {
  return request<{ sessions: CourseSession[] }>(
    `/api/admin/sessions/${encodeURIComponent(sessionId)}`,
    { method: 'DELETE' },
  );
}

export type FacultyAdminPayload = Partial<
  Pick<
    FacultyMember,
    | 'name'
    | 'role'
    | 'division'
    | 'office'
    | 'coursesCount'
    | 'adviseesCount'
    | 'utilizationRate'
  >
>;

export function updateFacultyAdmin(
  facultyId: string,
  payload: FacultyAdminPayload,
) {
  return request<{ faculty: FacultyMember[] }>(
    `/api/admin/faculty/${encodeURIComponent(facultyId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  );
}

export function createFacultyAdmin(
  payload: Omit<FacultyMember, 'id' | 'portraitUrl'>,
) {
  return request<{ faculty: FacultyMember[] }>('/api/admin/faculty', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function deleteFacultyAdmin(facultyId: string) {
  return request<{ faculty: FacultyMember[] }>(
    `/api/admin/faculty/${encodeURIComponent(facultyId)}`,
    { method: 'DELETE' },
  );
}

export function updateMilestoneAdmin(
  milestoneId: number,
  payload: Partial<Omit<TermMilestone, 'id'>>,
) {
  return request<{ milestones: TermMilestone[] }>(
    `/api/admin/milestones/${milestoneId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  );
}

export function createMilestoneAdmin(payload: Omit<TermMilestone, 'id'>) {
  return request<{ milestones: TermMilestone[] }>('/api/admin/milestones', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function deleteMilestoneAdmin(milestoneId: number) {
  return request<{ milestones: TermMilestone[] }>(
    `/api/admin/milestones/${milestoneId}`,
    { method: 'DELETE' },
  );
}

export function updateStudentAdmin(
  studentId: string,
  payload: Partial<Omit<StudentRecord, 'id'>>,
) {
  return request<{ student: StudentRecord }>(
    `/api/admin/students/${encodeURIComponent(studentId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  );
}

export function updateDivisionAdmin(
  division: string,
  payload: Partial<
    Pick<
      DivisionPerformance,
      | 'enrolled'
      | 'capacity'
      | 'tuitionClearedPct'
      | 'attendancePct'
      | 'grantAllocation'
    >
  >,
) {
  return request<{ divisions: DivisionPerformance[] }>(
    `/api/admin/divisions/${encodeURIComponent(division)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  );
}
