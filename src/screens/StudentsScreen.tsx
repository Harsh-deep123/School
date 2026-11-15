import { useMemo, useState } from 'react';
import { Search, UserPlus } from 'lucide-react';
import {
  AcademicDivision,
  EnrollmentStatus,
  formatINR,
  StudentRecord,
} from '../data/academicData';
import { StatusIndicator } from '../components/StatusIndicator';
import { ParallaxReveal } from '../components/ParallaxLayer';

interface StudentsScreenProps {
  students: StudentRecord[];
  onSelectStudent: (student: StudentRecord) => void;
  onOpenEnrollModal: () => void;
}

type StatusFilter = 'All' | EnrollmentStatus;

export function StudentsScreen({
  students,
  onSelectStudent,
  onOpenEnrollModal,
}: StudentsScreenProps) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [divisionFilter, setDivisionFilter] = useState<string>('All Departments');

  const filteredStudents = useMemo(() => {
    const q = query.trim().toLowerCase();
    return students.filter((student) => {
      const matchesStatus =
        statusFilter === 'All' || student.status === statusFilter;
      const matchesDivision =
        divisionFilter === 'All Departments' ||
        student.division === (divisionFilter as AcademicDivision);
      const matchesQuery =
        !q ||
        student.name.toLowerCase().includes(q) ||
        student.id.toLowerCase().includes(q) ||
        student.program.toLowerCase().includes(q);
      return matchesStatus && matchesDivision && matchesQuery;
    });
  }, [students, query, statusFilter, divisionFilter]);

  return (
    <div className="space-y-6 pb-8">
      <ParallaxReveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-[#12261f] tracking-tight">
              Student Directory
            </h1>
            <p className="text-sm text-[#3d5248] mt-1">
              Enrolment ID, programme, CGPA and fee balance across {students.length} active records.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenEnrollModal}
            className="h-10 px-4 rounded-lg bg-[#0b6b4c] text-sm font-semibold text-white hover:bg-[#095a40] inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>New Admission</span>
          </button>
        </div>
      </ParallaxReveal>

      <ParallaxReveal delay={0.05}>
        <div className="card-level-1 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#6b8578] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, enrolment ID, or programme..."
                aria-label="Search students"
                className="input-academic w-full pl-9 pr-3 text-sm text-[#12261f] placeholder:text-[#94a8a0]"
              />
            </div>

            <select
              value={divisionFilter}
              onChange={(e) => setDivisionFilter(e.target.value)}
              aria-label="Filter by department"
              className="input-academic px-3 text-sm text-[#12261f] min-w-[220px]"
            >
              <option value="All Departments">All Departments</option>
              <option value="Computer Science & Engg.">Computer Science &amp; Engg.</option>
              <option value="Electronics & Communication">Electronics &amp; Communication</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Business Administration">Business Administration</option>
            </select>
          </div>

          <div
            className="inline-flex items-center gap-1 p-1 rounded-lg bg-[#e7f0eb] self-start lg:self-auto"
            role="tablist"
            aria-label="Filter by enrollment status"
          >
            {(['All', 'Enrolled', 'Pending', 'At-Risk'] as StatusFilter[]).map(
              (status) => (
                <button
                  key={status}
                  type="button"
                  role="tab"
                  aria-selected={statusFilter === status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    statusFilter === status
                      ? 'bg-white text-[#12261f] shadow-xs'
                      : 'text-[#3d5248] hover:text-[#12261f]'
                  }`}
                >
                  {status}
                </button>
              ),
            )}
          </div>
        </div>
      </ParallaxReveal>

      <ParallaxReveal delay={0.1}>
        {filteredStudents.length === 0 ? (
          <div className="card-level-1 rounded-2xl p-12 text-center">
            <h2 className="font-display text-lg font-semibold text-[#12261f]">
              No matching student records
            </h2>
            <p className="text-sm text-[#3d5248] mt-1 max-w-md mx-auto">
              Adjust your search filter or add a new admission for Odd Sem 2025–26.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setStatusFilter('All');
                  setDivisionFilter('All Departments');
                }}
                className="h-10 px-4 rounded-lg border border-[#d5e2db] bg-white text-sm font-semibold text-[#12261f] hover:bg-[#f5faf7] transition-colors"
              >
                Reset Filters
              </button>
              <button
                type="button"
                onClick={onOpenEnrollModal}
                className="h-10 px-4 rounded-lg bg-[#0b6b4c] text-sm font-semibold text-white hover:bg-[#095a40] transition-colors"
              >
                New Admission
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="hidden md:block card-level-1 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f5faf7] border-b border-[#d5e2db] text-[11px] font-semibold text-[#5a7266] uppercase tracking-wider">
                      <th className="py-3.5 px-6">Student</th>
                      <th className="py-3.5 px-4">Dept &amp; Programme</th>
                      <th className="py-3.5 px-4 text-right">CGPA</th>
                      <th className="py-3.5 px-4 text-right">Attendance</th>
                      <th className="py-3.5 px-4 text-right">Fee Due</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-6 text-right">Record</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#d5e2db] text-sm">
                    {filteredStudents.map((student) => (
                      <tr
                        key={student.id}
                        onClick={() => onSelectStudent(student)}
                        className="hover:bg-[#f5faf7] cursor-pointer transition-colors"
                      >
                        <td className="py-3.5 px-6">
                          <div className="font-semibold text-[#12261f]">
                            {student.name}
                          </div>
                          <div className="font-mono text-xs text-[#6b8578] tabular-nums">
                            {student.id} · {student.cohort}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-[#12261f] font-medium">
                            {student.division}
                          </div>
                          <div className="text-xs text-[#3d5248]">
                            {student.program}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-semibold text-[#12261f] tabular-nums">
                          {student.gpa.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-[#3d5248] tabular-nums">
                          {student.attendanceRate.toFixed(1)}%
                        </td>
                        <td
                          className={`py-3.5 px-4 text-right font-mono font-semibold tabular-nums ${
                            student.tuitionBalance === 0
                              ? 'text-[#047857]'
                              : 'text-[#be123c]'
                          }`}
                        >
                          {formatINR(student.tuitionBalance)}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusIndicator status={student.status} />
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectStudent(student);
                            }}
                            className="h-8 px-3 rounded-md border border-[#d5e2db] bg-white text-xs font-semibold text-[#12261f] hover:bg-[#e7f0eb] hover:text-[#0a5c40] transition-colors whitespace-nowrap"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="md:hidden space-y-3">
              {filteredStudents.map((student) => (
                <button
                  key={student.id}
                  type="button"
                  onClick={() => onSelectStudent(student)}
                  className="w-full text-left card-level-1 rounded-2xl p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-[#12261f]">
                        {student.name}
                      </div>
                      <div className="font-mono text-xs text-[#6b8578] tabular-nums">
                        {student.id}
                      </div>
                    </div>
                    <StatusIndicator status={student.status} />
                  </div>
                  <div className="text-xs text-[#3d5248]">
                    {student.division} · {student.program}
                  </div>
                  <div className="pt-2 border-t border-[#d5e2db] grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-[#6b8578] block">CGPA</span>
                      <span className="font-mono font-semibold text-[#12261f] tabular-nums">
                        {student.gpa.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#6b8578] block">Attendance</span>
                      <span className="font-mono font-semibold text-[#12261f] tabular-nums">
                        {student.attendanceRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[#6b8578] block">Fee Due</span>
                      <span className="font-mono font-semibold text-[#12261f] tabular-nums">
                        {formatINR(student.tuitionBalance)}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </ParallaxReveal>
    </div>
  );
}
