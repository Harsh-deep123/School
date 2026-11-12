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
  DIVISION_METRICS,
  IMAGES,
  OperationalAlert,
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
  onNavigate: (screen: ScreenId) => void;
  onOpenEnrollModal: () => void;
  onResolveAlert: (alertId: string) => void;
  onInspectStudent: (studentId: string) => void;
}

type ChartMetric = 'enrollment' | 'tuition' | 'attendance';

export function OverviewScreen({
  scrollContainerRef,
  students,
  invoices,
  sessions,
  alerts,
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
  const enrolledTotal = 3730 + (students.length - 8);

  const kpis = [
    {
      label: 'Total Term Enrollment',
      value: enrolledTotal.toLocaleString(),
      delta: '+4.2% vs Fall 2025',
      positive: true,
      target: 'students' as ScreenId,
      actionLabel: 'Directory',
    },
    {
      label: 'Ledger Tuition Cleared',
      value: `$${(totalCollected + 4128000).toLocaleString()}`,
      delta: `${collectionPct}% sample ledger settled`,
      positive: true,
      target: 'bursar' as ScreenId,
      actionLabel: 'Bursar',
    },
    {
      label: 'Campus Attendance Rate',
      value: `${liveAttendancePct}%`,
      delta: `${activeAlerts.length} active review flags`,
      positive: Number(liveAttendancePct) >= 85,
      target: 'faculty' as ScreenId,
      actionLabel: 'Roll Call',
    },
    {
      label: 'Faculty Load Utilization',
      value: '90.8%',
      delta: '16 active seminar sections',
      positive: true,
      target: 'campus' as ScreenId,
      actionLabel: 'Campus',
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Parallax Campus Term Hero */}
      <ParallaxBanner
        scrollContainerRef={scrollContainerRef}
        imageSrc={IMAGES.campusHero}
        imageAlt="Alder & Vale University limestone and glass academic pavilion overlooking courtyard"
        heightClass="min-h-[260px] md:min-h-[300px]"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs font-medium text-[#dbe1ff] flex items-center gap-2">
            <span>Fall 2026 Academic Term</span>
            <span aria-hidden="true">·</span>
            <span>Week 10 Operations</span>
            <span aria-hidden="true">·</span>
            <span>All 4 Campus Divisions</span>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('campus')}
            className="text-xs font-semibold text-white/90 hover:text-white inline-flex items-center gap-1 transition-colors whitespace-nowrap shrink-0"
          >
            <span>Explore Campus Architecture</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="max-w-2xl my-6">
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight [text-wrap:balance]">
            Institutional command across enrollment, tuition ledgers, and faculty schedules.
          </h1>
          <p className="text-sm sm:text-base text-[#dbe1ff]/90 mt-2.5 max-w-xl leading-relaxed">
            Monitor real-time bursar settlements, resolve academic standing alerts, and manage daily course attendance from one unified register.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onOpenEnrollModal}
            className="h-10 px-5 rounded-lg bg-[#2563eb] text-sm font-semibold text-white hover:bg-[#1d4ed8] transition-colors whitespace-nowrap shrink-0"
          >
            Enroll Student
          </button>
          <button
            type="button"
            onClick={() => onNavigate('bursar')}
            className="h-10 px-4 rounded-lg bg-white/12 text-sm font-semibold text-white border border-white/20 hover:bg-white/20 backdrop-blur-xs transition-colors whitespace-nowrap shrink-0"
          >
            Inspect Bursar Ledger
          </button>
        </div>
      </ParallaxBanner>

      {/* 4-Column Executive KPI Strip */}
      <ParallaxReveal delay={0.04}>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="card-interactive rounded-2xl p-5 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-semibold text-[#434655]">
                  {kpi.label}
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate(kpi.target)}
                  className="text-xs font-semibold text-[#004ac6] hover:text-[#1d4ed8] inline-flex items-center gap-0.5 whitespace-nowrap shrink-0"
                >
                  <span>{kpi.actionLabel}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="mt-3">
                <div className="font-display text-2xl md:text-3xl font-bold text-[#0b1c30] tabular-nums tracking-tight">
                  {kpi.value}
                </div>
                <div className="flex items-center gap-1.5 mt-1.5 text-xs font-medium text-[#434655]">
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

      {/* Middle Analytical Row: Division Chart + Operational Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <ParallaxReveal delay={0.08} className="lg:col-span-7">
          <div className="card-level-1 rounded-2xl p-6 h-full flex flex-col justify-between">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-[#e2e8f0]">
              <div>
                <h2 className="font-display text-lg font-semibold text-[#0b1c30]">
                  Division Capacity &amp; Fiscal Standing
                </h2>
                <p className="text-xs text-[#434655] mt-0.5">
                  Comparative distribution across the four academic schools
                </p>
              </div>

              <div
                className="inline-flex items-center gap-1 p-1 rounded-lg bg-[#eff4ff]"
                role="tablist"
                aria-label="Division chart metric"
              >
                {(
                  [
                    { id: 'enrollment', label: 'Enrollment' },
                    { id: 'tuition', label: 'Tuition Cleared' },
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
                        ? 'bg-white text-[#0b1c30] shadow-xs'
                        : 'text-[#434655] hover:text-[#0b1c30]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 items-end h-56 pt-8 pb-2">
              {DIVISION_METRICS.map((item) => {
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
                        isHovered ? 'text-[#004ac6]' : 'text-[#434655]'
                      }`}
                    >
                      {displayLabel}
                    </span>
                    <div className="w-full max-w-[72px] h-36 bg-[#eff4ff] rounded-lg flex items-end overflow-hidden p-1">
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
                            ? 'bg-[#0ea5e9]'
                            : chartMetric === 'attendance'
                            ? 'bg-[#10b981]'
                            : 'bg-[#2563eb]'
                        } ${isHovered ? 'opacity-100' : 'opacity-90'}`}
                      />
                    </div>
                    <span className="text-xs font-medium text-[#0b1c30] text-center mt-2.5 leading-tight line-clamp-2">
                      {item.division}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </ParallaxReveal>

        <ParallaxReveal delay={0.12} className="lg:col-span-5">
          <div className="card-level-1 rounded-2xl p-6 h-full flex flex-col">
            <div className="flex items-center justify-between gap-3 pb-4 border-b border-[#e2e8f0]">
              <div>
                <h2 className="font-display text-lg font-semibold text-[#0b1c30]">
                  Administrative Review Queue
                </h2>
                <p className="text-xs text-[#434655] mt-0.5">
                  {activeAlerts.length} pending items requiring registrar or bursar action
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('students')}
                className="text-xs font-semibold text-[#004ac6] hover:text-[#1d4ed8] whitespace-nowrap shrink-0"
              >
                View All Students
              </button>
            </div>

            <div className="divide-y divide-[#e2e8f0] flex-1">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`py-4 flex flex-col gap-2 transition-opacity ${
                    alert.resolved ? 'opacity-50' : 'opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-[#434655]">
                      <span className="font-semibold text-[#0b1c30]">
                        {alert.category}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{alert.timestamp}</span>
                    </div>
                    <StatusIndicator status={alert.severity} />
                  </div>
                  <p className="text-sm font-semibold text-[#0b1c30]">
                    {alert.title}
                  </p>
                  <p className="text-xs text-[#434655] leading-relaxed">
                    {alert.detail}
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => onInspectStudent(alert.studentId)}
                      className="h-8 px-3 rounded-md border border-[#e2e8f0] bg-white text-xs font-semibold text-[#0b1c30] hover:bg-[#f8fafc] transition-colors whitespace-nowrap"
                    >
                      Inspect Student
                    </button>
                    <button
                      type="button"
                      onClick={() => onResolveAlert(alert.id)}
                      disabled={alert.resolved}
                      className="h-8 px-3 rounded-md bg-[#eff4ff] text-xs font-semibold text-[#004ac6] hover:bg-[#dce9ff] disabled:opacity-50 inline-flex items-center gap-1 transition-colors whitespace-nowrap"
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

      {/* Bottom Row: Today's Active Course Sessions */}
      <ParallaxReveal delay={0.16}>
        <div className="card-level-1 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#e2e8f0] flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold text-[#0b1c30]">
                Today&apos;s Scheduled Seminars &amp; Lab Sessions
              </h2>
              <p className="text-xs text-[#434655] mt-0.5">
                Live session occupancy and instructor assignments
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('faculty')}
              className="h-9 px-3.5 rounded-lg border border-[#e2e8f0] bg-white text-xs font-semibold text-[#0b1c30] hover:bg-[#f8fafc] transition-colors whitespace-nowrap shrink-0"
            >
              Take Attendance
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">
                  <th className="py-3 px-6">Course</th>
                  <th className="py-3 px-4">Instructor</th>
                  <th className="py-3 px-4">Location &amp; Time</th>
                  <th className="py-3 px-4 text-right">Seat Ratio</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e2e8f0] text-sm">
                {sessions.map((session) => (
                  <tr
                    key={session.id}
                    className="hover:bg-[#f8fafc] transition-colors"
                  >
                    <td className="py-3.5 px-6">
                      <div className="font-mono text-xs font-semibold text-[#004ac6]">
                        {session.code}
                      </div>
                      <div className="font-medium text-[#0b1c30]">
                        {session.title}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#434655]">
                      {session.instructor}
                    </td>
                    <td className="py-3.5 px-4 text-[#434655]">
                      <div>{session.room}</div>
                      <div className="font-mono text-xs text-[#737686] tabular-nums">
                        {session.schedule}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-xs font-semibold text-[#0b1c30] tabular-nums">
                      {session.enrolledCount} / {session.capacity}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        type="button"
                        onClick={() => onNavigate('faculty')}
                        className="text-xs font-semibold text-[#004ac6] hover:text-[#1d4ed8] whitespace-nowrap"
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
