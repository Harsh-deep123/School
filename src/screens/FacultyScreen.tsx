import { FormEvent, useEffect, useState } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import {
  AcademicDivision,
  AttendanceStatus,
  CourseSession,
  FacultyMember,
  IMAGES,
} from '../data/academicData';
import { ResilientImage } from '../components/ResilientImage';
import { StatusIndicator } from '../components/StatusIndicator';
import { ParallaxReveal } from '../components/ParallaxLayer';

const DIVISIONS: AcademicDivision[] = [
  'Computer Science & Engg.',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Business Administration',
];

const inputClass =
  'w-full h-10 px-3 rounded-lg border border-[#d5e2db] bg-white text-sm text-[#12261f] outline-none focus:border-[#0b6b4c] focus:ring-2 focus:ring-[#0b6b4c]/15';

type FacultyFormState = {
  name: string;
  role: string;
  division: string;
  office: string;
  coursesCount: number;
  adviseesCount: number;
  utilizationRate: number;
};

const emptyFacultyForm = (): FacultyFormState => ({
  name: '',
  role: '',
  division: DIVISIONS[0],
  office: '',
  coursesCount: 0,
  adviseesCount: 0,
  utilizationRate: 0,
});

interface FacultyScreenProps {
  sessions: CourseSession[];
  faculty: FacultyMember[];
  isSuperAdmin?: boolean;
  onUpdateAttendance: (
    sessionId: string,
    studentId: string,
    status: AttendanceStatus,
  ) => void | Promise<void>;
  onSaveFaculty?: (
    facultyId: string,
    payload: FacultyFormState & { division: AcademicDivision },
  ) => Promise<void>;
  onCreateFaculty?: (
    payload: FacultyFormState & { division: AcademicDivision },
  ) => Promise<void>;
  onDeleteFaculty?: (facultyId: string) => Promise<void>;
}

