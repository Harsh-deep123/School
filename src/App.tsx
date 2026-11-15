import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Building2,
  CalendarCheck2,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AttendanceStatus,
  BursarInvoice,
  CourseSession,
  DivisionPerformance,
  EnrollmentStatus,
  FacultyMember,
  IMAGES,
  OperationalAlert,
  SCHOOL,
  ScreenId,
  StudentRecord,
  TermMilestone,
} from './data/academicData';
import {
  clearStudentBalance,
  createAdmission,
  createFacultyAdmin,
  createMilestoneAdmin,
  createSessionAdmin,
  deleteFacultyAdmin,
  deleteMilestoneAdmin,
  deleteSessionAdmin,
  fetchBootstrap,
  loginSuperAdmin,
  markInvoicesPaid,
  resolveAlert,
  updateAttendance,
  updateDivisionAdmin,
  updateFacultyAdmin,
  updateMilestoneAdmin,
  updateSessionAdmin,
  updateStudentAdmin,
  updateStudentStatus,
} from './api/client';
import {
  clearSuperAdminSession,
  loadSuperAdminSession,
  saveSuperAdminSession,
  SuperAdminSession,
} from './auth/superAdmin';
import { OverviewScreen } from './screens/OverviewScreen';
import { StudentsScreen } from './screens/StudentsScreen';
import { BursarScreen } from './screens/BursarScreen';
import { FacultyScreen } from './screens/FacultyScreen';
import { CampusScreen } from './screens/CampusScreen';
import { AdminScreen } from './screens/AdminScreen';
import { EnrollStudentModal } from './components/EnrollStudentModal';
import { StudentDetailDrawer } from './components/StudentDetailDrawer';
import { SuperAdminLoginModal } from './components/SuperAdminLoginModal';
import { ResilientImage } from './components/ResilientImage';

const BASE_NAV_ITEMS: {
  id: ScreenId;
  label: string;
  Icon: typeof LayoutDashboard;
}[] = [
  { id: 'overview', label: 'Dashboard', Icon: LayoutDashboard },
  { id: 'students', label: 'Students', Icon: Users },
  { id: 'bursar', label: 'Fee Collection', Icon: CreditCard },
  { id: 'faculty', label: 'Faculty & Roll', Icon: CalendarCheck2 },
  { id: 'campus', label: 'Campus & Hostel', Icon: Building2 },
];

