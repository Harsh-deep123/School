import { useRef, useState } from 'react';
import {
  Building2,
  CalendarCheck2,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AttendanceStatus,
  BursarInvoice,
  CourseSession,
  EnrollmentStatus,
  IMAGES,
  INITIAL_ALERTS,
  INITIAL_INVOICES,
  INITIAL_SESSIONS,
  INITIAL_STUDENTS,
  OperationalAlert,
  ScreenId,
  StudentRecord,
} from './data/academicData';
import { OverviewScreen } from './screens/OverviewScreen';
import { StudentsScreen } from './screens/StudentsScreen';
import { BursarScreen } from './screens/BursarScreen';
import { FacultyScreen } from './screens/FacultyScreen';
import { CampusScreen } from './screens/CampusScreen';
import { EnrollStudentModal } from './components/EnrollStudentModal';
import { StudentDetailDrawer } from './components/StudentDetailDrawer';
import { ResilientImage } from './components/ResilientImage';

const NAV_ITEMS: {
  id: ScreenId;
  label: string;
  Icon: typeof LayoutDashboard;
}[] = [
  { id: 'overview', label: 'Overview', Icon: LayoutDashboard },
  { id: 'students', label: 'Student Directory', Icon: Users },
  { id: 'bursar', label: 'Bursar Ledger', Icon: CreditCard },
  { id: 'faculty', label: 'Faculty & Roll', Icon: CalendarCheck2 },
  { id: 'campus', label: 'Campus & Labs', Icon: Building2 },
];

