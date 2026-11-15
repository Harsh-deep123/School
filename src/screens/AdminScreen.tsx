import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  GraduationCap,
  LayoutGrid,
  Plus,
  Save,
  Trash2,
  Users,
} from 'lucide-react';
import {
  AcademicDivision,
  CourseSession,
  DivisionPerformance,
  EnrollmentStatus,
  FacultyMember,
  StudentRecord,
  TermMilestone,
} from '../data/academicData';

type AdminTab =
  | 'timetable'
  | 'faculty'
  | 'calendar'
  | 'students'
  | 'departments';

const DIVISIONS: AcademicDivision[] = [
  'Computer Science & Engg.',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Business Administration',
];

const ENROLLMENT_STATUSES: EnrollmentStatus[] = [
  'Enrolled',
  'Pending',
  'At-Risk',
];

const inputClass =
  'w-full h-10 px-3 rounded-lg border border-[#d5e2db] bg-white text-sm text-[#12261f] outline-none focus:border-[#0b6b4c] focus:ring-2 focus:ring-[#0b6b4c]/15';

interface AdminScreenProps {
  sessions: CourseSession[];
  faculty: FacultyMember[];
  milestones: TermMilestone[];
  students: StudentRecord[];
  divisions: DivisionPerformance[];
  onSaveSession: (
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
  ) => Promise<void>;
  onCreateSession: (
    payload: Omit<CourseSession, 'id' | 'roster'>,
  ) => Promise<void>;
  onDeleteSession: (sessionId: string) => Promise<void>;
  onSaveFaculty: (
    facultyId: string,
    payload: Partial<
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
    >,
  ) => Promise<void>;
  onCreateFaculty: (
    payload: Omit<FacultyMember, 'id' | 'portraitUrl'>,
  ) => Promise<void>;
  onDeleteFaculty: (facultyId: string) => Promise<void>;
  onSaveMilestone: (
    milestoneId: number,
    payload: Partial<Omit<TermMilestone, 'id'>>,
  ) => Promise<void>;
  onCreateMilestone: (payload: Omit<TermMilestone, 'id'>) => Promise<void>;
  onDeleteMilestone: (milestoneId: number) => Promise<void>;
  onSaveStudent: (
    studentId: string,
    payload: Partial<Omit<StudentRecord, 'id'>>,
  ) => Promise<void>;
  onSaveDivision: (
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
  ) => Promise<void>;
}

