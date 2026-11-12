import { useState, FormEvent } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AcademicDivision, StudentRecord } from '../data/academicData';

interface EnrollStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnroll: (student: Omit<StudentRecord, 'id'>, tuitionAmount: number) => void;
}

const DIVISIONS: AcademicDivision[] = [
  'Applied Engineering',
  'Quantitative Economics',
  'Natural Sciences',
  'Humanities & Law',
];

const DEFAULT_PROGRAMS: Record<AcademicDivision, string> = {
  'Applied Engineering': 'B.S. Mechatronics & Robotics',
  'Quantitative Economics': 'B.A. Econometrics & Policy',
  'Natural Sciences': 'B.S. Applied Photonics',
  'Humanities & Law': 'B.A. Constitutional History',
};

const ADVISORS: Record<AcademicDivision, string> = {
  'Applied Engineering': 'Dr. Martin Keller',
  'Quantitative Economics': 'Prof. Nadia Okafor',
  'Natural Sciences': 'Dr. Kenji Takahashi',
  'Humanities & Law': 'Prof. Eleanor Vance',
};

export function EnrollStudentModal({
  isOpen,
  onClose,
  onEnroll,
}: EnrollStudentModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [division, setDivision] = useState<AcademicDivision>('Applied Engineering');
  const [program, setProgram] = useState(DEFAULT_PROGRAMS['Applied Engineering']);
  const [cohort, setCohort] = useState('Class of 2029');
  const [tuitionAmount, setTuitionAmount] = useState('18450');
  const [error, setError] = useState('');

  const handleDivisionChange = (nextDivision: AcademicDivision) => {
    setDivision(nextDivision);
    setProgram(DEFAULT_PROGRAMS[nextDivision]);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const parsedTuition = Number(tuitionAmount);

    if (!trimmedName || !trimmedEmail.includes('@')) {
      setError('Enter a valid student full name and institutional email address.');
      return;
    }

    if (Number.isNaN(parsedTuition) || parsedTuition < 0) {
      setError('Enter a valid non-negative tuition assessment amount.');
      return;
    }

    onEnroll(
      {
        name: trimmedName,
        email: trimmedEmail,
        division,
        program: program.trim() || DEFAULT_PROGRAMS[division],
        cohort,
        gpa: 3.5,
        creditsEarned: 0,
        creditsTarget: 120,
        attendanceRate: 100,
        tuitionBalance: parsedTuition,
        status: 'Pending',
        advisor: ADVISORS[division],
      },
      parsedTuition,
    );

    setName('');
    setEmail('');
    setError('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="enroll-modal-title"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0f172a]/40 backdrop-blur-[4px]"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-lg rounded-2xl bg-white border border-[#e2e8f0] shadow-[0_20px_25px_-5px_rgba(15,23,42,0.1),0_8px_10px_-6px_rgba(15,23,42,0.04)] overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0]">
              <div>
                <h2
                  id="enroll-modal-title"
                  className="font-display text-lg font-semibold text-[#0b1c30]"
                >
                  Enroll New Student
                </h2>
                <p className="text-xs text-[#434655] mt-0.5">
                  Creates an academic directory record and Fall 2026 bursar assessment
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close enrollment dialog"
                className="w-9 h-9 rounded-lg inline-flex items-center justify-center text-[#434655] hover:bg-[#eff4ff] hover:text-[#0b1c30] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="rounded-lg bg-[#f43f5e]/10 border border-[#f43f5e]/25 px-3.5 py-2.5 text-xs font-medium text-[#be123c]">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="student-name"
                    className="block text-xs font-semibold text-[#0b1c30] mb-1.5"
                  >
                    Full Name
                  </label>
                  <input
                    id="student-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Elena Rostova"
                    className="input-academic w-full px-3 text-sm text-[#0b1c30] placeholder:text-[#94a3b8]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="student-email"
                    className="block text-xs font-semibold text-[#0b1c30] mb-1.5"
                  >
                    Institutional Email
                  </label>
                  <input
                    id="student-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.rostova@aldervale.edu"
                    className="input-academic w-full px-3 text-sm text-[#0b1c30] placeholder:text-[#94a3b8]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="student-division"
                    className="block text-xs font-semibold text-[#0b1c30] mb-1.5"
                  >
                    Academic Division
                  </label>
                  <select
                    id="student-division"
                    value={division}
                    onChange={(e) =>
                      handleDivisionChange(e.target.value as AcademicDivision)
                    }
                    className="input-academic w-full px-3 text-sm text-[#0b1c30]"
                  >
                    {DIVISIONS.map((div) => (
                      <option key={div} value={div}>
                        {div}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="student-cohort"
                    className="block text-xs font-semibold text-[#0b1c30] mb-1.5"
                  >
                    Cohort
                  </label>
                  <select
                    id="student-cohort"
                    value={cohort}
                    onChange={(e) => setCohort(e.target.value)}
                    className="input-academic w-full px-3 text-sm text-[#0b1c30]"
                  >
                    <option value="Class of 2029">Class of 2029</option>
                    <option value="Class of 2028">Class of 2028</option>
                    <option value="Class of 2027">Class of 2027</option>
                    <option value="Graduate 2027">Graduate 2027</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="student-program"
                    className="block text-xs font-semibold text-[#0b1c30] mb-1.5"
                  >
                    Degree Program
                  </label>
                  <input
                    id="student-program"
                    type="text"
                    value={program}
                    onChange={(e) => setProgram(e.target.value)}
                    className="input-academic w-full px-3 text-sm text-[#0b1c30]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="tuition-amount"
                    className="block text-xs font-semibold text-[#0b1c30] mb-1.5"
                  >
                    Term Tuition Assessment (USD)
                  </label>
                  <input
                    id="tuition-amount"
                    type="number"
                    min={0}
                    step={50}
                    value={tuitionAmount}
                    onChange={(e) => setTuitionAmount(e.target.value)}
                    className="input-academic w-full px-3 text-sm font-mono tabular-nums text-[#0b1c30]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#e2e8f0] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-10 px-4 rounded-lg border border-[#e2e8f0] bg-white text-sm font-semibold text-[#1e293b] hover:bg-[#f8fafc] hover:border-[#cbd5e1] transition-colors whitespace-nowrap shrink-0"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-lg bg-[#2563eb] text-sm font-semibold text-white hover:bg-[#1d4ed8] transition-colors whitespace-nowrap shrink-0"
                >
                  Confirm Enrollment
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
