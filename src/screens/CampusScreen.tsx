import { RefObject, useRef } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react';
import { ArrowRight } from 'lucide-react';
import {
  DivisionPerformance,
  formatINR,
  IMAGES,
  SCHOOL,
  ScreenId,
  TermMilestone,
} from '../data/academicData';
import { ParallaxBanner, ParallaxReveal } from '../components/ParallaxLayer';
import { ResilientImage } from '../components/ResilientImage';
import { StatusIndicator, AnyStatus } from '../components/StatusIndicator';

interface CampusScreenProps {
  scrollContainerRef: RefObject<HTMLElement | null>;
  divisions: DivisionPerformance[];
  milestones: TermMilestone[];
  onNavigate: (screen: ScreenId) => void;
}

interface ParallaxFacilitySectionProps {
  scrollContainerRef: RefObject<HTMLElement | null>;
  imageSrc: string;
  imageAlt: string;
  kicker: string;
  title: string;
  description: string;
  stats: { label: string; value: string }[];
  reverse?: boolean;
}

function ParallaxFacilitySection({
  scrollContainerRef,
  imageSrc,
  imageAlt,
  kicker,
  title,
  description,
  stats,
  reverse = false,
}: ParallaxFacilitySectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    container: scrollContainerRef,
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const imageY = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [-36, 36],
  );
  const cardY = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [20, -20],
  );

  return (
    <div
      ref={sectionRef}
      className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
    >
      <div
        className={`lg:col-span-7 relative overflow-hidden rounded-2xl border border-[#d5e2db] min-h-[280px] sm:min-h-[340px] bg-[#0c3b2e] ${
          reverse ? 'lg:order-2' : 'lg:order-1'
        }`}
      >
        <motion.div
          style={{ y: imageY }}
          className="absolute -inset-10 will-change-transform"
        >
          <ResilientImage
            src={imageSrc}
            alt={imageAlt}
            fallbackTitle={title}
            className="w-full h-full object-cover"
          />
        </motion.div>
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-[#0c3b2e]/55 via-transparent to-transparent pointer-events-none"
        />
      </div>

      <motion.div
        style={{ y: cardY }}
        className={`lg:col-span-5 card-level-1 rounded-2xl p-6 md:p-8 flex flex-col justify-between will-change-transform ${
          reverse ? 'lg:order-1' : 'lg:order-2'
        }`}
      >
        <div>
          <span className="text-xs font-semibold text-[#0a5c40]">{kicker}</span>
          <h2 className="font-display text-xl md:text-2xl font-bold text-[#12261f] mt-2 [text-wrap:balance]">
            {title}
          </h2>
          <p className="text-sm text-[#3d5248] mt-3 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="mt-6 pt-5 border-t border-[#d5e2db] grid grid-cols-2 gap-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <span className="text-xs text-[#6b8578] block">{stat.label}</span>
              <span className="font-display text-lg font-bold text-[#12261f] tabular-nums mt-0.5 block">
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export function CampusScreen({
  scrollContainerRef,
  divisions,
  milestones,
  onNavigate,
}: CampusScreenProps) {
  return (
    <div className="space-y-8 pb-12">
      <ParallaxBanner
        scrollContainerRef={scrollContainerRef}
        imageSrc={IMAGES.libraryHall}
        imageAlt="Central library at Aryavarta Institute of Technology"
        heightClass="min-h-[280px] md:min-h-[320px]"
        speed={56}
      >
        <div className="text-xs font-medium text-[#d4ebe0]">
          Campus &amp; Hostels · {SCHOOL.academicYear}
        </div>

        <div className="max-w-2xl my-6">
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight [text-wrap:balance]">
            Library, Labs &amp; Hostel Blocks
          </h1>
          <p className="text-sm sm:text-base text-[#d4ebe0]/95 mt-2.5 leading-relaxed">
            {SCHOOL.location}. Facilities utilisation, department budgets and the academic calendar for the semester.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('faculty')}
            className="h-10 px-4 rounded-lg bg-[#c45c26] text-sm font-semibold text-white hover:bg-[#a84d1f] inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
          >
            <span>View Lecture Timetable</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </ParallaxBanner>

      <ParallaxFacilitySection
        scrollContainerRef={scrollContainerRef}
        imageSrc={IMAGES.engineeringLab}
        imageAlt="Engineering laboratories and computing centre"
        kicker="Block A · CSE & ECE Labs"
        title="Computing Centre & Engineering Labs"
        description="Programming labs, electronics workshops and mechanical shops supporting B.Tech practicals, projects and university viva schedules."
        stats={[
          { label: 'Lab Budget (AY)', value: formatINR(4200000) },
          { label: 'Weekly Utilisation', value: '93.8%' },
        ]}
      />

      <ParallaxFacilitySection
        scrollContainerRef={scrollContainerRef}
        imageSrc={IMAGES.campusQuad}
        imageAlt="College campus courtyard and academic blocks"
        kicker="Main Campus · Hostel & Grounds"
        title="Academic Blocks & Hostel Campus"
        description="Connected engineering and MBA blocks around the central plaza — used for induction, TechFest, placements and inter-department sports."
        stats={[
          { label: 'Enrolment Cap.', value: '2,320' },
          { label: 'Avg Attendance', value: '90.5%' },
        ]}
        reverse
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <ParallaxReveal delay={0.05} className="lg:col-span-7">
          <div className="card-level-1 rounded-2xl overflow-hidden h-full">
            <div className="px-6 py-4 border-b border-[#d5e2db]">
              <h2 className="font-display text-lg font-semibold text-[#12261f]">
                Department Budgets &amp; Strength
              </h2>
              <p className="text-xs text-[#3d5248] mt-0.5">
                2025–26 operating allocation by department
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f5faf7] border-b border-[#d5e2db] text-[11px] font-semibold text-[#5a7266] uppercase tracking-wider">
                    <th className="py-3 px-6">Department</th>
                    <th className="py-3 px-4 text-right">Enrolment</th>
                    <th className="py-3 px-4 text-right">Attendance</th>
                    <th className="py-3 px-6 text-right">Budget</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#d5e2db] text-sm">
                  {divisions.map((div) => (
                    <tr key={div.division} className="hover:bg-[#f5faf7]">
                      <td className="py-3.5 px-6 font-medium text-[#12261f]">
                        {div.division}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-[#3d5248] tabular-nums">
                        {div.enrolled.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-[#3d5248] tabular-nums">
                        {div.attendancePct.toFixed(1)}%
                      </td>
                      <td className="py-3.5 px-6 text-right font-mono font-semibold text-[#12261f] tabular-nums">
                        {formatINR(div.grantAllocation)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </ParallaxReveal>

        <ParallaxReveal delay={0.1} className="lg:col-span-5">
          <div className="card-level-1 rounded-2xl p-6 h-full">
            <h2 className="font-display text-lg font-semibold text-[#12261f]">
              Academic Calendar
            </h2>
            <p className="text-xs text-[#3d5248] mt-0.5 pb-4 border-b border-[#d5e2db]">
              Upcoming exam, fee and placement milestones
            </p>
            <div className="divide-y divide-[#d5e2db]">
              {milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className="py-3.5 flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="font-mono text-xs font-semibold text-[#0a5c40] tabular-nums">
                      {milestone.date}
                    </div>
                    <div className="text-sm font-semibold text-[#12261f] mt-0.5">
                      {milestone.title}
                    </div>
                    <div className="text-xs text-[#3d5248] mt-0.5">
                      {milestone.division}
                    </div>
                  </div>
                  <StatusIndicator status={milestone.status as AnyStatus} />
                </div>
              ))}
            </div>
          </div>
        </ParallaxReveal>
      </div>
    </div>
  );
}
