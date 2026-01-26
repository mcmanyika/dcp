'use client';

import { useEffect, useRef, useState } from 'react';

export default function HeroSection() {
  const [scrollY, setScrollY] = useState(0);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const scrolled = window.scrollY;
        // Only apply parallax when section is visible
        if (rect.bottom > 0 && rect.top < window.innerHeight) {
          setScrollY(scrolled);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Parallax effect: background moves slower than scroll
  const parallaxOffset = scrollY * 0.5;

  return (
    <section
      ref={heroRef}
      id="intro"
      className="relative flex min-h-screen items-end justify-center overflow-hidden pt-16 sm:pt-20"
    >
      {/* Background with parallax */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/images/hero.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          transform: `translateY(${parallaxOffset}px)`,
          willChange: 'transform',
        }}
      />
      {/* Content layer */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-12 text-center sm:px-6 sm:pb-20">
        <h1 className="mb-4 animate-fade-in-up text-3xl font-thin leading-tight tracking-tight text-white sm:mb-6 sm:text-5xl md:text-7xl lg:text-8xl">
          Defend the Constitution.
          <br />
          <span className="text-slate-200">Protect the People.</span>
        </h1>

        <p className="mx-auto mb-8 max-w-2xl animate-fade-in-up animate-delay-200 text-base font-thin text-white/90 sm:mb-10 sm:text-lg md:text-xl lg:text-2xl">
          A citizen-led movement opposing ED 2030 agenda, promoting lawful governance, public accountability, and peaceful civic participation through education, advocacy, and community engagement.
        </p>

        <div className="flex animate-fade-in-up animate-delay-300 items-center justify-center">
          <a
            href="#join"
            className="inline-flex w-full items-center justify-center rounded-lg border-2 border-white px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors sm:w-auto sm:px-8 sm:py-4 sm:text-base"
          >
            Join The Movement
          </a>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce sm:bottom-10">
          <svg className="h-5 w-5 text-white sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  );
}

