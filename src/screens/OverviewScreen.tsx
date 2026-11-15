import { RefObject, useState } from 'react';
import {
  ArrowUpRight,
  Check,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  BursarInvoice,
  CourseSession,
  DivisionPerformance,
  formatINR,
  IMAGES,
  OperationalAlert,
  SCHOOL,
  ScreenId,
  StudentRecord,
} from '../data/academicData';
import { ParallaxBanner, ParallaxReveal } from '../components/ParallaxLayer';
import { StatusIndicator } from '../components/StatusIndicator';

interface OverviewScreenProps {
  scrollContainerRef: RefObject<HTMLElement | null>;
  students: StudentRecord[];
  invoices: BursarInvoice[];
  sessions: CourseSession[];
  alerts: OperationalAlert[];
  divisions: DivisionPerformance[];
  onNavigate: (screen: ScreenId) => void;
  onOpenEnrollModal: () => void;
  onResolveAlert: (alertId: string) => void | Promise<void>;
  onInspectStudent: (studentId: string) => void;
}

type ChartMetric = 'enrollment' | 'tuition' | 'attendance';

export function OverviewScreen({
  scrollContainerRef,
  students,
  invoices,
  sessions,
  alerts,
  divisions,
  onNavigate,
  onOpenEnrollModal,
  onResolveAlert,
  onInspectStudent,
}: OverviewScreenProps) {
  const [chartMetric, setChartMetric] = useState<ChartMetric>('enrollment');
  const [hoveredDivision, setHoveredDivision] = useState<string | null>(null);

  const totalCollected = invoices
    .filter((inv) => inv.status === 'Paid')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const totalBilled = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const collectionPct = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;

  const rosterRecords = sessions.flatMap((s) => s.roster);
  const presentCount = rosterRecords.filter((r) => r.attendance === 'Present').length;
  const liveAttendancePct =
    rosterRecords.length > 0
      ? ((presentCount / rosterRecords.length) * 100).toFixed(1)
      : '94.2';

  const activeAlerts = alerts.filter((a) => !a.resolved);
  const enrolledTotal = 2100 + (students.length - 8);

  const kpis = [
    {
      label: 'Total Enrolment',
      value: enrolledTotal.toLocaleString('en-IN'),
      delta: '+4.1% vs 2024–25',
      positive: true,
      target: 'students' as ScreenId,
      actionLabel: 'Students',
    },
    {
      label: 'Fees Collected',
      value: formatINR(totalCollected + 48240000),
      delta: `${collectionPct}% sample ledger settled`,
      positive: true,
      target: 'bursar' as ScreenId,
      actionLabel: 'Fees',
    },
    {
      label: 'Today\'s Attendance',
      value: `${liveAttendancePct}%`,
      delta: `${activeAlerts.length} pending alerts`,
      positive: Number(liveAttendancePct) >= 75,
      target: 'faculty' as ScreenId,
      actionLabel: 'Mark Roll',
    },
    {
      label: 'Faculty Load',
      value: '90.8%',
      delta: '16 lectures scheduled today',
      positive: true,
      target: 'campus' as ScreenId,
      actionLabel: 'Campus',
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      <ParallaxBanner
        scrollContainerRef={scrollContainerRef}
        imageSrc={IMAGES.campusHero}
        imageAlt="Aryavarta Institute of Technology campus academic block"
        heightClass="min-h-[260px] md:min-h-[300px]"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs font-medium text-[#d4ebe0] flex items-center gap-2">
            <span>{SCHOOL.academicYear}</span>
            <span aria-hidden="true">·</span>
            <span>Campus Operations</span>
            <span aria-hidden="true">·</span>
            <span>AICTE · AKTU</span>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('campus')}
            className="text-xs font-semibold text-white/90 hover:text-white inline-flex items-center gap-1 transition-colors whitespace-nowrap shrink-0"
          >
            <span>View Campus Facilities</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="max-w-2xl my-6">
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight [text-wrap:balance]">
            {SCHOOL.name}
          </h1>
          <p className="text-sm sm:text-base text-[#d4ebe0]/95 mt-2.5 max-w-xl leading-relaxed">
            College ERP dashboard for admissions, departmental attendance, semester fee collection and lecture schedules — aligned with Indian campus systems like TCS iON and Academia.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onOpenEnrollModal}
            className="h-10 px-5 rounded-lg bg-[#c45c26] text-sm font-semibold text-white hover:bg-[#a84d1f] transition-colors whitespace-nowrap shrink-0"
          >
            New Admission
          </button>
          <button
            type="button"
            onClick={() => onNavigate('bursar')}
            className="h-10 px-4 rounded-lg bg-white/12 text-sm font-semibold text-white border border-white/20 hover:bg-white/20 backdrop-blur-xs transition-colors whitespace-nowrap shrink-0"
          >
            Open Fee Collection
          </button>
        </div>
      </ParallaxBanner>

      <ParallaxReveal delay={0.04}>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="card-interactive rounded-2xl p-5 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-semibold text-[#3d5248]">
                  {kpi.label}
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate(kpi.target)}
                  className="text-xs font-semibold text-[#0a5c40] hover:text-[#095a40] inline-flex items-center gap-0.5 whitespace-nowrap shrink-0"
                >
                  <span>{kpi.actionLabel}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="mt-3">
                <div className="font-display text-2xl md:text-3xl font-bold text-[#12261f] tabular-nums tracking-tight">
                  {kpi.value}
                </div>
                <div className="flex items-center gap-1.5 mt-1.5 text-xs font-medium text-[#3d5248]">
                  <TrendingUp
                    className={`w-3.5 h-3.5 shrink-0 ${
                      kpi.positive ? 'text-[#047857]' : 'text-[#b45309]'
                    }`}
                  />
                  <span>{kpi.delta}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ParallaxReveal>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <ParallaxReveal delay={0.08} className="lg:col-span-7">
          <div className="card-level-1 rounded-2xl p-6 h-full flex flex-col justify-between">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#d5e2db]">
              <div>
                <h2 className="font-display text-lg font-semibold text-[#12261f]">
                  Department Strength &amp; Collections
                </h2>
                <p className="text-xs text-[#3d5248] mt-0.5">
                  CSE, ECE, Mechanical and Business Administration at a glance
                </p>
              </div>

              <div
                className="inline-flex items-center gap-1 p-1 rounded-lg bg-[#e7f0eb]"
                role="tablist"
                aria-label="Stream chart metric"
              >
                {(
                  [
                    { id: 'enrollment', label: 'Strength' },
                    { id: 'tuition', label: 'Fees Cleared' },
                    { id: 'attendance', label: 'Attendance' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={chartMetric === tab.id}
                    onClick={() => setChartMetric(tab.id)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                      chartMetric === tab.id
                        ? 'bg-white text-[#12261f] shadow-xs'
                        : 'text-[#3d5248] hover:text-[#12261f]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 items-end h-56 pt-8 pb-2">
              {divisions.map((item) => {
                const value =
                  chartMetric === 'enrollment'
                    ? Math.round((item.enrolled / item.capacity) * 100)
                    : chartMetric === 'tuition'
                    ? item.tuitionClearedPct
                    : item.attendancePct;

                const displayLabel =
                  chartMetric === 'enrollment'
                    ? `${item.enrolled}/${item.capacity}`
                    : `${value.toFixed(1)}%`;

                const isHovered = hoveredDivision === item.division;

                return (
                  <div
                    key={item.division}
                    onMouseEnter={() => setHoveredDivision(item.division)}
                    onMouseLeave={() => setHoveredDivision(null)}
                    className="flex flex-col items-center h-full justify-end group"
                  >
                    <span
                      className={`font-mono text-xs font-semibold tabular-nums mb-2 transition-colors ${
                        isHovered ? 'text-[#0a5c40]' : 'text-[#3d5248]'
                      }`}
                    >
                      {displayLabel}
                    </span>
                    <div className="w-full max-w-[72px] h-36 bg-[#e7f0eb] rounded-lg flex items-end overflow-hidden p-1">
                      <motion.div
                        key={`${item.division}-${chartMetric}`}
                        initial={{ scaleY: 0 }}
                        animate={{ scaleY: value / 100 }}
                        transition={{
                          duration: 0.35,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                        style={{ transformOrigin: 'bottom' }}
                        className={`w-full h-full rounded-md transition-colors ${
                          chartMetric === 'tuition'
                            ? 'bg-[#c45c26]'
                            : chartMetric === 'attendance'
                            ? 'bg-[#10b981]'
                            : 'bg-[#0b6b4c]'
                        } ${isHovered ? 'opacity-100' : 'opacity-90'}`}
                      />
                    </div>
                    <span className="text-xs font-medium text-[#12261f] text-center mt-2.5 leading-tight min-h-[2.5rem]">
                      {item.division === 'Computer Science & Engg.' ? (
                        <>
                          <span className="block">CSE</span>
                          <span className="block text-[10px] font-normal text-[#3d5248] mt-0.5">
                            Computer Science &amp; Engg.
                          </span>
                        </>
                      ) : item.division === 'Electronics & Communication' ? (
                        <>
                          <span className="block">ECE</span>
                          <span className="block text-[10px] font-normal text-[#3d5248] mt-0.5">
                            Electronics &amp; Communication
                          </span>
                        </>
                      ) : item.division === 'Mechanical Engineering' ? (
                        <>
                          <span className="block">ME</span>
                          <span className="block text-[10px] font-normal text-[#3d5248] mt-0.5">
                            Mechanical Engineering
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="block">MBA/BBA</span>
                          <span className="block text-[10px] font-normal text-[#3d5248] mt-0.5">
                            Business Administration
                          </span>
                        </>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </ParallaxReveal>

        <ParallaxReveal delay={0.12} className="lg:col-span-5">
          <div className="card-level-1 rounded-2xl p-6 h-full flex flex-col">
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#d5e2db]">
              <div>
                <h2 className="font-display text-lg font-semibold text-[#12261f]">
                  Pending Campus Actions
                </h2>
                <p className="text-xs text-[#3d5248] mt-0.5">
                  {activeAlerts.length} items for academics / accounts follow-up
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('students')}
                className="text-xs font-semibold text-[#0a5c40] hover:text-[#095a40] whitespace-nowrap shrink-0"
              >
                All Students
              </button>
            </div>

            <div className="divide-y divide-[#d5e2db] flex-1">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`py-4 flex flex-col gap-2 transition-opacity ${
                    alert.resolved ? 'opacity-50' : 'opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-[#3d5248]">
                      <span className="font-semibold text-[#12261f]">
                        {alert.category === 'Bursar'
                          ? 'Fees'
                          : alert.category === 'Enrollment'
                            ? 'Admission'
                            : alert.category}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{alert.timestamp}</span>
                    </div>
                    <StatusIndicator status={alert.severity} />
                  </div>
                  <p className="text-sm font-semibold text-[#12261f]">
                    {alert.title}
                  </p>
                  <p className="text-xs text-[#3d5248] leading-relaxed">
                    {alert.detail}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => onInspectStudent(alert.studentId)}
                      className="h-8 px-3 rounded-md border border-[#d5e2db] bg-white text-xs font-semibold text-[#12261f] hover:bg-[#f5faf7] transition-colors whitespace-nowrap"
                    >
                      Open Profile
                    </button>
                    <button
                      type="button"
                      onClick={() => onResolveAlert(alert.id)}
                      disabled={alert.resolved}
                      className="h-8 px-3 rounded-md bg-[#e7f0eb] text-xs font-semibold text-[#0a5c40] hover:bg-[#c5ddd0] disabled:opacity-50 inline-flex items-center gap-1 transition-colors whitespace-nowrap"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{alert.resolved ? 'Resolved' : 'Mark Resolved'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ParallaxReveal>
      </div>

      <ParallaxReveal delay={0.16}>
        <div className="card-level-1 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#d5e2db] flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold text-[#12261f]">
                Today&apos;s Lecture Timetable
              </h2>
              <p className="text-xs text-[#3d5248] mt-0.5">
                Course strength and faculty assignments for today
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('faculty')}
              className="h-9 px-3.5 rounded-lg border border-[#d5e2db] bg-white text-xs font-semibold text-[#12261f] hover:bg-[#f5faf7] transition-colors whitespace-nowrap shrink-0"
            >
              Take Attendance
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f5faf7] border-b border-[#d5e2db] text-[11px] font-semibold text-[#5a7266] uppercase tracking-wider">
                  <th className="py-3 px-6">Course</th>
                  <th className="py-3 px-4">Faculty</th>
                  <th className="py-3 px-4">Room &amp; Timing</th>
                  <th className="py-3 px-4 text-right">Enrolment</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d5e2db] text-sm">
                {sessions.map((session) => (
                  <tr
                    key={session.id}
                    className="hover:bg-[#f5faf7] transition-colors"
                  >
                    <td className="py-3.5 px-6">
                      <div className="font-mono text-xs font-semibold text-[#0a5c40]">
                        {session.code}
                      </div>
                      <div className="font-medium text-[#12261f]">
                        {session.title}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#3d5248]">
                      {session.instructor}
                    </td>
                    <td className="py-3.5 px-4 text-[#3d5248]">
                      <div>{session.room}</div>
                      <div className="font-mono text-xs text-[#6b8578] tabular-nums">
                        {session.schedule}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-xs font-semibold text-[#12261f] tabular-nums">
                      {session.enrolledCount} / {session.capacity}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        type="button"
                        onClick={() => onNavigate('faculty')}
                        className="text-xs font-semibold text-[#0a5c40] hover:text-[#095a40] whitespace-nowrap"
                      >
                        Open Roll
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ParallaxReveal>
    </div>
  );
}