export function AdminScreen({
  sessions,
  faculty,
  milestones,
  students,
  divisions,
  onSaveSession,
  onCreateSession,
  onDeleteSession,
  onSaveFaculty,
  onCreateFaculty,
  onDeleteFaculty,
  onSaveMilestone,
  onCreateMilestone,
  onDeleteMilestone,
  onSaveStudent,
  onSaveDivision,
}: AdminScreenProps) {
  const [tab, setTab] = useState<AdminTab>('timetable');
  const [selectedSessionId, setSelectedSessionId] = useState(
    sessions[0]?.id ?? '',
  );
  const [selectedFacultyId, setSelectedFacultyId] = useState(
    faculty[0]?.id ?? '',
  );
  const [selectedMilestoneId, setSelectedMilestoneId] = useState(
    milestones[0]?.id ?? 0,
  );
  const [selectedStudentId, setSelectedStudentId] = useState(
    students[0]?.id ?? '',
  );
  const [selectedDivision, setSelectedDivision] = useState(
    divisions[0]?.division ?? DIVISIONS[0],
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const selectedSession = useMemo(
    () => sessions.find((s) => s.id === selectedSessionId) ?? null,
    [sessions, selectedSessionId],
  );
  const selectedFaculty = useMemo(
    () => faculty.find((f) => f.id === selectedFacultyId) ?? null,
    [faculty, selectedFacultyId],
  );
  const selectedMilestone = useMemo(
    () => milestones.find((m) => m.id === selectedMilestoneId) ?? null,
    [milestones, selectedMilestoneId],
  );
  const selectedStudent = useMemo(
    () => students.find((s) => s.id === selectedStudentId) ?? null,
    [students, selectedStudentId],
  );
  const selectedDivisionRow = useMemo(
    () => divisions.find((d) => d.division === selectedDivision) ?? null,
    [divisions, selectedDivision],
  );

  const [sessionForm, setSessionForm] = useState({
    code: '',
    title: '',
    division: DIVISIONS[0] as string,
    instructor: '',
    room: '',
    schedule: '',
    enrolledCount: 0,
    capacity: 60,
  });
  const [facultyForm, setFacultyForm] = useState({
    name: '',
    role: '',
    division: DIVISIONS[0] as string,
    office: '',
    coursesCount: 0,
    adviseesCount: 0,
    utilizationRate: 0,
  });
  const [milestoneForm, setMilestoneForm] = useState({
    date: '',
    title: '',
    division: '',
    status: 'Pending',
  });
  const [studentForm, setStudentForm] = useState({
    name: '',
    email: '',
    phone: '',
    division: DIVISIONS[0] as string,
    program: '',
    cohort: '',
    gpa: 0,
    creditsEarned: 0,
    creditsTarget: 180,
    attendanceRate: 100,
    tuitionBalance: 0,
    status: 'Enrolled' as EnrollmentStatus,
    advisor: '',
  });
  const [divisionForm, setDivisionForm] = useState({
    enrolled: 0,
    capacity: 0,
    tuitionClearedPct: 0,
    attendancePct: 0,
    grantAllocation: 0,
  });
  const [newSession, setNewSession] = useState({
    code: '',
    title: '',
    division: DIVISIONS[0] as string,
    instructor: '',
    room: '',
    schedule: '09:00 – 09:55',
    enrolledCount: 0,
    capacity: 60,
  });
  const [newMilestone, setNewMilestone] = useState({
    date: '',
    title: '',
    division: '',
    status: 'Pending',
  });
  const [newFaculty, setNewFaculty] = useState({
    name: '',
    role: '',
    division: DIVISIONS[0] as string,
    office: '',
    coursesCount: 0,
    adviseesCount: 0,
    utilizationRate: 0,
  });

  useEffect(() => {
    if (!selectedSession) return;
    setSessionForm({
      code: selectedSession.code,
      title: selectedSession.title,
      division: selectedSession.division,
      instructor: selectedSession.instructor,
      room: selectedSession.room,
      schedule: selectedSession.schedule,
      enrolledCount: selectedSession.enrolledCount,
      capacity: selectedSession.capacity,
    });
  }, [selectedSession]);

  useEffect(() => {
    if (!selectedFaculty) return;
    setFacultyForm({
      name: selectedFaculty.name,
      role: selectedFaculty.role,
      division: selectedFaculty.division,
      office: selectedFaculty.office,
      coursesCount: selectedFaculty.coursesCount,
      adviseesCount: selectedFaculty.adviseesCount,
      utilizationRate: selectedFaculty.utilizationRate,
    });
  }, [selectedFaculty]);

  useEffect(() => {
    if (!selectedMilestone) return;
    setMilestoneForm({
      date: selectedMilestone.date,
      title: selectedMilestone.title,
      division: selectedMilestone.division,
      status: selectedMilestone.status,
    });
  }, [selectedMilestone]);

  useEffect(() => {
    if (!selectedStudent) return;
    setStudentForm({
      name: selectedStudent.name,
      email: selectedStudent.email,
      phone: selectedStudent.phone ?? '',
      division: selectedStudent.division,
      program: selectedStudent.program,
      cohort: selectedStudent.cohort,
      gpa: selectedStudent.gpa,
      creditsEarned: selectedStudent.creditsEarned,
      creditsTarget: selectedStudent.creditsTarget,
      attendanceRate: selectedStudent.attendanceRate,
      tuitionBalance: selectedStudent.tuitionBalance,
      status: selectedStudent.status,
      advisor: selectedStudent.advisor,
    });
  }, [selectedStudent]);

  useEffect(() => {
    if (!selectedDivisionRow) return;
    setDivisionForm({
      enrolled: selectedDivisionRow.enrolled,
      capacity: selectedDivisionRow.capacity,
      tuitionClearedPct: selectedDivisionRow.tuitionClearedPct,
      attendancePct: selectedDivisionRow.attendancePct,
      grantAllocation: selectedDivisionRow.grantAllocation,
    });
  }, [selectedDivisionRow]);

  useEffect(() => {
    if (sessions.length && !sessions.some((s) => s.id === selectedSessionId)) {
      setSelectedSessionId(sessions[0].id);
    }
  }, [sessions, selectedSessionId]);

  useEffect(() => {
    if (faculty.length && !faculty.some((f) => f.id === selectedFacultyId)) {
      setSelectedFacultyId(faculty[0].id);
    }
  }, [faculty, selectedFacultyId]);

  useEffect(() => {
    if (
      milestones.length &&
      !milestones.some((m) => m.id === selectedMilestoneId)
    ) {
      setSelectedMilestoneId(milestones[0].id);
    }
  }, [milestones, selectedMilestoneId]);

  useEffect(() => {
    if (students.length && !students.some((s) => s.id === selectedStudentId)) {
      setSelectedStudentId(students[0].id);
    }
  }, [students, selectedStudentId]);

  const run = async (action: () => Promise<void>, okMessage: string) => {
    setBusy(true);
    setMessage(null);
    try {
      await action();
      setMessage(okMessage);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  const tabs: { id: AdminTab; label: string; Icon: typeof LayoutGrid }[] = [
    { id: 'timetable', label: 'Timetable', Icon: LayoutGrid },
    { id: 'faculty', label: 'Faculty', Icon: GraduationCap },
    { id: 'calendar', label: 'Calendar', Icon: CalendarDays },
    { id: 'students', label: 'Students', Icon: Users },
    { id: 'departments', label: 'Departments', Icon: LayoutGrid },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="card-level-1 rounded-2xl p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#0a5c40]">
              Super Admin Control
            </p>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-[#12261f] mt-1">
              Edit college records
            </h1>
            <p className="text-sm text-[#3d5248] mt-2 max-w-2xl">
              Change lecture timetable, faculty assignments, academic calendar,
              student records and department metrics. Changes save to SQLite
              immediately.
            </p>
          </div>
          {message && (
            <div className="text-xs font-semibold px-3 py-2 rounded-lg bg-[#e7f0eb] text-[#0b6b4c]">
              {message}
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {tabs.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`h-10 px-3.5 rounded-lg text-sm font-semibold inline-flex items-center gap-2 transition-colors ${
                tab === id
                  ? 'bg-[#0b6b4c] text-white'
                  : 'bg-white border border-[#d5e2db] text-[#12261f] hover:bg-[#f5faf7]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'timetable' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-4 card-level-1 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#d5e2db]">
              <h2 className="font-display font-semibold text-[#12261f]">
                Lecture slots
              </h2>
            </div>
            <div className="divide-y divide-[#d5e2db] max-h-[420px] overflow-y-auto">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => setSelectedSessionId(session.id)}
                  className={`w-full text-left px-5 py-3.5 transition-colors ${
                    selectedSessionId === session.id
                      ? 'bg-[#e7f0eb]'
                      : 'hover:bg-[#f5faf7]'
                  }`}
                >
                  <div className="font-mono text-xs font-semibold text-[#0a5c40]">
                    {session.code}
                  </div>
                  <div className="text-sm font-medium text-[#12261f]">
                    {session.title}
                  </div>
                  <div className="text-xs text-[#6b8578] mt-0.5">
                    {session.schedule} · {session.room}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="xl:col-span-8 space-y-6">
            {selectedSession && (
              <form
                className="card-level-1 rounded-2xl p-5 md:p-6 space-y-4"
                onSubmit={(e: FormEvent) => {
                  e.preventDefault();
                  void run(
                    () =>
                      onSaveSession(selectedSession.id, {
                        ...sessionForm,
                        division: sessionForm.division as AcademicDivision,
                        enrolledCount: Number(sessionForm.enrolledCount),
                        capacity: Number(sessionForm.capacity),
                      }),
                    'Timetable slot updated',
                  );
                }}
              >
                <h2 className="font-display text-lg font-semibold text-[#12261f]">
                  Edit timetable slot
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Course code">
                    <input
                      className={inputClass}
                      value={sessionForm.code}
                      onChange={(e) =>
                        setSessionForm((f) => ({ ...f, code: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="Schedule / timing">
                    <input
                      className={inputClass}
                      value={sessionForm.schedule}
                      onChange={(e) =>
                        setSessionForm((f) => ({
                          ...f,
                          schedule: e.target.value,
                        }))
                      }
                      placeholder="09:00 – 09:55"
                    />
                  </Field>
                  <Field label="Course title" className="sm:col-span-2">
                    <input
                      className={inputClass}
                      value={sessionForm.title}
                      onChange={(e) =>
                        setSessionForm((f) => ({ ...f, title: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="Department">
                    <select
                      className={inputClass}
                      value={sessionForm.division}
                      onChange={(e) =>
                        setSessionForm((f) => ({
                          ...f,
                          division: e.target.value,
                        }))
                      }
                    >
                      {DIVISIONS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Faculty">
                    <input
                      className={inputClass}
                      value={sessionForm.instructor}
                      onChange={(e) =>
                        setSessionForm((f) => ({
                          ...f,
                          instructor: e.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field label="Room">
                    <input
                      className={inputClass}
                      value={sessionForm.room}
                      onChange={(e) =>
                        setSessionForm((f) => ({ ...f, room: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="Enrolment">
                    <input
                      type="number"
                      className={inputClass}
                      value={sessionForm.enrolledCount}
                      onChange={(e) =>
                        setSessionForm((f) => ({
                          ...f,
                          enrolledCount: Number(e.target.value),
                        }))
                      }
                    />
                  </Field>
                  <Field label="Capacity">
                    <input
                      type="number"
                      className={inputClass}
                      value={sessionForm.capacity}
                      onChange={(e) =>
                        setSessionForm((f) => ({
                          ...f,
                          capacity: Number(e.target.value),
                        }))
                      }
                    />
                  </Field>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={busy}
                    className="h-10 px-4 rounded-lg bg-[#0b6b4c] text-sm font-semibold text-white hover:bg-[#095a40] inline-flex items-center gap-2 disabled:opacity-60"
                  >
                    <Save className="w-4 h-4" />
                    Save timetable
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      void run(
                        () => onDeleteSession(selectedSession.id),
                        'Timetable slot deleted',
                      )
                    }
                    className="h-10 px-4 rounded-lg border border-[#f1c4c8] bg-white text-sm font-semibold text-[#be123c] hover:bg-[#fff1f2] inline-flex items-center gap-2 disabled:opacity-60"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </form>
            )}

            <form
              className="card-level-1 rounded-2xl p-5 md:p-6 space-y-4"
              onSubmit={(e: FormEvent) => {
                e.preventDefault();
                void run(async () => {
                  await onCreateSession({
                    ...newSession,
                    division: newSession.division as AcademicDivision,
                    enrolledCount: Number(newSession.enrolledCount),
                    capacity: Number(newSession.capacity),
                  });
                  setNewSession({
                    code: '',
                    title: '',
                    division: DIVISIONS[0],
                    instructor: '',
                    room: '',
                    schedule: '09:00 – 09:55',
                    enrolledCount: 0,
                    capacity: 60,
                  });
                }, 'New lecture slot added');
              }}
            >
              <h2 className="font-display text-lg font-semibold text-[#12261f]">
                Add lecture slot
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Course code">
                  <input
                    className={inputClass}
                    required
                    value={newSession.code}
                    onChange={(e) =>
                      setNewSession((f) => ({ ...f, code: e.target.value }))
                    }
                  />
                </Field>
                <Field label="Schedule">
                  <input
                    className={inputClass}
                    required
                    value={newSession.schedule}
                    onChange={(e) =>
                      setNewSession((f) => ({
                        ...f,
                        schedule: e.target.value,
                      }))
                    }
                  />
                </Field>
                <Field label="Title" className="sm:col-span-2">
                  <input
                    className={inputClass}
                    required
                    value={newSession.title}
                    onChange={(e) =>
                      setNewSession((f) => ({ ...f, title: e.target.value }))
                    }
                  />
                </Field>
                <Field label="Department">
                  <select
                    className={inputClass}
                    value={newSession.division}
                    onChange={(e) =>
                      setNewSession((f) => ({
                        ...f,
                        division: e.target.value,
                      }))
                    }
                  >
                    {DIVISIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Faculty">
                  <input
                    className={inputClass}
                    required
                    value={newSession.instructor}
                    onChange={(e) =>
                      setNewSession((f) => ({
                        ...f,
                        instructor: e.target.value,
                      }))
                    }
                  />
                </Field>
                <Field label="Room">
                  <input
                    className={inputClass}
                    required
                    value={newSession.room}
                    onChange={(e) =>
                      setNewSession((f) => ({ ...f, room: e.target.value }))
                    }
                  />
                </Field>
                <Field label="Capacity">
                  <input
                    type="number"
                    className={inputClass}
                    value={newSession.capacity}
                    onChange={(e) =>
                      setNewSession((f) => ({
                        ...f,
                        capacity: Number(e.target.value),
                      }))
                    }
                  />
                </Field>
              </div>
              <button
                type="submit"
                disabled={busy}
                className="h-10 px-4 rounded-lg bg-[#0b6b4c] text-sm font-semibold text-white hover:bg-[#095a40] inline-flex items-center gap-2 disabled:opacity-60"
              >
                <Plus className="w-4 h-4" />
                Add to timetable
              </button>
            </form>
          </div>
        </div>
      )}

      {tab === 'faculty' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-4 card-level-1 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#d5e2db]">
              <h2 className="font-display font-semibold text-[#12261f]">
                Faculty list
              </h2>
            </div>
            <div className="divide-y divide-[#d5e2db] max-h-[480px] overflow-y-auto">
              {faculty.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => setSelectedFacultyId(member.id)}
                  className={`w-full text-left px-5 py-3.5 ${
                    selectedFacultyId === member.id
                      ? 'bg-[#e7f0eb]'
                      : 'hover:bg-[#f5faf7]'
                  }`}
                >
                  <div className="text-sm font-medium text-[#12261f]">
                    {member.name}
                  </div>
                  <div className="text-xs text-[#6b8578]">{member.role}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="xl:col-span-8 space-y-6">
            {selectedFaculty && (
              <form
                className="card-level-1 rounded-2xl p-5 md:p-6 space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  void run(
                    () =>
                      onSaveFaculty(selectedFaculty.id, {
                        ...facultyForm,
                        division: facultyForm.division as AcademicDivision,
                        coursesCount: Number(facultyForm.coursesCount),
                        adviseesCount: Number(facultyForm.adviseesCount),
                        utilizationRate: Number(facultyForm.utilizationRate),
                      }),
                    'Faculty record updated',
                  );
                }}
              >
                <h2 className="font-display text-lg font-semibold text-[#12261f]">
                  Edit faculty
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Name">
                    <input
                      className={inputClass}
                      value={facultyForm.name}
                      onChange={(e) =>
                        setFacultyForm((f) => ({ ...f, name: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="Role">
                    <input
                      className={inputClass}
                      value={facultyForm.role}
                      onChange={(e) =>
                        setFacultyForm((f) => ({ ...f, role: e.target.value }))
                      }
                    />
                  </Field>
                  <Field label="Department">
                    <select
                      className={inputClass}
                      value={facultyForm.division}
                      onChange={(e) =>
                        setFacultyForm((f) => ({
                          ...f,
                          division: e.target.value,
                        }))
                      }
                    >
                      {DIVISIONS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Office">
                    <input
                      className={inputClass}
                      value={facultyForm.office}
                      onChange={(e) =>
                        setFacultyForm((f) => ({
                          ...f,
                          office: e.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field label="Courses">
                    <input
                      type="number"
                      className={inputClass}
                      value={facultyForm.coursesCount}
                      onChange={(e) =>
                        setFacultyForm((f) => ({
                          ...f,
                          coursesCount: Number(e.target.value),
                        }))
                      }
                    />
                  </Field>
                  <Field label="Advisees">
                    <input
                      type="number"
                      className={inputClass}
                      value={facultyForm.adviseesCount}
                      onChange={(e) =>
                        setFacultyForm((f) => ({
                          ...f,
                          adviseesCount: Number(e.target.value),
                        }))
                      }
                    />
                  </Field>
                  <Field label="Utilisation %">
                    <input
                      type="number"
                      className={inputClass}
                      value={facultyForm.utilizationRate}
                      onChange={(e) =>
                        setFacultyForm((f) => ({
                          ...f,
                          utilizationRate: Number(e.target.value),
                        }))
                      }
                    />
                  </Field>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="submit"
                    disabled={busy}
                    className="h-10 px-4 rounded-lg bg-[#0b6b4c] text-sm font-semibold text-white hover:bg-[#095a40] inline-flex items-center gap-2 disabled:opacity-60"
                  >
                    <Save className="w-4 h-4" />
                    Save faculty
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      void run(
                        () => onDeleteFaculty(selectedFaculty.id),
                        'Faculty deleted',
                      )
                    }
                    className="h-10 px-4 rounded-lg border border-[#f1c4c8] bg-white text-sm font-semibold text-[#be123c] hover:bg-[#fff1f2] inline-flex items-center gap-2 disabled:opacity-60"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </form>
            )}

            <form
              className="card-level-1 rounded-2xl p-5 md:p-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                void run(async () => {
                  await onCreateFaculty({
                    ...newFaculty,
                    division: newFaculty.division as AcademicDivision,
                    coursesCount: Number(newFaculty.coursesCount),
                    adviseesCount: Number(newFaculty.adviseesCount),
                    utilizationRate: Number(newFaculty.utilizationRate),
                  });
                  setNewFaculty({
                    name: '',
                    role: '',
                    division: DIVISIONS[0],
                    office: '',
                    coursesCount: 0,
                    adviseesCount: 0,
                    utilizationRate: 0,
                  });
                }, 'Faculty member added');
              }}
            >
              <h2 className="font-display text-lg font-semibold text-[#12261f]">
                Add faculty
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Name">
                  <input
                    required
                    className={inputClass}
                    value={newFaculty.name}
                    onChange={(e) =>
                      setNewFaculty((f) => ({ ...f, name: e.target.value }))
                    }
                  />
                </Field>
                <Field label="Role">
                  <input
                    required
                    className={inputClass}
                    value={newFaculty.role}
                    onChange={(e) =>
                      setNewFaculty((f) => ({ ...f, role: e.target.value }))
                    }
                  />
                </Field>
                <Field label="Department">
                  <select
                    className={inputClass}
                    value={newFaculty.division}
                    onChange={(e) =>
                      setNewFaculty((f) => ({
                        ...f,
                        division: e.target.value,
                      }))
                    }
                  >
                    {DIVISIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Office">
                  <input
                    required
                    className={inputClass}
                    value={newFaculty.office}
                    onChange={(e) =>
                      setNewFaculty((f) => ({ ...f, office: e.target.value }))
                    }
                  />
                </Field>
                <Field label="Courses">
                  <input
                    type="number"
                    className={inputClass}
                    value={newFaculty.coursesCount}
                    onChange={(e) =>
                      setNewFaculty((f) => ({
                        ...f,
                        coursesCount: Number(e.target.value),
                      }))
                    }
                  />
                </Field>
                <Field label="Advisees">
                  <input
                    type="number"
                    className={inputClass}
                    value={newFaculty.adviseesCount}
                    onChange={(e) =>
                      setNewFaculty((f) => ({
                        ...f,
                        adviseesCount: Number(e.target.value),
                      }))
                    }
                  />
                </Field>
                <Field label="Utilisation %">
                  <input
                    type="number"
                    className={inputClass}
                    value={newFaculty.utilizationRate}
                    onChange={(e) =>
                      setNewFaculty((f) => ({
                        ...f,
                        utilizationRate: Number(e.target.value),
                      }))
                    }
                  />
                </Field>
              </div>
              <button
                type="submit"
                disabled={busy}
                className="h-10 px-4 rounded-lg bg-[#0b6b4c] text-sm font-semibold text-white hover:bg-[#095a40] inline-flex items-center gap-2 disabled:opacity-60"
              >
                <Plus className="w-4 h-4" />
                Add faculty
              </button>
            </form>
          </div>
        </div>
      )}

      {tab === 'calendar' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-4 card-level-1 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#d5e2db]">
              <h2 className="font-display font-semibold text-[#12261f]">
                Academic milestones
              </h2>
            </div>
            <div className="divide-y divide-[#d5e2db] max-h-[420px] overflow-y-auto">
              {milestones.map((milestone) => (
                <button
                  key={milestone.id}
                  type="button"
                  onClick={() => setSelectedMilestoneId(milestone.id)}
                  className={`w-full text-left px-5 py-3.5 ${
                    selectedMilestoneId === milestone.id
                      ? 'bg-[#e7f0eb]'
                      : 'hover:bg-[#f5faf7]'
                  }`}
                >
                  <div className="font-mono text-xs font-semibold text-[#0a5c40]">
                    {milestone.date}
                  </div>
                  <div className="text-sm font-medium text-[#12261f]">
                    {milestone.title}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="xl:col-span-8 space-y-6">
            {selectedMilestone && (
              <form
                className="card-level-1 rounded-2xl p-5 md:p-6 space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  void run(
                    () =>
                      onSaveMilestone(selectedMilestone.id, milestoneForm),
                    'Calendar milestone updated',
                  );
                }}
              >
                <h2 className="font-display text-lg font-semibold text-[#12261f]">
                  Edit milestone
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Date">
                    <input
                      className={inputClass}
                      value={milestoneForm.date}
                      onChange={(e) =>
                        setMilestoneForm((f) => ({
                          ...f,
                          date: e.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field label="Status">
                    <input
                      className={inputClass}
                      value={milestoneForm.status}
                      onChange={(e) =>
                        setMilestoneForm((f) => ({
                          ...f,
                          status: e.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field label="Title" className="sm:col-span-2">
                    <input
                      className={inputClass}
                      value={milestoneForm.title}
                      onChange={(e) =>
                        setMilestoneForm((f) => ({
                          ...f,
                          title: e.target.value,
                        }))
                      }
                    />
                  </Field>
                  <Field label="Office / cell" className="sm:col-span-2">
                    <input
                      className={inputClass}
                      value={milestoneForm.division}
                      onChange={(e) =>
                        setMilestoneForm((f) => ({
                          ...f,
                          division: e.target.value,
                        }))
                      }
                    />
                  </Field>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="submit"
                    disabled={busy}
                    className="h-10 px-4 rounded-lg bg-[#0b6b4c] text-sm font-semibold text-white hover:bg-[#095a40] inline-flex items-center gap-2 disabled:opacity-60"
                  >
                    <Save className="w-4 h-4" />
                    Save milestone
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      void run(
                        () => onDeleteMilestone(selectedMilestone.id),
                        'Milestone deleted',
                      )
                    }
                    className="h-10 px-4 rounded-lg border border-[#f1c4c8] bg-white text-sm font-semibold text-[#be123c] hover:bg-[#fff1f2] inline-flex items-center gap-2 disabled:opacity-60"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </form>
            )}

            <form
              className="card-level-1 rounded-2xl p-5 md:p-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                void run(async () => {
                  await onCreateMilestone(newMilestone);
                  setNewMilestone({
                    date: '',
                    title: '',
                    division: '',
                    status: 'Pending',
                  });
                }, 'Milestone added');
              }}
            >
              <h2 className="font-display text-lg font-semibold text-[#12261f]">
                Add milestone
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Date">
                  <input
                    className={inputClass}
                    required
                    value={newMilestone.date}
                    onChange={(e) =>
                      setNewMilestone((f) => ({ ...f, date: e.target.value }))
                    }
                  />
                </Field>
                <Field label="Status">
                  <input
                    className={inputClass}
                    value={newMilestone.status}
                    onChange={(e) =>
                      setNewMilestone((f) => ({
                        ...f,
                        status: e.target.value,
                      }))
                    }
                  />
                </Field>
                <Field label="Title" className="sm:col-span-2">
                  <input
                    className={inputClass}
                    required
                    value={newMilestone.title}
                    onChange={(e) =>
                      setNewMilestone((f) => ({ ...f, title: e.target.value }))
                    }
                  />
                </Field>
                <Field label="Office / cell" className="sm:col-span-2">
                  <input
                    className={inputClass}
                    required
                    value={newMilestone.division}
                    onChange={(e) =>
                      setNewMilestone((f) => ({
                        ...f,
                        division: e.target.value,
                      }))
                    }
                  />
                </Field>
              </div>
              <button
                type="submit"
                disabled={busy}
                className="h-10 px-4 rounded-lg bg-[#0b6b4c] text-sm font-semibold text-white hover:bg-[#095a40] inline-flex items-center gap-2 disabled:opacity-60"
              >
                <Plus className="w-4 h-4" />
                Add milestone
              </button>
            </form>
          </div>
        </div>
      )}

      {tab === 'students' && selectedStudent && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-4 card-level-1 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#d5e2db]">
              <h2 className="font-display font-semibold text-[#12261f]">
                Students
              </h2>
            </div>
            <div className="divide-y divide-[#d5e2db] max-h-[480px] overflow-y-auto">
              {students.map((student) => (
                <button
                  key={student.id}
                  type="button"
                  onClick={() => setSelectedStudentId(student.id)}
                  className={`w-full text-left px-5 py-3.5 ${
                    selectedStudentId === student.id
                      ? 'bg-[#e7f0eb]'
                      : 'hover:bg-[#f5faf7]'
                  }`}
                >
                  <div className="text-sm font-medium text-[#12261f]">
                    {student.name}
                  </div>
                  <div className="text-xs font-mono text-[#6b8578]">
                    {student.id}
                  </div>
                </button>
              ))}
            </div>
          </div>
          <form
            className="xl:col-span-8 card-level-1 rounded-2xl p-5 md:p-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              void run(
                () =>
                  onSaveStudent(selectedStudent.id, {
                    ...studentForm,
                    division: studentForm.division as AcademicDivision,
                    gpa: Number(studentForm.gpa),
                    creditsEarned: Number(studentForm.creditsEarned),
                    creditsTarget: Number(studentForm.creditsTarget),
                    attendanceRate: Number(studentForm.attendanceRate),
                    tuitionBalance: Number(studentForm.tuitionBalance),
                  }),
                'Student record updated',
              );
            }}
          >
            <h2 className="font-display text-lg font-semibold text-[#12261f]">
              Edit student
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Name">
                <input
                  className={inputClass}
                  value={studentForm.name}
                  onChange={(e) =>
                    setStudentForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </Field>
              <Field label="Email">
                <input
                  className={inputClass}
                  value={studentForm.email}
                  onChange={(e) =>
                    setStudentForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </Field>
              <Field label="Phone number">
                <input
                  className={inputClass}
                  value={studentForm.phone}
                  onChange={(e) =>
                    setStudentForm((f) => ({ ...f, phone: e.target.value }))
                  }
                />
              </Field>
              <Field label="Department">
                <select
                  className={inputClass}
                  value={studentForm.division}
                  onChange={(e) =>
                    setStudentForm((f) => ({
                      ...f,
                      division: e.target.value,
                    }))
                  }
                >
                  {DIVISIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Programme">
                <input
                  className={inputClass}
                  value={studentForm.program}
                  onChange={(e) =>
                    setStudentForm((f) => ({ ...f, program: e.target.value }))
                  }
                />
              </Field>
              <Field label="Batch">
                <input
                  className={inputClass}
                  value={studentForm.cohort}
                  onChange={(e) =>
                    setStudentForm((f) => ({ ...f, cohort: e.target.value }))
                  }
                />
              </Field>
              <Field label="Advisor">
                <input
                  className={inputClass}
                  value={studentForm.advisor}
                  onChange={(e) =>
                    setStudentForm((f) => ({ ...f, advisor: e.target.value }))
                  }
                />
              </Field>
              <Field label="Status">
                <select
                  className={inputClass}
                  value={studentForm.status}
                  onChange={(e) =>
                    setStudentForm((f) => ({
                      ...f,
                      status: e.target.value as EnrollmentStatus,
                    }))
                  }
                >
                  {ENROLLMENT_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="CGPA">
                <input
                  type="number"
                  step="0.01"
                  className={inputClass}
                  value={studentForm.gpa}
                  onChange={(e) =>
                    setStudentForm((f) => ({
                      ...f,
                      gpa: Number(e.target.value),
                    }))
                  }
                />
              </Field>
              <Field label="Credits earned">
                <input
                  type="number"
                  className={inputClass}
                  value={studentForm.creditsEarned}
                  onChange={(e) =>
                    setStudentForm((f) => ({
                      ...f,
                      creditsEarned: Number(e.target.value),
                    }))
                  }
                />
              </Field>
              <Field label="Credits target">
                <input
                  type="number"
                  className={inputClass}
                  value={studentForm.creditsTarget}
                  onChange={(e) =>
                    setStudentForm((f) => ({
                      ...f,
                      creditsTarget: Number(e.target.value),
                    }))
                  }
                />
              </Field>
              <Field label="Attendance %">
                <input
                  type="number"
                  className={inputClass}
                  value={studentForm.attendanceRate}
                  onChange={(e) =>
                    setStudentForm((f) => ({
                      ...f,
                      attendanceRate: Number(e.target.value),
                    }))
                  }
                />
              </Field>
              <Field label="Fee balance (₹)">
                <input
                  type="number"
                  className={inputClass}
                  value={studentForm.tuitionBalance}
                  onChange={(e) =>
                    setStudentForm((f) => ({
                      ...f,
                      tuitionBalance: Number(e.target.value),
                    }))
                  }
                />
              </Field>
            </div>
            <button
              type="submit"
              disabled={busy}
              className="h-10 px-4 rounded-lg bg-[#0b6b4c] text-sm font-semibold text-white hover:bg-[#095a40] inline-flex items-center gap-2 disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              Save student
            </button>
          </form>
        </div>
      )}

      {tab === 'departments' && selectedDivisionRow && (
        <form
          className="card-level-1 rounded-2xl p-5 md:p-6 space-y-4 max-w-3xl"
          onSubmit={(e) => {
            e.preventDefault();
            void run(
              () =>
                onSaveDivision(selectedDivisionRow.division, {
                  enrolled: Number(divisionForm.enrolled),
                  capacity: Number(divisionForm.capacity),
                  tuitionClearedPct: Number(divisionForm.tuitionClearedPct),
                  attendancePct: Number(divisionForm.attendancePct),
                  grantAllocation: Number(divisionForm.grantAllocation),
                }),
              'Department metrics updated',
            );
          }}
        >
          <h2 className="font-display text-lg font-semibold text-[#12261f]">
            Edit department metrics
          </h2>
          <Field label="Department">
            <select
              className={inputClass}
              value={selectedDivision}
              onChange={(e) =>
                setSelectedDivision(e.target.value as AcademicDivision)
              }
            >
              {divisions.map((d) => (
                <option key={d.division} value={d.division}>
                  {d.division}
                </option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Enrolment">
              <input
                type="number"
                className={inputClass}
                value={divisionForm.enrolled}
                onChange={(e) =>
                  setDivisionForm((f) => ({
                    ...f,
                    enrolled: Number(e.target.value),
                  }))
                }
              />
            </Field>
            <Field label="Capacity">
              <input
                type="number"
                className={inputClass}
                value={divisionForm.capacity}
                onChange={(e) =>
                  setDivisionForm((f) => ({
                    ...f,
                    capacity: Number(e.target.value),
                  }))
                }
              />
            </Field>
            <Field label="Fee cleared %">
              <input
                type="number"
                step="0.1"
                className={inputClass}
                value={divisionForm.tuitionClearedPct}
                onChange={(e) =>
                  setDivisionForm((f) => ({
                    ...f,
                    tuitionClearedPct: Number(e.target.value),
                  }))
                }
              />
            </Field>
            <Field label="Attendance %">
              <input
                type="number"
                step="0.1"
                className={inputClass}
                value={divisionForm.attendancePct}
                onChange={(e) =>
                  setDivisionForm((f) => ({
                    ...f,
                    attendancePct: Number(e.target.value),
                  }))
                }
              />
            </Field>
            <Field label="Budget (₹)" className="sm:col-span-2">
              <input
                type="number"
                className={inputClass}
                value={divisionForm.grantAllocation}
                onChange={(e) =>
                  setDivisionForm((f) => ({
                    ...f,
                    grantAllocation: Number(e.target.value),
                  }))
                }
              />
            </Field>
          </div>
          <button
            type="submit"
            disabled={busy}
            className="h-10 px-4 rounded-lg bg-[#0b6b4c] text-sm font-semibold text-white hover:bg-[#095a40] inline-flex items-center gap-2 disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            Save department
          </button>
        </form>
      )}
    </div>
  );
}

function Field({
  label,
  children,
  className = '',
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-xs font-semibold text-[#3d5248]">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
