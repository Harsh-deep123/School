import { useMemo, useState, FormEvent } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AcademicDivision, StudentRecord } from '../data/academicData';

interface EnrollStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnroll: (
    student: Omit<StudentRecord, 'id'>,
    tuitionAmount: number,
  ) => void | Promise<void>;
}

interface CourseOption {
  label: string;
  /** Fixed total course fee (all semesters combined) */
  totalFee: number;
  creditsTarget: number;
  /** How many semesters this course has */
  semesters: number;
}

const DIVISIONS: AcademicDivision[] = [
  'Computer Science & Engg.',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Business Administration',
];

const DEPARTMENT_COURSES: Record<AcademicDivision, CourseOption[]> = {
  'Computer Science & Engg.': [
    { label: 'B.Tech CSE', totalFee: 1000000, creditsTarget: 160, semesters: 8 },
    { label: 'BCA', totalFee: 390000, creditsTarget: 120, semesters: 6 },
    { label: 'MCA', totalFee: 340000, creditsTarget: 80, semesters: 4 },
    { label: 'M.Tech CSE', totalFee: 380000, creditsTarget: 80, semesters: 4 },
  ],
  'Electronics & Communication': [
    { label: 'B.Tech ECE', totalFee: 960000, creditsTarget: 160, semesters: 8 },
    { label: 'M.Tech ECE', totalFee: 360000, creditsTarget: 80, semesters: 4 },
  ],
  'Mechanical Engineering': [
    { label: 'B.Tech ME', totalFee: 920000, creditsTarget: 160, semesters: 8 },
    { label: 'M.Tech ME', totalFee: 352000, creditsTarget: 80, semesters: 4 },
  ],
  'Business Administration': [
    { label: 'BBA', totalFee: 468000, creditsTarget: 120, semesters: 6 },
    { label: 'MBA', totalFee: 580000, creditsTarget: 80, semesters: 4 },
  ],
};

const SEM_LABELS = [
  'Sem I',
  'Sem II',
  'Sem III',
  'Sem IV',
  'Sem V',
  'Sem VI',
  'Sem VII',
  'Sem VIII',
];

const ADVISORS: Record<AcademicDivision, string> = {
  'Computer Science & Engg.': 'Dr. Kavita Mehra',
  'Electronics & Communication': 'Prof. Suresh Iyer',
  'Mechanical Engineering': 'Dr. Nalini Desai',
  'Business Administration': 'Prof. Farida Khan',
};

const DEFAULT_DIVISION: AcademicDivision = 'Computer Science & Engg.';
const DEFAULT_COURSE = DEPARTMENT_COURSES[DEFAULT_DIVISION][0];

