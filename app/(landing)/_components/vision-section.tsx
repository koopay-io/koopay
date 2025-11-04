'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { TrendingUp, Globe, Users, Zap } from 'lucide-react';
import Link from 'next/link';

interface VisionSectionProps {
  hasUser: boolean;
  hasOrganization: boolean;
}

export function VisionSection({ hasUser, hasOrganization }: VisionSectionProps) {
  const containerRef = React.useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.2 });
  
  const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    animate: isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }
  };

  const staggerContainer = {
    initial: {},
    animate: isInView ? {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    } : {}
  };

  const itemAnimation = {
    initial: { opacity: 0, y: 30, scale: 0.95 },
    animate: isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.95 },
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }
  };

  const getButtonText = () => {
    if (!hasUser) return 'Join the Movement';
    if (!hasOrganization) return 'Go to onboarding';
    return 'Go to platform';
  };

  const getButtonHref = () => {
    if (!hasUser) return '/auth/login';
    if (!hasOrganization) return '/onboarding';
    return '/platform';
  };
  const stats = [
    {
      icon: <Users className="w-8 h-8 text-sky-300" />,
      number: '57M',
      label: 'Freelancers in US',
      description: 'Growing 3× faster than the traditional workforce.',
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-emerald-300" />,
      number: '$1.3T',
      label: 'Global Market',
      description: 'Projected volume by 2027 across remote services.',
    },
    {
      icon: <Globe className="w-8 h-8 text-indigo-300" />,
      number: '50%',
      label: 'Remote Adoption',
      description: 'Teams keeping hybrid/remote policies in place.',
    },
    {
      icon: <Zap className="w-8 h-8 text-purple-300" />,
      number: '86%',
      label: 'Want Better Payments',
              description: 'Freelancers demanding secure, on-time payments.',
    },
  ];

  return (
    <section ref={containerRef} className="relative py-24" id="vision">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-white/12 via-transparent to-transparent blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-white/10 via-transparent to-transparent blur-3xl" />
      </div>
      <div className="relative max-w-6xl mx-auto px-4">
        <motion.div {...fadeInUp} className="text-center mb-16">
          <span className="inline-flex items-center justify-center rounded-full border border-white/15 bg-slate-900/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-zinc-200/80 backdrop-blur">
            Vision
          </span>
          <h2 className="mt-6 text-4xl md:text-5xl font-bold text-zinc-50 mb-6">
            The Koopay Vision
          </h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-xl md:text-2xl text-zinc-300/85 leading-relaxed mb-6">
              In project-based work, the biggest risk isn't in doing the work, it's in getting paid correctly.
            </p>
            <p className="text-xl md:text-2xl text-zinc-300/85 leading-relaxed mb-6">
              Koopay restores trust to freelance work — with clear rules, automatic payments, and total transparency from day one. Built on Stellar for global reach, near-zero fees, and instant payments with a simple, intuitive experience.
            </p>
            <p className="text-xl md:text-2xl text-zinc-300/85 leading-relaxed mb-8">
              In short: <strong>a smart, fair, and reliable way to get paid — on time, always.</strong>
            </p>
            <div className="w-24 h-1 bg-gradient-1 mx-auto rounded-full" />
          </div>
        </motion.div>

        <motion.div {...staggerContainer} className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              {...itemAnimation}
              className="group relative overflow-hidden rounded-3xl border border-white/12 bg-slate-900/60 p-6 text-center shadow-[0_28px_90px_-60px_rgba(59,130,246,0.8)] backdrop-blur-xl"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-white/15 via-transparent to-transparent" />
              <div className="relative mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-slate-900/70 border border-white/15 backdrop-blur-sm">
                {stat.icon}
              </div>
              <div className="text-3xl font-semibold text-zinc-100 mb-2">{stat.number}</div>
              <h3 className="text-lg font-medium text-zinc-200 mb-2">{stat.label}</h3>
              <p className="text-sm text-zinc-400/90">{stat.description}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
          transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="grid md:grid-cols-2 gap-8 mb-16"
        >
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.6, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-3xl border border-white/12 bg-gradient-to-br from-slate-900/80 via-[#0b1120]/70 to-slate-900/60 p-8 shadow-[0_35px_110px_-70px_rgba(79,70,229,0.8)] backdrop-blur-xl"
          >
            <div className="size-12 rounded-lg bg-sky-400/15 flex items-center justify-center mb-6 border border-white/15 backdrop-blur">
              <Globe className="w-6 h-6 text-sky-200" />
            </div>
            <h3 className="text-2xl font-semibold text-zinc-100 mb-4">Global Workforce</h3>
            <p className="text-zinc-300/85 leading-relaxed">
              Koopay makes geography irrelevant. Send and receive payments anywhere in the world, instantly, with minimal fees and no banking complications.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.6, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-3xl border border-white/12 bg-gradient-to-br from-slate-900/80 via-[#0b1120]/70 to-slate-900/60 p-8 shadow-[0_35px_110px_-70px_rgba(124,58,237,0.75)] backdrop-blur-xl"
          >
            <div className="size-12 rounded-lg bg-purple-400/15 flex items-center justify-center mb-6 border border-white/15 backdrop-blur">
              <Zap className="w-6 h-6 text-purple-200" />
            </div>
            <h3 className="text-2xl font-semibold text-zinc-100 mb-4">Instant Economy</h3>
            <p className="text-zinc-300/85 leading-relaxed">
              Teams expect immediate outcomes. Koopay synchronizes approvals, releases payments automatically, and keeps everything transparent in one dashboard.
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.98 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 60, scale: 0.98 }}
          transition={{ duration: 0.8, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl border border-white/12 bg-gradient-to-br from-slate-900/80 via-[#0b1120]/70 to-slate-900/60 p-8 md:p-12 shadow-[0_45px_140px_-70px_rgba(59,130,246,0.85)] backdrop-blur-2xl"
        >
          <h3 className="text-3xl font-semibold text-center text-zinc-100 mb-12">Why Now?</h3>
          <div className="relative">
            <div className="absolute left-1/2 -translate-x-1/2 w-1 h-full bg-gradient-to-b from-sky-400 via-indigo-500 to-purple-500 rounded-full opacity-70" />
            <div className="space-y-12">
              <div className="flex items-center">
                <div className="w-1/2 pr-8 text-right">
                  <h4 className="text-xl font-semibold text-zinc-100 mb-2">Remote & Hybrid Work</h4>
                  <p className="text-zinc-300/85">
                    Teams everywhere demand faster onboarding and borderless payments.
                  </p>
                </div>
                <div className="relative z-10 size-4 rounded-full bg-sky-400 border-4 border-white/10 shadow-[0_0_12px_rgba(56,189,248,0.7)]" />
                <div className="w-1/2 pl-8" />
              </div>

              <div className="flex items-center">
                <div className="w-1/2 pr-8" />
                <div className="relative z-10 size-4 rounded-full bg-indigo-500 border-4 border-white/10 shadow-[0_0_12px_rgba(99,102,241,0.7)]" />
                <div className="w-1/2 pl-8">
                  <h4 className="text-xl font-semibold text-zinc-100 mb-2">Payment Fatigue</h4>
                  <p className="text-zinc-300/85">
                    High fees and slow settlements drive demand for transparent alternatives.
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="w-1/2 pr-8 text-right">
                  <h4 className="text-xl font-semibold text-zinc-100 mb-2">New Workforce Expectations</h4>
                  <p className="text-zinc-300/85">
                    Digital-native teams want systems that are instant, transparent, and fair by design.
                  </p>
                </div>
                <div className="relative z-10 size-4 rounded-full bg-emerald-400 border-4 border-white/10 shadow-[0_0_12px_rgba(52,211,153,0.7)]" />
                <div className="w-1/2 pl-8" />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.98 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.98 }}
          transition={{ duration: 0.8, delay: 1, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mt-16"
        >
          <div className="max-w-3xl mx-auto rounded-3xl border border-white/12 bg-slate-900/60 p-10 shadow-[0_35px_110px_-70px_rgba(79,70,229,0.8)] backdrop-blur-xl">
            <h3 className="text-2xl md:text-3xl font-semibold text-zinc-100 mb-4">
              Be Part of the Future of Work
            </h3>
            <p className="text-lg text-zinc-300/85 mb-8">
              Help us onboard the next million independent builders with trust-first payments and
              reputation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={getButtonHref()}
                className="px-8 py-4 bg-gradient-1 text-white text-sm font-semibold uppercase tracking-wide rounded-full shadow-[0_22px_55px_-20px_rgba(79,70,229,0.85)] transition-all duration-200 hover:brightness-110 text-center"
              >
                {getButtonText()}
              </Link>
              <button className="px-8 py-4 border border-white/15 text-zinc-200/90 text-sm font-semibold uppercase tracking-wide rounded-full hover:bg-slate-900/60 transition-all duration-200 backdrop-blur">
                Read Whitepaper
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
