import { useState } from 'react';
import {
  AttendanceStatus,
  CourseSession,
  FACULTY_MEMBERS,
  IMAGES,
} from '../data/academicData';
import { ResilientImage } from '../components/ResilientImage';
import { StatusIndicator } from '../components/StatusIndicator';
import { ParallaxReveal } from '../components/ParallaxLayer';

interface FacultyScreenProps {
  sessions: CourseSession[];
  onUpdateAttendance: (
    sessionId: string,
    studentId: string,
    status: AttendanceStatus,
  ) => void;
}

export function FacultyScreen({
  sessions,
  onUpdateAttendance,
}: FacultyScreenProps) {
  const [activeSessionId, setActiveSessionId] = useState(sessions[0]?.id ?? '');

  const activeSession =
    sessions.find((s) => s.id === activeSessionId) ?? sessions[0];

  const presentCount = activeSession
    ? activeSession.roster.filter((r) => r.attendance === 'Present').length
    : 0;
  const sessionPct = activeSession
    ? Math.round((presentCount / Math.max(1, activeSession.roster.length)) * 100)
    : 0;

  const provost = FACULTY_MEMBERS[0];
  const chairs = FACULTY_MEMBERS.slice(1);

  return (
    <div className="space-y-6 pb-8">
      <ParallaxReveal>
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-[#0b1c30] tracking-tight">
            Faculty &amp; Session Attendance
          </h1>
          <p className="text-sm text-[#434655] mt-1">
            Teaching workload governance and real-time seminar attendance registration.
          </p>
        </div>
      </ParallaxReveal>

      {/* Faculty Leadership & Chairs Grid */}
      <ParallaxReveal delay={0.04}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Provost Feature Card */}
          <div className="lg:col-span-5 card-level-1 rounded-2xl p-6 flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-5 items-center sm:items-start">
            <ResilientImage
              src={provost.portraitUrl ?? IMAGES.deanPortrait}
              alt={provost.name}
              fallbackTitle={provost.name}
              className="w-28 h-28 rounded-xl object-cover border border-[#e2e8f0] shrink-0"
            />
            <div className="flex-1 min-w-0">
              <span className="text-xs font-semibold text-[#004ac6]">
                Office of the Provost
              </span>
              <h2 className="font-display text-xl font-bold text-[#0b1c30] mt-1">
                {provost.name}
              </h2>
              <p className="text-xs text-[#434655] mt-1 leading-relaxed">
                {provost.role}
              </p>
              <div className="mt-4 pt-3 border-t border-[#e2e8f0] flex flex-wrap items-center gap-4 text-xs text-[#434655]">
                <span>{provost.office}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono font-semibold text-[#0b1c30] tabular-nums">
                  {provost.utilizationRate}% load
                </span>
              </div>
            </div>
          </div>

          {/* Division Chairs */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {chairs.map((member) => {
              const initials = member.name
                .replace(/^(Dr\.|Prof\.)\s+/, '')
                .split(' ')
                .map((p) => p[0])
                .join('')
                .slice(0, 2);

              return (
                <div
                  key={member.id}
                  className="card-level-1 rounded-2xl p-5 flex flex-col justify-between"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#eff4ff] text-[#004ac6] font-display font-bold text-sm flex items-center justify-center shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-display text-sm font-bold text-[#0b1c30] truncate">
                        {member.name}
                      </h3>
                      <p className="text-xs text-[#434655] truncate">
                        {member.division}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#e2e8f0] flex items-center justify-between text-xs">
                    <span className="text-[#434655] tabular-nums">
                      {member.coursesCount} courses · {member.adviseesCount} advisees
                    </span>
                    <span className="font-mono font-semibold text-[#0b1c30] tabular-nums">
                      {member.utilizationRate}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </ParallaxReveal>

      {/* Interactive Daily Session Attendance Roll */}
      {activeSession && (
        <ParallaxReveal delay={0.08}>
          <div className="card-level-1 rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-[#e2e8f0] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-lg font-semibold text-[#0b1c30]">
                  Daily Session Attendance Roll
                </h2>
                <p className="text-xs text-[#434655] mt-0.5">
                  Select a live course session and record attendance directly into the campus register
                </p>
              </div>

              <div
                className="inline-flex flex-wrap items-center gap-1 p-1 rounded-lg bg-[#eff4ff]"
                role="tablist"
                aria-label="Active course sessions"
              >
                {sessions.map((session) => (
                  <button
                    key={session.id}
                    type="button"
                    role="tab"
                    aria-selected={session.id === activeSession.id}
                    onClick={() => setActiveSessionId(session.id)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                      session.id === activeSession.id
                        ? 'bg-white text-[#0b1c30] shadow-xs'
                        : 'text-[#434655] hover:text-[#0b1c30]'
                    }`}
                  >
                    {session.code}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 bg-[#f8f9ff] border-b border-[#e2e8f0] flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="font-display text-base font-bold text-[#0b1c30]">
                  {activeSession.code}: {activeSession.title}
                </div>
                <div className="text-xs text-[#434655] mt-0.5 flex flex-wrap items-center gap-2">
                  <span>{activeSession.instructor}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeSession.room}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">
                    {activeSession.schedule}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs text-[#434655] block">
                    Live Roll Present
                  </span>
                  <span className="font-mono text-lg font-bold text-[#0b1c30] tabular-nums">
                    {presentCount} / {activeSession.roster.length} ({sessionPct}%)
                  </span>
                </div>
              </div>
            </div>

            <div className="divide-y divide-[#e2e8f0]">
              {activeSession.roster.map((entry) => (
                <div
                  key={entry.studentId}
                  className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#f8fafc] transition-colors"
                >
                  <div>
                    <div className="text-sm font-semibold text-[#0b1c30]">
                      {entry.studentName}
                    </div>
                    <div className="font-mono text-xs text-[#737686] tabular-nums">
                      {entry.studentId}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <StatusIndicator status={entry.attendance} />

                    <div
                      className="inline-flex items-center gap-1 p-1 rounded-lg bg-[#eff4ff]"
                      role="group"
                      aria-label={`Set attendance for ${entry.studentName}`}
                    >
                      {(['Present', 'Leave', 'Absent'] as AttendanceStatus[]).map(
                        (statusOption) => (
                          <button
                            key={statusOption}
                            type="button"
                            onClick={() =>
                              onUpdateAttendance(
                                activeSession.id,
                                entry.studentId,
                                statusOption,
                              )
                            }
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors whitespace-nowrap ${
                              entry.attendance === statusOption
                                ? 'bg-white text-[#0b1c30] shadow-xs'
                                : 'text-[#434655] hover:text-[#0b1c30]'
                            }`}
                          >
                            {statusOption}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ParallaxReveal>
      )}
    </div>
  );
}