export function EnrollStudentModal({
  isOpen,
  onClose,
  onEnroll,
}: EnrollStudentModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [division, setDivision] = useState<AcademicDivision>(DEFAULT_DIVISION);
  const [course, setCourse] = useState(DEFAULT_COURSE.label);
  const [semester, setSemester] = useState('Sem I');
  const [cohort, setCohort] = useState('Batch 2025–29');
  const [error, setError] = useState('');

  const courseOptions = DEPARTMENT_COURSES[division];
  const selectedCourse =
    courseOptions.find((opt) => opt.label === course) ?? courseOptions[0];

  const semesterOptions = useMemo(
    () => SEM_LABELS.slice(0, selectedCourse.semesters),
    [selectedCourse.semesters],
  );

  /** Semester fee = total course fee ÷ number of semesters */
  const semesterFee = Math.round(
    selectedCourse.totalFee / selectedCourse.semesters,
  );
  const semesterFeeDisplay = `₹${semesterFee.toLocaleString('en-IN')} · ${semester}`;
  const courseTotalDisplay = `₹${selectedCourse.totalFee.toLocaleString('en-IN')}`;

  const handleDivisionChange = (nextDivision: AcademicDivision) => {
    const first = DEPARTMENT_COURSES[nextDivision][0];
    setDivision(nextDivision);
    setCourse(first.label);
    setSemester('Sem I');
  };

  const handleCourseChange = (nextCourse: string) => {
    const matched =
      courseOptions.find((opt) => opt.label === nextCourse) ?? courseOptions[0];
    setCourse(matched.label);
    setSemester('Sem I');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    const phoneDigits = trimmedPhone.replace(/\D/g, '');

    if (!trimmedName || !trimmedEmail.includes('@')) {
      setError('Enter a valid student name and email address.');
      return;
    }

    if (phoneDigits.length < 10) {
      setError('Enter a valid 10-digit phone number.');
      return;
    }

    await onEnroll(
      {
        name: trimmedName,
        email: trimmedEmail,
        phone: trimmedPhone,
        division,
        program: `${selectedCourse.label} · ${semester}`,
        cohort,
        gpa: 0,
        creditsEarned: 0,
        creditsTarget: selectedCourse.creditsTarget,
        attendanceRate: 100,
        tuitionBalance: semesterFee,
        status: 'Pending',
        advisor: ADVISORS[division],
      },
      semesterFee,
    );

    setName('');
    setEmail('');
    setPhone('');
    setDivision(DEFAULT_DIVISION);
    setCourse(DEFAULT_COURSE.label);
    setSemester('Sem I');
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
            className="fixed inset-0 bg-[#0c3b2e]/40 backdrop-blur-[4px]"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-lg rounded-2xl bg-white border border-[#d5e2db] shadow-[0_20px_25px_-5px_rgba(12,59,46,0.12),0_8px_10px_-6px_rgba(12,59,46,0.04)] overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#d5e2db]">
              <div>
                <h2
                  id="enroll-modal-title"
                  className="font-display text-lg font-semibold text-[#12261f]"
                >
                  New Student Admission
                </h2>
                <p className="text-xs text-[#3d5248] mt-0.5">
                  Creates enrollment record and Odd Sem fee invoice
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close admission dialog"
                className="w-9 h-9 rounded-lg inline-flex items-center justify-center text-[#3d5248] hover:bg-[#e7f0eb] hover:text-[#12261f] transition-colors"
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
                    className="block text-xs font-semibold text-[#12261f] mb-1.5"
                  >
                    Student Name
                  </label>
                  <input
                    id="student-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Diya Kapoor"
                    className="input-academic w-full px-3 text-sm text-[#12261f] placeholder:text-[#94a8a0]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="student-email"
                    className="block text-xs font-semibold text-[#12261f] mb-1.5"
                  >
                    Email
                  </label>
                  <input
                    id="student-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="diya.kapoor@ait.edu.in"
                    className="input-academic w-full px-3 text-sm text-[#12261f] placeholder:text-[#94a8a0]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="student-phone"
                  className="block text-xs font-semibold text-[#12261f] mb-1.5"
                >
                  Phone Number
                </label>
                <input
                  id="student-phone"
                  type="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 98765 43210"
                  className="input-academic w-full px-3 text-sm text-[#12261f] placeholder:text-[#94a8a0]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="student-division"
                    className="block text-xs font-semibold text-[#12261f] mb-1.5"
                  >
                    Department
                  </label>
                  <select
                    id="student-division"
                    value={division}
                    onChange={(e) =>
                      handleDivisionChange(e.target.value as AcademicDivision)
                    }
                    className="input-academic w-full px-3 text-sm text-[#12261f]"
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
                    className="block text-xs font-semibold text-[#12261f] mb-1.5"
                  >
                    Batch
                  </label>
                  <select
                    id="student-cohort"
                    value={cohort}
                    onChange={(e) => setCohort(e.target.value)}
                    className="input-academic w-full px-3 text-sm text-[#12261f]"
                  >
                    <option value="Batch 2025–29">Batch 2025–29</option>
                    <option value="Batch 2024–28">Batch 2024–28</option>
                    <option value="Batch 2023–27">Batch 2023–27</option>
                    <option value="Batch 2024–26">Batch 2024–26 (MBA)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="student-course"
                    className="block text-xs font-semibold text-[#12261f] mb-1.5"
                  >
                    Course
                  </label>
                  <select
                    id="student-course"
                    value={course}
                    onChange={(e) => handleCourseChange(e.target.value)}
                    className="input-academic w-full px-3 text-sm text-[#12261f]"
                  >
                    {courseOptions.map((opt) => (
                      <option key={opt.label} value={opt.label}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="student-semester"
                    className="block text-xs font-semibold text-[#12261f] mb-1.5"
                  >
                    Semester
                  </label>
                  <select
                    id="student-semester"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="input-academic w-full px-3 text-sm text-[#12261f]"
                  >
                    {semesterOptions.map((sem) => (
                      <option key={sem} value={sem}>
                        {sem}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="tuition-amount"
                    className="block text-xs font-semibold text-[#12261f] mb-1.5"
                  >
                    Semester Fee (₹)
                  </label>
                  <input
                    id="tuition-amount"
                    type="text"
                    readOnly
                    value={semesterFeeDisplay}
                    className="input-academic w-full px-3 text-sm font-mono tabular-nums text-[#12261f] bg-[#f5faf7]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="course-total-fee"
                    className="block text-xs font-semibold text-[#12261f] mb-1.5"
                  >
                    Course Total Fee (₹)
                  </label>
                  <input
                    id="course-total-fee"
                    type="text"
                    readOnly
                    value={courseTotalDisplay}
                    className="input-academic w-full px-3 text-sm font-mono tabular-nums text-[#12261f] bg-[#f5faf7]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#d5e2db] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-10 px-4 rounded-lg border border-[#d5e2db] bg-white text-sm font-semibold text-[#164a3a] hover:bg-[#f5faf7] hover:border-[#b7cfc3] transition-colors whitespace-nowrap shrink-0"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-lg bg-[#0b6b4c] text-sm font-semibold text-white hover:bg-[#095a40] transition-colors whitespace-nowrap shrink-0"
                >
                  Confirm Admission
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
