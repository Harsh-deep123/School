import { ReactNode, RefObject, useRef } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'motion/react';

interface ParallaxBannerProps {
  scrollContainerRef: RefObject<HTMLElement | null>;
  imageSrc: string;
  imageAlt: string;
  heightClass?: string;
  children: ReactNode;
  speed?: number;
}

export function ParallaxBanner({
  scrollContainerRef,
  imageSrc,
  imageAlt,
  heightClass = 'min-h-[280px]',
  children,
  speed = 48,
}: ParallaxBannerProps) {
  const targetRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    container: scrollContainerRef,
    target: targetRef,
    offset: ['start end', 'end start'],
  });

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [-speed, speed],
  );

  const scale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    prefersReducedMotion ? [1, 1, 1] : [1.08, 1.03, 1.08],
  );

  const gridY = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [18, -18],
  );

  return (
    <section
      ref={targetRef}
      className={`relative overflow-hidden rounded-2xl border border-[#e2e8f0] bg-[#0f172a] ${heightClass}`}
    >
      <motion.div
        style={{ y, scale }}
        className="absolute -inset-12 will-change-transform pointer-events-none"
      >
        <img
          src={imageSrc}
          alt={imageAlt}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Measured contrast scrim for WCAG AA legibility */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-[#0f172a]/92 via-[#0f172a]/72 to-[#0f172a]/38 pointer-events-none"
      />

      {/* Subtle architectural parallax layer */}
      <motion.div
        aria-hidden="true"
        style={{ y: gridY }}
        className="absolute inset-0 opacity-20 pointer-events-none will-change-transform"
      >
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id="academic-grid"
              width="48"
              height="48"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 48 0 L 0 0 0 48"
                fill="none"
                stroke="#94a3b8"
                strokeWidth="0.6"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#academic-grid)" />
        </svg>
      </motion.div>

      <div className="relative z-10 h-full flex flex-col justify-between p-6 md:p-8">
        {children}
      </div>
    </section>
  );
}

interface ParallaxRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function ParallaxReveal({
  children,
  className = '',
  delay = 0,
}: ParallaxRevealProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.28,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
