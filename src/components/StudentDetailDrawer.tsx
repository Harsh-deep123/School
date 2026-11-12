import { X, Mail, BookOpen, UserCheck, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EnrollmentStatus, StudentRecord } from '../data/academicData';
import { StatusIndicator } from './StatusIndicator';

interface StudentDetailDrawerProps {
  student: StudentRecord | null;
  onClose: () => void;
  onUpdateStatus: (studentId: string, status: EnrollmentStatus) => void;
  onClearBalance: (studentId: string) => void;
}

export function StudentDetailDrawer({
  student,
  onClose,
  onUpdateStatus,
  onClearBalance,
}: StudentDetailDrawerProps) {
  const creditPct = student
    ? Math.min(100, Math.round((student.creditsEarned / student.creditsTarget) * 100))
    : 0;

  return (
    <AnimatePresence>
      {student && (
        <div
          className="fixed inset-0 z-50 flex justify-end"
          role="dialog"
          aria-modal="true"
          aria-labelledby="drawer-student-name"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0f172a]/35 backdrop-blur-[2px]"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-md bg-white h-full border-l border-[#e2e8f0] shadow-[0_20px_25px_-5px_rgba(15,23,42,0.12)] flex flex-col"
          >
            <div className="flex items-start justify-between px-6 py-5 border-b border-[#e2e8f0]">
              <div>
                <p className="font-mono text-xs text-[#434655] tabular-nums">
                  {student.id}
                </p>
                <h2
                  id="drawer-student-name"
                  className="font-display text-xl font-bold text-[#0b1c30] mt-1"
                >
                  {student.name}
                </h2>
                <div className="flex items-center gap-2 text-xs text-[#434655] mt-1">
                  <span>{student.division}</span>
                  <span aria-hidden="true">·</span>
                  <span>{student.cohort}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close student record"
                className="w-9 h-9 rounded-lg inline-flex items-center justify-center text-[#434655] hover:bg-[#eff4ff] hover:text-[#0b1c30] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="flex items-center justify-between pb-5 border-b border-[#e2e8f0]">
                <div>
                  <span className="text-xs font-medium text-[#434655] block mb-1">
                    Academic Standing
                  </span>
                  <StatusIndicator status={student.status} />
                </div>
                <div className="text-right">
                  <span className="text-xs font-medium text-[#434655] block mb-1">
                    Cumulative GPA
                  </span>
                  <span className="font-display text-2xl font-bold text-[#0b1c30] tabular-nums">
                    {student.gpa.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2.5 text-sm text-[#434655]">
                  <Mail className="w-4 h-4 text-[#737686] shrink-0" />
                  <span>{student.email}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-[#434655]">
                  <BookOpen className="w-4 h-4 text-[#737686] shrink-0" />
                  <span>{student.program}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-[#434655]">
                  <UserCheck className="w-4 h-4 text-[#737686] shrink-0" />
                  <span>Faculty Advisor: {student.advisor}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-[#e2e8f0] space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-[#0b1c30] mb-2">
                    <span>Degree Credit Progress</span>
                    <span className="font-mono tabular-nums">
                      {student.creditsEarned} / {student.creditsTarget} credits ({creditPct}%)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[#eff4ff] overflow-hidden">
                    <div
                      className="h-full bg-[#2563eb] rounded-full transition-all duration-300"
                      style={{ width: `${creditPct}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-[#0b1c30] mb-2">
                    <span>Term Attendance Rate</span>
                    <span className="font-mono tabular-nums">
                      {student.attendanceRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-[#eff4ff] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        student.attendanceRate >= 90
                          ? 'bg-[#10b981]'
                          : student.attendanceRate >= 82
                          ? 'bg-[#f59e0b]'
                          : 'bg-[#f43f5e]'
                      }`}
                      style={{ width: `${Math.min(100, student.attendanceRate)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#e2e8f0]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#434655]" />
                    <span className="text-sm font-medium text-[#0b1c30]">
                      Open Bursar Balance
                    </span>
                  </div>
                  <span
                    className={`font-mono text-base font-semibold tabular-nums ${
                      student.tuitionBalance === 0
                        ? 'text-[#047857]'
                        : 'text-[#be123c]'
                    }`}
                  >
                    ${student.tuitionBalance.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-[#e2e8f0] bg-[#f8f9ff] space-y-2.5">
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => onUpdateStatus(student.id, 'Enrolled')}
                  disabled={student.status === 'Enrolled'}
                  className="h-10 px-3 rounded-lg bg-[#2563eb] text-xs font-semibold text-white hover:bg-[#1d4ed8] disabled:opacity-45 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                >
                  Approve Enrollment
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateStatus(student.id, 'At-Risk')}
                  disabled={student.status === 'At-Risk'}
                  className="h-10 px-3 rounded-lg border border-[#e2e8f0] bg-white text-xs font-semibold text-[#be123c] hover:bg-[#f43f5e]/5 disabled:opacity-45 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                >
                  Flag Academic Review
                </button>
              </div>
              {student.tuitionBalance > 0 && (
                <button
                  type="button"
                  onClick={() => onClearBalance(student.id)}
                  className="w-full h-10 px-4 rounded-lg border border-[#10b981]/30 bg-[#10b981]/10 text-xs font-semibold text-[#047857] hover:bg-[#10b981]/18 transition-colors whitespace-nowrap"
                >
                  Record Full Tuition Settlement (${student.tuitionBalance.toLocaleString()})
                </button>
              )}
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
