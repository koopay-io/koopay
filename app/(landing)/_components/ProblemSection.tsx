'use client';

import React from "react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { AlertCircle, Clock, CreditCard, Users } from "lucide-react";

export function ProblemSection() {
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
  const problems = [
    {
      icon: <Clock className="w-8 h-8 text-sky-300" />,
      title: "Delayed Payments",
      description:
        "Last-minute changes, endless revisions, or lack of response can leave you weeks without payment — or never getting paid.",
    },
    {
      icon: <Users className="w-8 h-8 text-indigo-300" />,
      title: "Ghosting & Initial Distrust",
      description:
        "Informal agreements without backup. The risk isn't in doing the work, but in getting paid. Both sides start unsure if funds are safe.",
    },
    {
      icon: <CreditCard className="w-8 h-8 text-rose-300" />,
      title: "High Fees & Cross-Border Friction",
      description:
        "International transfers are expensive, slow, and hard to track. Traditional platforms charge 15–20% per transaction.",
    },
  ];

  return (
    <section ref={containerRef} className="relative py-24" id="pain-points">
      <div className="absolute inset-x-10 -top-24 h-56 rounded-full bg-gradient-to-r from-sky-500/20 via-indigo-500/15 to-purple-500/20 blur-3xl" />
      <div className="absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-white/10 to-transparent lg:block" />
      <div className="relative max-w-6xl mx-auto px-4">
        <motion.div {...fadeInUp} className="text-center mb-16">
          <span className="inline-flex items-center justify-center rounded-full border border-white/15 bg-slate-900/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-zinc-200/80 backdrop-blur">
            Problems we fix
          </span>
          <h2 className="mt-6 text-4xl md:text-5xl font-bold text-zinc-50">
            The Biggest Risk Isn't in Doing the Work, It's in Getting Paid
          </h2>
          <p className="mt-4 text-xl text-zinc-300/85 max-w-3xl mx-auto">
            In project-based work, freelancers and clients face the same pains over and over: informal agreements, delayed payments, and lack of transparency.
          </p>
        </motion.div>

        <motion.div {...staggerContainer} className="grid md:grid-cols-3 gap-8 mb-16">
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              {...itemAnimation}
              className="group relative overflow-hidden rounded-2xl border border-white/12 bg-slate-900/60 p-6 shadow-[0_25px_70px_-45px_rgba(99,102,241,0.6)] backdrop-blur transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
              <div className="relative flex flex-col items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-900/70 flex items-center justify-center border border-white/15 backdrop-blur-sm">
                  {problem.icon}
                </div>
                <h3 className="text-xl font-semibold text-zinc-100">{problem.title}</h3>
                <p className="text-sm text-zinc-400/90 leading-relaxed">{problem.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.98 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.98 }}
          transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl border border-white/12 bg-gradient-to-br from-slate-900/80 via-[#0b1120]/70 to-slate-900/60 p-8 md:p-12 shadow-[0_40px_120px_-60px_rgba(59,130,246,0.85)] backdrop-blur-2xl"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid md:grid-cols-2 gap-10 items-center"
          >
            <div>
              <h3 className="text-2xl font-semibold text-zinc-100 mb-6">
                The Current Problem
              </h3>
              <div className="space-y-4 text-zinc-400/90">
                <div className="flex items-center gap-3">
                  <div className="size-3 rounded-full bg-gradient-to-br from-rose-400 to-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)]" />
                  <span>Informal agreements without backup — WhatsApp or email, no clear contracts</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="size-3 rounded-full bg-gradient-to-br from-rose-400 to-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)]" />
                  <span>Delayed or unpaid — weeks without payment or never getting paid</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="size-3 rounded-full bg-gradient-to-br from-rose-400 to-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)]" />
                  <span>Lack of transparency — everything depends on scattered messages and memory</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="size-3 rounded-full bg-gradient-to-br from-rose-400 to-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)]" />
                  <span>Slow and expensive international transfers</span>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/15 bg-gradient-to-br from-sky-400/20 via-indigo-500/10 to-transparent p-8 shadow-[0_25px_80px_-50px_rgba(79,70,229,0.9)]">
              <h3 className="text-2xl font-semibold text-zinc-100 mb-6">The Koopay Solution</h3>
              <div className="space-y-4 text-zinc-200/90">
                <div className="flex items-center gap-3">
                  <div className="size-3 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 shadow-[0_0_12px_rgba(56,189,248,0.7)]" />
                  <span>Smart, visible contracts — everything is recorded and shared</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="size-3 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 shadow-[0_0_12px_rgba(56,189,248,0.7)]" />
                  <span>Secured funds — money is deposited upfront and released automatically</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="size-3 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 shadow-[0_0_12px_rgba(56,189,248,0.7)]" />
                  <span>Protection for both — programmed rules protect both parties</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="size-3 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 shadow-[0_0_12px_rgba(56,189,248,0.7)]" />
                  <span>Global, simple, fast payments — minimal fees, no crypto knowledge needed</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
