import { RefObject, useRef } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react';
import { ArrowRight } from 'lucide-react';
import {
  DIVISION_METRICS,
  IMAGES,
  ScreenId,
  TERM_MILESTONES,
} from '../data/academicData';
import { ParallaxBanner, ParallaxReveal } from '../components/ParallaxLayer';
import { ResilientImage } from '../components/ResilientImage';
import { StatusIndicator } from '../components/StatusIndicator';

interface CampusScreenProps {
  scrollContainerRef: RefObject<HTMLElement | null>;
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
        className={`lg:col-span-7 relative overflow-hidden rounded-2xl border border-[#e2e8f0] min-h-[280px] sm:min-h-[340px] bg-[#0f172a] ${
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
          className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/55 via-transparent to-transparent pointer-events-none"
        />
      </div>

      <motion.div
        style={{ y: cardY }}
        className={`lg:col-span-5 card-level-1 rounded-2xl p-6 md:p-8 flex flex-col justify-between will-change-transform ${
          reverse ? 'lg:order-1' : 'lg:order-2'
        }`}
      >
        <div>
          <span className="text-xs font-semibold text-[#004ac6]">{kicker}</span>
          <h2 className="font-display text-xl md:text-2xl font-bold text-[#0b1c30] mt-2 [text-wrap:balance]">
            {title}
          </h2>
          <p className="text-sm text-[#434655] mt-3 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="mt-6 pt-5 border-t border-[#e2e8f0] grid grid-cols-2 gap-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <span className="text-xs text-[#737686] block">{stat.label}</span>
              <span className="font-display text-lg font-bold text-[#0b1c30] tabular-nums mt-0.5 block">
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
  onNavigate,
}: CampusScreenProps) {
  return (
    <div className="space-y-8 pb-12">
      {/* Top Parallax Library Showcase */}
      <ParallaxBanner
        scrollContainerRef={scrollContainerRef}
        imageSrc={IMAGES.libraryHall}
        imageAlt="Double-height contemporary university research library with oak study tables"
        heightClass="min-h-[280px] md:min-h-[320px]"
        speed={56}
      >
        <div className="text-xs font-medium text-[#dbe1ff]">
          Campus Infrastructure &amp; Facilities · Fall 2026
        </div>

        <div className="max-w-2xl my-6">
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight [text-wrap:balance]">
            Sterling Research Commons &amp; Applied Laboratory Network
          </h1>
          <p className="text-sm sm:text-base text-[#dbe1ff]/90 mt-2.5 leading-relaxed">
            Real-time spatial utilization, sponsored research grants, and academic milestone calendars across Alder &amp; Vale&apos;s central campus quadrangle.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate('faculty')}
            className="h-10 px-4 rounded-lg bg-[#2563eb] text-sm font-semibold text-white hover:bg-[#1d4ed8] inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
          >
            <span>View Lab Schedules</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </ParallaxBanner>

      {/* Opposing Scroll-Linked Parallax Facility Sections */}
      <ParallaxFacilitySection
        scrollContainerRef={scrollContainerRef}
        imageSrc={IMAGES.engineeringLab}
        imageAlt="Applied sciences and mechatronics research bay in Hayes Center"
        kicker="Hayes Center · Applied Engineering"
        title="Advanced Mechatronics & Cleanroom Laboratories"
        description="Dedicated optical benches, precision robotics bays, and instrumented testing suites supporting 1,140 undergraduate and graduate engineering candidates."
        stats={[
          { label: 'Active Research Grants', value: '$4.25M' },
          { label: 'Weekly Bay Utilization', value: '93.8%' },
        ]}
      />

      <ParallaxFacilitySection
        scrollContainerRef={scrollContainerRef}
        imageSrc={IMAGES.campusQuad}
        imageAlt="Tree-lined university quadrangle and glass academic atrium"
        kicker="Central Quadrangle · Academic Commons"
        title="Interdisciplinary Seminar Pavilions & Advising"
        description="Connected limestone and glass pavilions uniting Quantitative Economics, Natural Sciences, and Humanities & Law faculty offices around shared seminar halls."
        stats={[
          { label: 'Total Seat Capacity', value: '4,010' },
          { label: 'Term Attendance Avg', value: '93.2%' },
        ]}
        reverse
      />

      {/* Research Grant Allocation & Academic Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <ParallaxReveal delay={0.05} className="lg:col-span-7">
          <div className="card-level-1 rounded-2xl overflow-hidden h-full">
            <div className="px-6 py-4 border-b border-[#e2e8f0]">
              <h2 className="font-display text-lg font-semibold text-[#0b1c30]">
                Sponsored Research &amp; Divisional Allocation
              </h2>
              <p className="text-xs text-[#434655] mt-0.5">
                FY 2026–2027 laboratory and departmental operating budgets
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f8fafc] border-b border-[#e2e8f0] text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">
                    <th className="py-3 px-6">Division</th>
                    <th className="py-3 px-4 text-right">Enrolled</th>
                    <th className="py-3 px-4 text-right">Attendance</th>
                    <th className="py-3 px-6 text-right">Grant Budget</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0] text-sm">
                  {DIVISION_METRICS.map((div) => (
                    <tr key={div.division} className="hover:bg-[#f8fafc]">
                      <td className="py-3.5 px-6 font-medium text-[#0b1c30]">
                        {div.division}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-[#434655] tabular-nums">
                        {div.enrolled.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-[#434655] tabular-nums">
                        {div.attendancePct.toFixed(1)}%
                      </td>
                      <td className="py-3.5 px-6 text-right font-mono font-semibold text-[#0b1c30] tabular-nums">
                        ${(div.grantAllocation / 1000000).toFixed(2)}M
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
            <h2 className="font-display text-lg font-semibold text-[#0b1c30]">
              Academic Calendar Milestones
            </h2>
            <p className="text-xs text-[#434655] mt-0.5 pb-4 border-b border-[#e2e8f0]">
              Upcoming registrar and bursar governance dates
            </p>
            <div className="divide-y divide-[#e2e8f0]">
              {TERM_MILESTONES.map((milestone) => (
                <div
                  key={milestone.title}
                  className="py-3.5 flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="font-mono text-xs font-semibold text-[#004ac6] tabular-nums">
                      {milestone.date}
                    </div>
                    <div className="text-sm font-semibold text-[#0b1c30] mt-0.5">
                      {milestone.title}
                    </div>
                    <div className="text-xs text-[#434655] mt-0.5">
                      {milestone.division}
                    </div>
                  </div>
                  <StatusIndicator status={milestone.status} />
                </div>
              ))}
            </div>
          </div>
        </ParallaxReveal>
      </div>
    </div>
  );
}
