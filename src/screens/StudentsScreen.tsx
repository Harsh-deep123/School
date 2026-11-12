import { useMemo, useState } from 'react';
import { Search, UserPlus } from 'lucide-react';
import {
  AcademicDivision,
  EnrollmentStatus,
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
  const [divisionFilter, setDivisionFilter] = useState<string>('All Divisions');

  const filteredStudents = useMemo(() => {
    const q = query.trim().toLowerCase();
    return students.filter((student) => {
      const matchesStatus =
        statusFilter === 'All' || student.status === statusFilter;
      const matchesDivision =
        divisionFilter === 'All Divisions' ||
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
            <h1 className="font-display text-2xl md:text-3xl font-bold text-[#0b1c30] tracking-tight">
              Student Directory &amp; Enrollment
            </h1>
            <p className="text-sm text-[#434655] mt-1">
              Academic standing, degree credit progression, and advisor assignments across {students.length} active records.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenEnrollModal}
            className="h-10 px-4 rounded-lg bg-[#2563eb] text-sm font-semibold text-white hover:bg-[#1d4ed8] inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Enroll Student</span>
          </button>
        </div>
      </ParallaxReveal>

      {/* Filter Toolbar */}
      <ParallaxReveal delay={0.05}>
        <div className="card-level-1 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#737686] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by student name, ID, or degree..."
                aria-label="Search students"
                className="input-academic w-full pl-9 pr-3 text-sm text-[#0b1c30] placeholder:text-[#94a3b8]"
              />
            </div>

            <select
              value={divisionFilter}
              onChange={(e) => setDivisionFilter(e.target.value)}
              aria-label="Filter by academic division"
              className="input-academic px-3 text-sm text-[#0b1c30] min-w-[200px]"
            >
              <option value="All Divisions">All Divisions</option>
              <option value="Applied Engineering">Applied Engineering</option>
              <option value="Quantitative Economics">Quantitative Economics</option>
              <option value="Natural Sciences">Natural Sciences</option>
              <option value="Humanities & Law">Humanities &amp; Law</option>
            </select>
          </div>

          <div
            className="inline-flex items-center gap-1 p-1 rounded-lg bg-[#eff4ff] self-start lg:self-auto"
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
                      ? 'bg-white text-[#0b1c30] shadow-xs'
                      : 'text-[#434655] hover:text-[#0b1c30]'
                  }`}
                >
                  {status}
                </button>
              ),
            )}
          </div>
        </div>
      </ParallaxReveal>

      {/* Desktop Data Table + Mobile Cards */}
      <ParallaxReveal delay={0.1}>
        {filteredStudents.length === 0 ? (
          <div className="card-level-1 rounded-2xl p-12 text-center">
            <h2 className="font-display text-lg font-semibold text-[#0b1c30]">
              No matching student records
            </h2>
            <p className="text-sm text-[#434655] mt-1 max-w-md mx-auto">
              Adjust your search filter or enroll a new candidate into the Fall 2026 roster.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setStatusFilter('All');
                  setDivisionFilter('All Divisions');
                }}
                className="h-10 px-4 rounded-lg border border-[#e2e8f0] bg-white text-sm font-semibold text-[#0b1c30] hover:bg-[#f8fafc] transition-colors"
              >
                Reset Filters
              </button>
              <button
                type="button"
                onClick={onOpenEnrollModal}
                className="h-10 px-4 rounded-lg bg-[#2563eb] text-sm font-semibold text-white hover:bg-[#1d4ed8] transition-colors"
              >
                Enroll Student
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block card-level-1 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">
                      <th className="py-3.5 px-6">Student</th>
                      <th className="py-3.5 px-4">Division &amp; Program</th>
                      <th className="py-3.5 px-4 text-right">GPA</th>
                      <th className="py-3.5 px-4 text-right">Attendance</th>
                      <th className="py-3.5 px-4 text-right">Balance</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-6 text-right">Record</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e2e8f0] text-sm">
                    {filteredStudents.map((student) => (
                      <tr
                        key={student.id}
                        onClick={() => onSelectStudent(student)}
                        className="hover:bg-[#f8fafc] cursor-pointer transition-colors"
                      >
                        <td className="py-3.5 px-6">
                          <div className="font-semibold text-[#0b1c30]">
                            {student.name}
                          </div>
                          <div className="font-mono text-xs text-[#737686] tabular-nums">
                            {student.id} · {student.cohort}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="text-[#0b1c30] font-medium">
                            {student.division}
                          </div>
                          <div className="text-xs text-[#434655]">
                            {student.program}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-semibold text-[#0b1c30] tabular-nums">
                          {student.gpa.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono text-[#434655] tabular-nums">
                          {student.attendanceRate.toFixed(1)}%
                        </td>
                        <td
                          className={`py-3.5 px-4 text-right font-mono font-semibold tabular-nums ${
                            student.tuitionBalance === 0
                              ? 'text-[#047857]'
                              : 'text-[#be123c]'
                          }`}
                        >
                          ${student.tuitionBalance.toLocaleString()}
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
                            className="h-8 px-3 rounded-md border border-[#e2e8f0] bg-white text-xs font-semibold text-[#0b1c30] hover:bg-[#eff4ff] hover:text-[#004ac6] transition-colors whitespace-nowrap"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card List */}
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
                      <div className="font-semibold text-[#0b1c30]">
                        {student.name}
                      </div>
                      <div className="font-mono text-xs text-[#737686] tabular-nums">
                        {student.id}
                      </div>
                    </div>
                    <StatusIndicator status={student.status} />
                  </div>
                  <div className="text-xs text-[#434655]">
                    {student.division} · {student.program}
                  </div>
                  <div className="pt-2 border-t border-[#e2e8f0] grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-[#737686] block">GPA</span>
                      <span className="font-mono font-semibold text-[#0b1c30] tabular-nums">
                        {student.gpa.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#737686] block">Attendance</span>
                      <span className="font-mono font-semibold text-[#0b1c30] tabular-nums">
                        {student.attendanceRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[#737686] block">Balance</span>
                      <span className="font-mono font-semibold text-[#0b1c30] tabular-nums">
                        ${student.tuitionBalance.toLocaleString()}
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