export default function App() {
  const scrollContainerRef = useRef<HTMLElement>(null);

  const [activeScreen, setActiveScreen] = useState<ScreenId>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [invoices, setInvoices] = useState<BursarInvoice[]>([]);
  const [sessions, setSessions] = useState<CourseSession[]>([]);
  const [alerts, setAlerts] = useState<OperationalAlert[]>([]);
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [divisions, setDivisions] = useState<DivisionPerformance[]>([]);
  const [milestones, setMilestones] = useState<TermMilestone[]>([]);

  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);
  const [adminSession, setAdminSession] = useState<SuperAdminSession | null>(
    () => loadSuperAdminSession(),
  );
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isSuperAdmin = Boolean(adminSession);
  const NAV_ITEMS = useMemo(
    () =>
      isSuperAdmin
        ? [
            ...BASE_NAV_ITEMS,
            {
              id: 'admin' as const,
              label: 'Super Admin',
              Icon: ShieldCheck,
            },
          ]
        : BASE_NAV_ITEMS,
    [isSuperAdmin],
  );

  const showToast = (message: string) => {
    setToastMessage(message);
    window.setTimeout(() => {
      setToastMessage((curr) => (curr === message ? null : curr));
    }, 3400);
  };

  useEffect(() => {
    let cancelled = false;

    fetchBootstrap()
      .then((data) => {
        if (cancelled) return;
        setStudents(data.students as StudentRecord[]);
        setInvoices(data.invoices as BursarInvoice[]);
        setSessions(data.sessions as CourseSession[]);
        setAlerts(data.alerts as OperationalAlert[]);
        setFaculty(data.faculty as FacultyMember[]);
        setDivisions(data.divisions as DivisionPerformance[]);
        setMilestones(data.milestones);
        setLoadError(null);
      })
      .catch((error: Error) => {
        if (cancelled) return;
        setLoadError(
          error.message ||
            'Could not load college data. Start the API with npm run serve.',
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleNavigate = (screen: ScreenId) => {
    setActiveScreen(screen);
    setMobileNavOpen(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleEnrollStudent = async (
    newStudentData: Omit<StudentRecord, 'id'>,
    tuitionAmount: number,
  ) => {
    try {
      const { student, invoice } = await createAdmission(
        newStudentData,
        tuitionAmount,
      );
      setStudents((prev) => [student, ...prev]);
      setInvoices((prev) => [invoice, ...prev]);
      showToast(`Admission recorded for ${student.name} (${student.id})`);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Admission failed to save',
      );
    }
  };

  const handleUpdateStudentStatus = async (
    studentId: string,
    status: EnrollmentStatus,
  ) => {
    try {
      const updated = await updateStudentStatus(studentId, status);
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? updated : s)),
      );
      showToast(`Updated student status to ${status}`);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Status update failed',
      );
    }
  };

  const handleClearStudentBalance = async (studentId: string) => {
    try {
      const result = await clearStudentBalance(studentId);
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? result.student : s)),
      );
      setInvoices((prev) =>
        prev.map((inv) => {
          const refreshed = result.invoices.find((row) => row.id === inv.id);
          return refreshed ?? inv;
        }),
      );
      showToast(`Fee settlement recorded for ${studentId}`);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Fee settlement failed',
      );
    }
  };

  const handleMarkInvoicesPaid = async (invoiceIds: string[]) => {
    try {
      const data = await markInvoicesPaid(invoiceIds);
      setStudents(data.students as StudentRecord[]);
      setInvoices(data.invoices as BursarInvoice[]);
      showToast(
        `Marked ${invoiceIds.length} ${
          invoiceIds.length === 1 ? 'fee receipt' : 'fee receipts'
        } as Paid`,
      );
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Could not mark fees paid',
      );
    }
  };

  const handleSendReminders = (invoiceIds: string[]) => {
    showToast(
      `Fee reminder sent for ${invoiceIds.length} ${
        invoiceIds.length === 1 ? 'account' : 'accounts'
      }`,
    );
  };

  const handleUpdateAttendance = async (
    sessionId: string,
    studentId: string,
    status: AttendanceStatus,
  ) => {
    try {
      const result = await updateAttendance(sessionId, studentId, status);
      setSessions(result.sessions as CourseSession[]);
      showToast(`Attendance marked ${status}`);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Attendance update failed',
      );
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      await resolveAlert(alertId);
      setAlerts((prev) =>
        prev.map((a) => (a.id === alertId ? { ...a, resolved: true } : a)),
      );
      showToast('Alert marked resolved');
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Could not resolve alert',
      );
    }
  };

  const handleInspectStudentById = (studentId: string) => {
    setSelectedStudentId(studentId);
  };

  const handleSuperAdminLogin = async (username: string, password: string) => {
    const session = await loginSuperAdmin(username, password);
    saveSuperAdminSession(session);
    setAdminSession(session);
    setActiveScreen('admin');
    showToast('Signed in as Super Admin');
  };

  const handleSuperAdminLogout = () => {
    clearSuperAdminSession();
    setAdminSession(null);
    if (activeScreen === 'admin') setActiveScreen('overview');
    showToast('Super Admin signed out');
  };

  const handleSaveSession = async (
    sessionId: string,
    payload: Parameters<typeof updateSessionAdmin>[1],
  ) => {
    const result = await updateSessionAdmin(sessionId, payload);
    setSessions(result.sessions as CourseSession[]);
  };

  const handleCreateSession = async (
    payload: Parameters<typeof createSessionAdmin>[0],
  ) => {
    const result = await createSessionAdmin(payload);
    setSessions(result.sessions as CourseSession[]);
  };

  const handleDeleteSession = async (sessionId: string) => {
    const result = await deleteSessionAdmin(sessionId);
    setSessions(result.sessions as CourseSession[]);
  };

  const handleSaveFaculty = async (
    facultyId: string,
    payload: Parameters<typeof updateFacultyAdmin>[1],
  ) => {
    const result = await updateFacultyAdmin(facultyId, payload);
    setFaculty(result.faculty as FacultyMember[]);
    showToast('Faculty record updated');
  };

  const handleCreateFaculty = async (
    payload: Parameters<typeof createFacultyAdmin>[0],
  ) => {
    const result = await createFacultyAdmin(payload);
    setFaculty(result.faculty as FacultyMember[]);
    showToast('Faculty member added');
  };

  const handleDeleteFaculty = async (facultyId: string) => {
    const result = await deleteFacultyAdmin(facultyId);
    setFaculty(result.faculty as FacultyMember[]);
    showToast('Faculty member deleted');
  };

  const handleSaveMilestone = async (
    milestoneId: number,
    payload: Parameters<typeof updateMilestoneAdmin>[1],
  ) => {
    const result = await updateMilestoneAdmin(milestoneId, payload);
    setMilestones(result.milestones);
  };

  const handleCreateMilestone = async (
    payload: Parameters<typeof createMilestoneAdmin>[0],
  ) => {
    const result = await createMilestoneAdmin(payload);
    setMilestones(result.milestones);
  };

  const handleDeleteMilestone = async (milestoneId: number) => {
    const result = await deleteMilestoneAdmin(milestoneId);
    setMilestones(result.milestones);
  };

  const handleSaveStudentAdmin = async (
    studentId: string,
    payload: Parameters<typeof updateStudentAdmin>[1],
  ) => {
    const result = await updateStudentAdmin(studentId, payload);
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? result.student : s)),
    );
  };

  const handleSaveDivision = async (
    division: string,
    payload: Parameters<typeof updateDivisionAdmin>[1],
  ) => {
    const result = await updateDivisionAdmin(division, payload);
    setDivisions(result.divisions as DivisionPerformance[]);
  };

  useEffect(() => {
    if (!isSuperAdmin && activeScreen === 'admin') {
      setActiveScreen('overview');
    }
  }, [isSuperAdmin, activeScreen]);

  const selectedStudent =
    students.find((s) => s.id === selectedStudentId) ?? null;

  const currentNavLabel =
    NAV_ITEMS.find((item) => item.id === activeScreen)?.label ?? 'Dashboard';

  return (
    <div className="h-screen w-full flex overflow-hidden bg-[#f2f6f4] text-[#12261f]">
      <aside
        className={`hidden lg:flex flex-col bg-[#0c3b2e] text-white border-r border-[#164a3a] transition-[width] duration-200 ease-out shrink-0 ${
          sidebarCollapsed ? 'w-[72px]' : 'w-[264px]'
        }`}
      >
        <div className="h-16 px-4 flex items-center justify-between border-b border-[#164a3a]">
          <button
            type="button"
            onClick={() => handleNavigate('overview')}
            className="flex items-center gap-3 min-w-0 text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-[#c45c26] flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <span className="font-display font-bold text-sm tracking-tight text-white whitespace-nowrap truncate">
                {SCHOOL.shortName} ERP
              </span>
            )}
          </button>

          {!sidebarCollapsed && (
            <button
              type="button"
              onClick={() => setSidebarCollapsed(true)}
              aria-label="Collapse sidebar"
              className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-[#9bb5a8] hover:text-white hover:bg-[#164a3a] transition-colors shrink-0"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        {!sidebarCollapsed && (
          <div className="px-4 py-3 border-b border-[#164a3a]">
            <div className="text-[11px] font-semibold text-[#d4ebe0] leading-snug">
              {SCHOOL.name}
            </div>
            <div className="text-[10px] text-[#9bb5a8] mt-0.5">
              {SCHOOL.affiliation}
            </div>
          </div>
        )}

        <nav className="flex-1 p-3 space-y-1" aria-label="College modules">
          {NAV_ITEMS.map(({ id, label, Icon }) => {
            const active = activeScreen === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleNavigate(id)}
                title={sidebarCollapsed ? label : undefined}
                className={`w-full h-10 px-3 rounded-lg flex items-center gap-3 text-sm font-medium transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-[#0b6b4c] text-white'
                    : 'text-[#c5ddd0] hover:bg-[#164a3a] hover:text-white'
                } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
              >
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                {!sidebarCollapsed && <span className="truncate">{label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[#164a3a]">
          {sidebarCollapsed ? (
            <button
              type="button"
              onClick={() => setSidebarCollapsed(false)}
              aria-label="Expand sidebar"
              className="w-full h-10 rounded-lg inline-flex items-center justify-center text-[#9bb5a8] hover:text-white hover:bg-[#164a3a] transition-colors"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-3 px-2 py-1.5">
              {isSuperAdmin ? (
                <div className="w-9 h-9 rounded-full bg-[#c45c26] inline-flex items-center justify-center border border-[#e08a55] shrink-0">
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
              ) : (
                <ResilientImage
                  src={IMAGES.deanPortrait}
                  alt="Dr. Rajesh Krishnan"
                  fallbackTitle="RK"
                  className="w-9 h-9 rounded-full object-cover border border-[#2d6b55] shrink-0"
                />
              )}
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white truncate">
                  {isSuperAdmin ? 'Super Admin' : 'Dr. Rajesh Krishnan'}
                </div>
                <div className="text-[11px] text-[#9bb5a8] truncate">
                  {isSuperAdmin
                    ? `Full edit access · ${SCHOOL.shortName}`
                    : `Director · ${SCHOOL.shortName}`}
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      <AnimatePresence>
        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileNavOpen(false)}
              className="fixed inset-0 bg-[#0c3b2e]/50 backdrop-blur-[2px]"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 w-72 bg-[#0c3b2e] text-white h-full flex flex-col"
            >
              <div className="h-16 px-4 flex items-center justify-between border-b border-[#164a3a]">
                <span className="font-display font-bold text-sm text-white">
                  {SCHOOL.shortName} ERP
                </span>
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  aria-label="Close navigation menu"
                  className="w-9 h-9 rounded-lg inline-flex items-center justify-center text-[#9bb5a8] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="px-4 py-3 border-b border-[#164a3a]">
                <div className="text-[11px] font-semibold text-[#d4ebe0]">
                  {SCHOOL.name}
                </div>
                <div className="text-[10px] text-[#9bb5a8] mt-0.5">
                  {SCHOOL.affiliation}
                </div>
              </div>
              <nav className="flex-1 p-3 space-y-1">
                {NAV_ITEMS.map(({ id, label, Icon }) => {
                  const active = activeScreen === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleNavigate(id)}
                      className={`w-full h-11 px-3 rounded-lg flex items-center gap-3 text-sm font-medium transition-colors ${
                        active
                          ? 'bg-[#0b6b4c] text-white'
                          : 'text-[#c5ddd0] hover:bg-[#164a3a] hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{label}</span>
                    </button>
                  );
                })}
              </nav>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <header className="h-16 bg-white/95 backdrop-blur-xs border-b border-[#d5e2db] px-4 md:px-8 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden w-10 h-10 rounded-lg border border-[#d5e2db] inline-flex items-center justify-center text-[#12261f] hover:bg-[#f5faf7] shrink-0"
            >
              <Menu className="w-4 h-4" />
            </button>

            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-sm min-w-0 whitespace-nowrap"
            >
              <button
                type="button"
                onClick={() => handleNavigate('overview')}
                className="text-[#3d5248] hover:text-[#12261f] font-medium transition-colors"
              >
                {SCHOOL.shortName}
              </button>
              <span className="text-[#a9cbb8]" aria-hidden="true">
                /
              </span>
              <span className="font-display font-semibold text-[#12261f] truncate">
                {currentNavLabel}
              </span>
              <span className="hidden sm:inline text-[11px] font-medium text-[#0b6b4c] bg-[#e7f0eb] px-2 py-0.5 rounded ml-1">
                {SCHOOL.academicYear}
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {isSuperAdmin ? (
              <>
                <span className="hidden md:inline text-[11px] font-semibold text-[#0b6b4c] bg-[#e7f0eb] px-2.5 py-1 rounded-lg">
                  Super Admin
                </span>
                <button
                  type="button"
                  onClick={handleSuperAdminLogout}
                  className="h-10 px-3 rounded-lg border border-[#d5e2db] bg-white text-xs sm:text-sm font-semibold text-[#12261f] hover:bg-[#f5faf7] inline-flex items-center gap-2 transition-colors whitespace-nowrap"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setAdminLoginOpen(true)}
                className="h-10 px-3 rounded-lg border border-[#d5e2db] bg-white text-xs sm:text-sm font-semibold text-[#12261f] hover:bg-[#f5faf7] inline-flex items-center gap-2 transition-colors whitespace-nowrap"
              >
                <ShieldCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Super Admin</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setEnrollModalOpen(true)}
              className="h-10 px-4 rounded-lg bg-[#0b6b4c] text-xs sm:text-sm font-semibold text-white hover:bg-[#095a40] inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>New Admission</span>
            </button>
          </div>
        </header>

        <main
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto px-4 md:px-8 pt-6"
        >
          <div className="max-w-[1600px] mx-auto">
            {loading ? (
              <div className="card-level-1 rounded-2xl p-10 text-center">
                <p className="font-display text-lg font-semibold text-[#12261f]">
                  Loading college database…
                </p>
                <p className="text-sm text-[#3d5248] mt-1">
                  Reading SQLite tables from the API
                </p>
              </div>
            ) : loadError ? (
              <div className="card-level-1 rounded-2xl p-10 text-center">
                <p className="font-display text-lg font-semibold text-[#be123c]">
                  Database connection failed
                </p>
                <p className="text-sm text-[#3d5248] mt-1 max-w-lg mx-auto">
                  {loadError}
                </p>
                <p className="text-xs text-[#6b8578] mt-3">
                  Run <code className="font-mono">npm run serve</code> so both
                  the API (port 3001) and UI (port 3000) start together.
                </p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeScreen}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                >
                  {activeScreen === 'overview' && (
                    <OverviewScreen
                      scrollContainerRef={scrollContainerRef}
                      students={students}
                      invoices={invoices}
                      sessions={sessions}
                      alerts={alerts}
                      divisions={divisions}
                      onNavigate={handleNavigate}
                      onOpenEnrollModal={() => setEnrollModalOpen(true)}
                      onResolveAlert={handleResolveAlert}
                      onInspectStudent={handleInspectStudentById}
                    />
                  )}

                  {activeScreen === 'students' && (
                    <StudentsScreen
                      students={students}
                      onSelectStudent={(student) =>
                        setSelectedStudentId(student.id)
                      }
                      onOpenEnrollModal={() => setEnrollModalOpen(true)}
                    />
                  )}

                  {activeScreen === 'bursar' && (
                    <BursarScreen
                      invoices={invoices}
                      onMarkInvoicesPaid={handleMarkInvoicesPaid}
                      onSendReminders={handleSendReminders}
                    />
                  )}

                  {activeScreen === 'faculty' && (
                    <FacultyScreen
                      sessions={sessions}
                      faculty={faculty}
                      isSuperAdmin={isSuperAdmin}
                      onUpdateAttendance={handleUpdateAttendance}
                      onSaveFaculty={handleSaveFaculty}
                      onCreateFaculty={handleCreateFaculty}
                      onDeleteFaculty={handleDeleteFaculty}
                    />
                  )}

                  {activeScreen === 'campus' && (
                    <CampusScreen
                      scrollContainerRef={scrollContainerRef}
                      divisions={divisions}
                      milestones={milestones}
                      onNavigate={handleNavigate}
                    />
                  )}

                  {activeScreen === 'admin' && isSuperAdmin && (
                    <AdminScreen
                      sessions={sessions}
                      faculty={faculty}
                      milestones={milestones}
                      students={students}
                      divisions={divisions}
                      onSaveSession={handleSaveSession}
                      onCreateSession={handleCreateSession}
                      onDeleteSession={handleDeleteSession}
                      onSaveFaculty={handleSaveFaculty}
                      onCreateFaculty={handleCreateFaculty}
                      onDeleteFaculty={handleDeleteFaculty}
                      onSaveMilestone={handleSaveMilestone}
                      onCreateMilestone={handleCreateMilestone}
                      onDeleteMilestone={handleDeleteMilestone}
                      onSaveStudent={handleSaveStudentAdmin}
                      onSaveDivision={handleSaveDivision}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </main>
      </div>

      <EnrollStudentModal
        isOpen={enrollModalOpen}
        onClose={() => setEnrollModalOpen(false)}
        onEnroll={handleEnrollStudent}
      />

      <SuperAdminLoginModal
        isOpen={adminLoginOpen}
        onClose={() => setAdminLoginOpen(false)}
        onLogin={handleSuperAdminLogin}
      />

      <StudentDetailDrawer
        student={selectedStudent}
        onClose={() => setSelectedStudentId(null)}
        onUpdateStatus={handleUpdateStudentStatus}
        onClearBalance={handleClearStudentBalance}
      />

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.18 }}
            role="status"
            aria-live="polite"
            className="fixed bottom-5 right-5 z-50 rounded-xl bg-[#0c3b2e] text-white px-4 py-3 text-xs font-semibold shadow-[0_10px_15px_-3px_rgba(12,59,46,0.25)] border border-[#2d6b55]"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