export function FacultyScreen({
  sessions,
  faculty,
  isSuperAdmin = false,
  onUpdateAttendance,
  onSaveFaculty,
  onCreateFaculty,
  onDeleteFaculty,
}: FacultyScreenProps) {
  const [activeSessionId, setActiveSessionId] = useState(sessions[0]?.id ?? '');
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FacultyFormState>(emptyFacultyForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeSession =
    sessions.find((s) => s.id === activeSessionId) ?? sessions[0];

  const presentCount = activeSession
    ? activeSession.roster.filter((r) => r.attendance === 'Present').length
    : 0;
  const sessionPct = activeSession
    ? Math.round((presentCount / Math.max(1, activeSession.roster.length)) * 100)
    : 0;

  const principal = faculty[0];
  const teachers = faculty.slice(1);

  useEffect(() => {
    if (sessions.length && !sessions.some((s) => s.id === activeSessionId)) {
      setActiveSessionId(sessions[0].id);
    }
  }, [sessions, activeSessionId]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyFacultyForm());
    setError(null);
    setEditorOpen(true);
  };

  const openEdit = (member: FacultyMember) => {
    setEditingId(member.id);
    setForm({
      name: member.name,
      role: member.role,
      division: member.division,
      office: member.office,
      coursesCount: member.coursesCount,
      adviseesCount: member.adviseesCount,
      utilizationRate: member.utilizationRate,
    });
    setError(null);
    setEditorOpen(true);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!isSuperAdmin) return;
    setBusy(true);
    setError(null);
    const payload = {
      ...form,
      division: form.division as AcademicDivision,
      coursesCount: Number(form.coursesCount),
      adviseesCount: Number(form.adviseesCount),
      utilizationRate: Number(form.utilizationRate),
    };
    try {
      if (editingId) {
        await onSaveFaculty?.(editingId, payload);
      } else {
        await onCreateFaculty?.(payload);
      }
      setEditorOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save faculty');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!editingId || !onDeleteFaculty) return;
    if (!window.confirm('Delete this faculty member permanently?')) return;
    setBusy(true);
    setError(null);
    try {
      await onDeleteFaculty(editingId);
      setEditorOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete faculty');
    } finally {
      setBusy(false);
    }
  };

  if (!principal && !isSuperAdmin) {
    return (
      <div className="card-level-1 rounded-2xl p-8 text-center text-sm text-[#3d5248]">
        No staff records in the database yet.
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <ParallaxReveal>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-[#12261f] tracking-tight">
              Faculty &amp; Attendance
            </h1>
            <p className="text-sm text-[#3d5248] mt-1">
              {isSuperAdmin
                ? 'Super Admin: edit any faculty profile, add new staff, or remove records.'
                : 'Mark only absences and leave — present by default, like Indian college ERPs (Fedena / MasterSoft).'}
            </p>
          </div>
          {isSuperAdmin && (
            <button
              type="button"
              onClick={openCreate}
              className="h-10 px-4 rounded-lg bg-[#0b6b4c] text-sm font-semibold text-white hover:bg-[#095a40] inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Faculty
            </button>
          )}
        </div>
      </ParallaxReveal>

      {principal && (
        <ParallaxReveal delay={0.04}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-5 card-level-1 rounded-2xl p-6 flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-5 items-center sm:items-start relative">
              {isSuperAdmin && (
                <button
                  type="button"
                  onClick={() => openEdit(principal)}
                  className="absolute top-4 right-4 h-9 px-3 rounded-lg border border-[#d5e2db] bg-white text-xs font-semibold text-[#12261f] hover:bg-[#f5faf7] inline-flex items-center gap-1.5"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  Edit
                </button>
              )}
              <ResilientImage
                src={principal.portraitUrl ?? IMAGES.deanPortrait}
                alt={principal.name}
                fallbackTitle={principal.name}
                className="w-28 h-28 rounded-xl object-cover border border-[#d5e2db] shrink-0"
              />
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold text-[#0a5c40]">
                  Director&apos;s Office
                </span>
                <h2 className="font-display text-xl font-bold text-[#12261f] mt-1">
                  {principal.name}
                </h2>
                <p className="text-xs text-[#3d5248] mt-1 leading-relaxed">
                  {principal.role}
                </p>
                <div className="mt-4 pt-3 border-t border-[#d5e2db] flex flex-wrap items-center gap-4 text-xs text-[#3d5248]">
                  <span>{principal.office}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono font-semibold text-[#12261f] tabular-nums">
                    {principal.utilizationRate}% load
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {teachers.map((member) => {
                const initials = member.name
                  .replace(/^(Dr\.|Mrs\.|Mr\.|Ms\.|Prof\.)\s+/, '')
                  .split(' ')
                  .map((p) => p[0])
                  .join('')
                  .slice(0, 2);

                return (
                  <div
                    key={member.id}
                    className="card-level-1 rounded-2xl p-5 flex flex-col justify-between relative"
                  >
                    {isSuperAdmin && (
                      <button
                        type="button"
                        onClick={() => openEdit(member)}
                        className="absolute top-3 right-3 w-8 h-8 rounded-lg border border-[#d5e2db] bg-white text-[#12261f] hover:bg-[#f5faf7] inline-flex items-center justify-center"
                        aria-label={`Edit ${member.name}`}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <div className="flex items-start gap-3 pr-8">
                      <div className="w-10 h-10 rounded-lg bg-[#e7f0eb] text-[#0a5c40] font-display font-bold text-sm flex items-center justify-center shrink-0">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-display text-sm font-bold text-[#12261f] truncate">
                          {member.name}
                        </h3>
                        <p className="text-xs text-[#3d5248] truncate">
                          {member.role}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#d5e2db] flex items-center justify-between text-xs">
                      <span className="text-[#3d5248] tabular-nums">
                        {member.coursesCount} courses · {member.adviseesCount}{' '}
                        mentees
                      </span>
                      <span className="font-mono font-semibold text-[#12261f] tabular-nums">
                        {member.utilizationRate}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ParallaxReveal>
      )}

      {!principal && isSuperAdmin && (
        <div className="card-level-1 rounded-2xl p-8 text-center">
          <p className="text-sm text-[#3d5248]">
            No faculty yet. Add the first staff member as Super Admin.
          </p>
          <button
            type="button"
            onClick={openCreate}
            className="mt-4 h-10 px-4 rounded-lg bg-[#0b6b4c] text-sm font-semibold text-white hover:bg-[#095a40] inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Faculty
          </button>
        </div>
      )}

      {activeSession && (
        <ParallaxReveal delay={0.08}>
          <div className="card-level-1 rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-[#d5e2db] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-lg font-semibold text-[#12261f]">
                  Lecture Attendance Register
                </h2>
                <p className="text-xs text-[#3d5248] mt-0.5">
                  Pick a course slot, mark exceptions, then save — holidays are
                  flagged before recording
                </p>
              </div>

              <div
                className="inline-flex flex-wrap items-center gap-1 p-1 rounded-lg bg-[#e7f0eb]"
                role="tablist"
                aria-label="Active class periods"
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
                        ? 'bg-white text-[#12261f] shadow-xs'
                        : 'text-[#3d5248] hover:text-[#12261f]'
                    }`}
                  >
                    {session.code}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 bg-[#f2f6f4] border-b border-[#d5e2db] flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="font-display text-base font-bold text-[#12261f]">
                  {activeSession.code}: {activeSession.title}
                </div>
                <div className="text-xs text-[#3d5248] mt-0.5 flex flex-wrap items-center gap-2">
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
                  <span className="text-xs text-[#3d5248] block">
                    Present Today
                  </span>
                  <span className="font-mono text-lg font-bold text-[#12261f] tabular-nums">
                    {presentCount} / {activeSession.roster.length} ({sessionPct}
                    %)
                  </span>
                </div>
              </div>
            </div>

            <div className="divide-y divide-[#d5e2db]">
              {activeSession.roster.map((entry) => (
                <div
                  key={entry.studentId}
                  className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#f5faf7] transition-colors"
                >
                  <div>
                    <div className="text-sm font-semibold text-[#12261f]">
                      {entry.studentName}
                    </div>
                    <div className="font-mono text-xs text-[#6b8578] tabular-nums">
                      {entry.studentId}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <StatusIndicator status={entry.attendance} />

                    <div
                      className="inline-flex items-center gap-1 p-1 rounded-lg bg-[#e7f0eb]"
                      role="group"
                      aria-label={`Set attendance for ${entry.studentName}`}
                    >
                      {(
                        ['Present', 'Leave', 'Absent'] as AttendanceStatus[]
                      ).map((statusOption) => (
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
                              ? 'bg-white text-[#12261f] shadow-xs'
                              : 'text-[#3d5248] hover:text-[#12261f]'
                          }`}
                        >
                          {statusOption}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ParallaxReveal>
      )}

      <AnimatePresence>
        {editorOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0c3b2e]/55 backdrop-blur-[2px]"
              onClick={() => setEditorOpen(false)}
            />
            <motion.form
              role="dialog"
              aria-modal="true"
              aria-labelledby="faculty-edit-title"
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              onSubmit={handleSubmit}
              className="relative w-full max-w-lg rounded-2xl bg-white border border-[#d5e2db] shadow-[0_20px_40px_-20px_rgba(12,59,46,0.45)] overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-[#d5e2db] flex items-center justify-between gap-3">
                <div>
                  <h2
                    id="faculty-edit-title"
                    className="font-display text-base font-semibold text-[#12261f]"
                  >
                    {editingId ? 'Edit faculty' : 'Add faculty'}
                  </h2>
                  <p className="text-xs text-[#3d5248] mt-0.5">
                    Super Admin full access — name, role, office &amp; load
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditorOpen(false)}
                  aria-label="Close"
                  className="w-9 h-9 rounded-lg inline-flex items-center justify-center text-[#6b8578] hover:bg-[#f5faf7]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block sm:col-span-2">
                  <span className="text-xs font-semibold text-[#3d5248]">
                    Name
                  </span>
                  <input
                    required
                    className={`${inputClass} mt-1.5`}
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-xs font-semibold text-[#3d5248]">
                    Role / designation
                  </span>
                  <input
                    required
                    className={`${inputClass} mt-1.5`}
                    value={form.role}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, role: e.target.value }))
                    }
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-[#3d5248]">
                    Department
                  </span>
                  <select
                    className={`${inputClass} mt-1.5`}
                    value={form.division}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, division: e.target.value }))
                    }
                  >
                    {DIVISIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-[#3d5248]">
                    Office
                  </span>
                  <input
                    required
                    className={`${inputClass} mt-1.5`}
                    value={form.office}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, office: e.target.value }))
                    }
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-[#3d5248]">
                    Courses
                  </span>
                  <input
                    type="number"
                    className={`${inputClass} mt-1.5`}
                    value={form.coursesCount}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        coursesCount: Number(e.target.value),
                      }))
                    }
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-[#3d5248]">
                    Mentees
                  </span>
                  <input
                    type="number"
                    className={`${inputClass} mt-1.5`}
                    value={form.adviseesCount}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        adviseesCount: Number(e.target.value),
                      }))
                    }
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-xs font-semibold text-[#3d5248]">
                    Utilisation %
                  </span>
                  <input
                    type="number"
                    className={`${inputClass} mt-1.5`}
                    value={form.utilizationRate}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        utilizationRate: Number(e.target.value),
                      }))
                    }
                  />
                </label>
              </div>

              {error && (
                <p className="px-5 text-xs font-medium text-[#be123c]">{error}</p>
              )}

              <div className="px-5 py-4 border-t border-[#d5e2db] flex flex-wrap items-center justify-between gap-2">
                {editingId ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void handleDelete()}
                    className="h-10 px-3 rounded-lg border border-[#f1c4c8] bg-white text-sm font-semibold text-[#be123c] hover:bg-[#fff1f2] inline-flex items-center gap-2 disabled:opacity-60"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                ) : (
                  <span />
                )}
                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={() => setEditorOpen(false)}
                    className="h-10 px-4 rounded-lg border border-[#d5e2db] bg-white text-sm font-semibold text-[#12261f] hover:bg-[#f5faf7]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={busy}
                    className="h-10 px-4 rounded-lg bg-[#0b6b4c] text-sm font-semibold text-white hover:bg-[#095a40] disabled:opacity-60"
                  >
                    {busy ? 'Saving…' : editingId ? 'Save changes' : 'Add faculty'}
                  </button>
                </div>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
