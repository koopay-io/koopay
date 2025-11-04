'use client';

import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { MagnetizeButton } from '@/components/ui/magnetize-button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

const primaryButtonClasses =
  'px-8 py-4 text-sm font-semibold uppercase tracking-wide rounded-full bg-gradient-1 hover:brightness-110 text-white shadow-[0_20px_45px_-15px_rgba(99,102,241,0.7)]';

const secondaryButtonClasses =
  'px-8 py-4 text-sm font-semibold uppercase tracking-wide rounded-full border border-white/20 text-zinc-200/90 hover:bg-white/10 backdrop-blur';

const rotatingWords = ['agencies', 'consultants', 'creators', 'teams', 'companies', 'everyone'];

const WORD_DISPLAY_DURATION_MS = 1800;
const FINAL_WORD = 'everyone';

interface HeroSectionProps {
  hasUser: boolean;
  hasOrganization: boolean;
}

export function HeroSection({ hasUser, hasOrganization }: HeroSectionProps) {
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [isAnimating, setIsAnimating] = useState(true);
  const [displayWord, setDisplayWord] = useState('freelancers');
  const [isFading, setIsFading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isAnimating) return;

    const interval = setInterval(() => {
      setIsFading(true);

      setTimeout(() => {
        setCurrentWordIndex((prev) => {
          const nextIndex = prev + 1;

          if (nextIndex >= rotatingWords.length) {
            setIsAnimating(false);
            setDisplayWord(FINAL_WORD);
            setIsFading(false);
            return prev;
          }

          const nextWord = rotatingWords[nextIndex];
          setDisplayWord(nextWord);
          setIsFading(false);
          return nextIndex;
        });
      }, 300);
    }, WORD_DISPLAY_DURATION_MS);

    return () => clearInterval(interval);
  }, [isAnimating]);

  const getButtonText = () => {
    if (!hasUser) return 'Start your journey';
    if (!hasOrganization) return 'Go to onboarding';
    return 'Go to platform';
  };

  const getButtonHref = () => {
    if (!hasUser) return '/auth/login';
    if (!hasOrganization) return '/onboarding';
    return '/platform';
  };
  return (
    <section className="relative overflow-hidden min-h-screen flex items-center justify-center px-4 pt-28 pb-24">
      <div className="absolute inset-0 -z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={mounted ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-white/10 via-transparent to-transparent blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: 100 }}
          animate={mounted ? { opacity: 1, scale: 1, x: 0 } : { opacity: 0, scale: 0.8, x: 100 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="absolute -right-32 top-24 h-72 w-72 rounded-full bg-gradient-to-br from-indigo-500/30 to-sky-500/20 blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: -100 }}
          animate={mounted ? { opacity: 1, scale: 1, x: 0 } : { opacity: 0, scale: 0.8, x: -100 }}
          transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="absolute -left-32 bottom-10 h-80 w-80 rounded-full bg-gradient-to-br from-purple-500/25 to-indigo-500/20 blur-3xl"
        />
        <motion.div
          initial={{ scaleX: 0 }}
          animate={mounted ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 1, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"
        />
      </div>

      <div className="max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 space-y-6"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={mounted ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-zinc-100 shadow-[0_10px_30px_-15px_rgba(148,163,184,0.9)] backdrop-blur"
          >
            Future of freelance payments
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl md:text-7xl font-bold text-zinc-50 leading-tight drop-shadow-[0_25px_60px_rgba(37,99,235,0.25)]"
          >
            <motion.span
              initial={{ opacity: 0, x: -30 }}
              animate={mounted ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
              transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              Secure payments
            </motion.span>{' '}
            for
            <br />
            <motion.span
              key={displayWord}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{
                opacity: mounted && !isFading ? 1 : 0,
                y: mounted && !isFading ? 0 : 20,
                scale: mounted && !isFading ? 1 : 0.95,
              }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="inline-block bg-gradient-2 text-transparent bg-clip-text"
            >
              {displayWord}
            </motion.span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-lg md:text-2xl text-zinc-300/90 max-w-3xl mx-auto leading-relaxed"
          >
            A secure payment method for project-based work — no delays, no ghosting, no
            complications.{' '}
            <motion.span
              initial={{ opacity: 0 }}
              animate={mounted ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="inline-block"
            >
              Get paid on time, every time.
            </motion.span>
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={mounted ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
        >
          <MagnetizeButton
            className={primaryButtonClasses}
            particleCount={14}
            attractRadius={60}
            asChild
          >
            <Link href={getButtonHref()}>
              {getButtonText()}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </MagnetizeButton>
          <MagnetizeButton
            variant="outline"
            className={secondaryButtonClasses}
            particleCount={12}
            attractRadius={50}
          >
            Learn More
          </MagnetizeButton>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={mounted ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 60, scale: 0.95 }}
          transition={{ duration: 1, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="relative max-w-3xl mx-auto"
        >
          <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="rounded-3xl border border-white/15 bg-white/5 p-4 sm:p-6 md:p-8 shadow-[0_30px_80px_-40px_rgba(59,130,246,0.95)] backdrop-blur-2xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={mounted ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.8, delay: 1.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0f172a]/90 via-[#0b1120]/80 to-[#111827]/90 backdrop-blur"
            >
              <video
                className="h-full w-full object-cover"
                src="/landing/pitch-demo.mp4"
                preload="metadata"
                controls
                playsInline
                poster="/landing/pitch-demo-thumbnail.png"
              >
                Your browser does not support the Koopay product demo video.
              </video>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={mounted ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ duration: 0.6, delay: 1.5, ease: [0.22, 1, 0.36, 1] }}
                className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-100 backdrop-blur"
              >
                Live product demo
              </motion.div>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={mounted ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.6, delay: 1.6 }}
              className="mt-4 text-sm text-zinc-400/80 text-center"
            >
              Watch the Koopay walkthrough recorded from our latest internal beta build.
            </motion.p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={mounted ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 1.2, delay: 1.4 }}
            className="pointer-events-none absolute inset-x-10 -bottom-10 h-28 rounded-full bg-gradient-to-r from-sky-500/25 via-indigo-500/20 to-purple-500/25 blur-3xl"
          />
        </motion.div>
      </div>
    </section>
  );
}