export default function App() {
  const scrollContainerRef = useRef<HTMLElement>(null);

  const [activeScreen, setActiveScreen] = useState<ScreenId>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [students, setStudents] = useState<StudentRecord[]>(INITIAL_STUDENTS);
  const [invoices, setInvoices] = useState<BursarInvoice[]>(INITIAL_INVOICES);
  const [sessions, setSessions] = useState<CourseSession[]>(INITIAL_SESSIONS);
  const [alerts, setAlerts] = useState<OperationalAlert[]>(INITIAL_ALERTS);

  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    window.setTimeout(() => {
      setToastMessage((curr) => (curr === message ? null : curr));
    }, 3400);
  };

  const handleNavigate = (screen: ScreenId) => {
    setActiveScreen(screen);
    setMobileNavOpen(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleEnrollStudent = (
    newStudentData: Omit<StudentRecord, 'id'>,
    tuitionAmount: number,
  ) => {
    const nextNum = 465 + students.length;
    const studentId = `STU-2026-0${nextNum}`;
    const invoiceId = `INV-2026-${8850 + invoices.length}`;

    const createdStudent: StudentRecord = {
      id: studentId,
      ...newStudentData,
    };

    const createdInvoice: BursarInvoice = {
      id: invoiceId,
      studentId,
      studentName: newStudentData.name,
      division: newStudentData.division,
      term: 'Fall 2026',
      description: `${newStudentData.program} · Initial Enrollment Assessment`,
      dueDate: '2026-12-01',
      amount: tuitionAmount,
      status: tuitionAmount === 0 ? 'Paid' : 'Pending',
    };

    setStudents((prev) => [createdStudent, ...prev]);
    setInvoices((prev) => [createdInvoice, ...prev]);
    showToast(`Enrolled ${newStudentData.name} (${studentId})`);
  };

  const handleUpdateStudentStatus = (
    studentId: string,
    status: EnrollmentStatus,
  ) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, status } : s)),
    );
    showToast(`Updated academic standing to ${status}`);
  };

  const handleClearStudentBalance = (studentId: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, tuitionBalance: 0 } : s)),
    );
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.studentId === studentId ? { ...inv, status: 'Paid' } : inv,
      ),
    );
    showToast(`Recorded full tuition settlement for ${studentId}`);
  };

  const handleMarkInvoicesPaid = (invoiceIds: string[]) => {
    const affectedStudentIds = new Set(
      invoices
        .filter((inv) => invoiceIds.includes(inv.id))
        .map((inv) => inv.studentId),
    );

    setInvoices((prev) =>
      prev.map((inv) =>
        invoiceIds.includes(inv.id) ? { ...inv, status: 'Paid' } : inv,
      ),
    );

    setStudents((prev) =>
      prev.map((s) =>
        affectedStudentIds.has(s.id) ? { ...s, tuitionBalance: 0 } : s,
      ),
    );

    showToast(
      `Marked ${invoiceIds.length} ${
        invoiceIds.length === 1 ? 'invoice' : 'invoices'
      } as Paid`,
    );
  };

  const handleSendReminders = (invoiceIds: string[]) => {
    showToast(
      `Dispatched bursar notice for ${invoiceIds.length} ${
        invoiceIds.length === 1 ? 'account' : 'accounts'
      }`,
    );
  };

  const handleUpdateAttendance = (
    sessionId: string,
    studentId: string,
    status: AttendanceStatus,
  ) => {
    setSessions((prev) =>
      prev.map((session) =>
        session.id !== sessionId
          ? session
          : {
              ...session,
              roster: session.roster.map((entry) =>
                entry.studentId === studentId
                  ? { ...entry, attendance: status }
                  : entry,
              ),
            },
      ),
    );
    showToast(`Attendance set to ${status}`);
  };

  const handleResolveAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, resolved: true } : a)),
    );
    showToast('Administrative alert marked resolved');
  };

  const handleInspectStudentById = (studentId: string) => {
    setSelectedStudentId(studentId);
  };

  const selectedStudent =
    students.find((s) => s.id === selectedStudentId) ?? null;

  const currentNavLabel =
    NAV_ITEMS.find((item) => item.id === activeScreen)?.label ?? 'Overview';

  return (
    <div className="h-screen w-full flex overflow-hidden bg-[#f8f9ff] text-[#0b1c30]">
      {/* Desktop Left-Rail Navigation */}
      <aside
        className={`hidden lg:flex flex-col bg-[#0f172a] text-white border-r border-[#1e293b] transition-[width] duration-200 ease-out shrink-0 ${
          sidebarCollapsed ? 'w-[72px]' : 'w-[264px]'
        }`}
      >
        <div className="h-16 px-4 flex items-center justify-between border-b border-[#1e293b]">
          <button
            type="button"
            onClick={() => handleNavigate('overview')}
            className="flex items-center gap-3 min-w-0 text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-[#2563eb] flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <span className="font-display font-bold text-sm tracking-tight text-white whitespace-nowrap truncate">
                Academic Intelligence
              </span>
            )}
          </button>

          {!sidebarCollapsed && (
            <button
              type="button"
              onClick={() => setSidebarCollapsed(true)}
              aria-label="Collapse sidebar"
              className="w-8 h-8 rounded-lg inline-flex items-center justify-center text-[#94a3b8] hover:text-white hover:bg-[#1e293b] transition-colors shrink-0"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-1" aria-label="Workspace modules">
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
                    ? 'bg-[#2563eb] text-white'
                    : 'text-[#cbd5e1] hover:bg-[#1e293b] hover:text-white'
                } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
              >
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                {!sidebarCollapsed && <span className="truncate">{label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[#1e293b]">
          {sidebarCollapsed ? (
            <button
              type="button"
              onClick={() => setSidebarCollapsed(false)}
              aria-label="Expand sidebar"
              className="w-full h-10 rounded-lg inline-flex items-center justify-center text-[#94a3b8] hover:text-white hover:bg-[#1e293b] transition-colors"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-3 px-2 py-1.5">
              <ResilientImage
                src={IMAGES.deanPortrait}
                alt="Dr. Arthur Pendelton"
                fallbackTitle="AP"
                className="w-9 h-9 rounded-full object-cover border border-[#334155] shrink-0"
              />
              <div className="min-w-0">
                <div className="text-xs font-semibold text-white truncate">
                  Dr. Arthur Pendelton
                </div>
                <div className="text-[11px] text-[#94a3b8] truncate">
                  Provost · Alder &amp; Vale
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileNavOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileNavOpen(false)}
              className="fixed inset-0 bg-[#0f172a]/50 backdrop-blur-[2px]"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 w-72 bg-[#0f172a] text-white h-full flex flex-col"
            >
              <div className="h-16 px-4 flex items-center justify-between border-b border-[#1e293b]">
                <span className="font-display font-bold text-sm text-white">
                  Academic Intelligence
                </span>
                <button
                  type="button"
                  onClick={() => setMobileNavOpen(false)}
                  aria-label="Close navigation menu"
                  className="w-9 h-9 rounded-lg inline-flex items-center justify-center text-[#94a3b8] hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
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
                          ? 'bg-[#2563eb] text-white'
                          : 'text-[#cbd5e1] hover:bg-[#1e293b] hover:text-white'
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

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header Bar (SaaS Top Bar Contract) */}
        <header className="h-16 bg-white/95 backdrop-blur-xs border-b border-[#e2e8f0] px-4 md:px-8 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden w-10 h-10 rounded-lg border border-[#e2e8f0] inline-flex items-center justify-center text-[#0b1c30] hover:bg-[#f8fafc] shrink-0"
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
                className="text-[#434655] hover:text-[#0b1c30] font-medium transition-colors"
              >
                Alder &amp; Vale
              </button>
              <span className="text-[#c3c6d7]" aria-hidden="true">
                /
              </span>
              <span className="font-display font-semibold text-[#0b1c30] truncate">
                {currentNavLabel}
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setEnrollModalOpen(true)}
              className="h-10 px-4 rounded-lg bg-[#2563eb] text-xs sm:text-sm font-semibold text-white hover:bg-[#1d4ed8] inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>Enroll Student</span>
            </button>
          </div>
        </header>

        {/* Scrollable Workspace Viewport */}
        <main
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto px-4 md:px-8 pt-6"
        >
          <div className="max-w-[1600px] mx-auto">
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
                    onUpdateAttendance={handleUpdateAttendance}
                  />
                )}

                {activeScreen === 'campus' && (
                  <CampusScreen
                    scrollContainerRef={scrollContainerRef}
                    onNavigate={handleNavigate}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Dialogs & Detail Drawer */}
      <EnrollStudentModal
        isOpen={enrollModalOpen}
        onClose={() => setEnrollModalOpen(false)}
        onEnroll={handleEnrollStudent}
      />

      <StudentDetailDrawer
        student={selectedStudent}
        onClose={() => setSelectedStudentId(null)}
        onUpdateStatus={handleUpdateStudentStatus}
        onClearBalance={handleClearStudentBalance}
      />

      {/* Action Confirmation Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.18 }}
            role="status"
            aria-live="polite"
            className="fixed bottom-5 right-5 z-50 rounded-xl bg-[#0f172a] text-white px-4 py-3 text-xs font-semibold shadow-[0_10px_15px_-3px_rgba(15,23,42,0.2)] border border-[#334155]"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
