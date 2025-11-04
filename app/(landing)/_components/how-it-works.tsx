'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { FileText, Shield, CheckCircle, Star } from 'lucide-react';
import Link from 'next/link';

interface HowItWorksSectionProps {
  hasUser: boolean;
  hasOrganization: boolean;
}

export function HowItWorksSection({ hasUser, hasOrganization }: HowItWorksSectionProps) {
  const containerRef = React.useRef(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.2 });

  const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    animate: isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  };

  const staggerContainer = {
    initial: {},
    animate: isInView
      ? {
          transition: {
            staggerChildren: 0.2,
            delayChildren: 0.3,
          },
        }
      : {},
  };

  const stepAnimation = {
    initial: { opacity: 0, y: 50, scale: 0.95 },
    animate: isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.95 },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  };

  const getButtonText = () => {
    if (!hasUser) return 'Get Started Today';
    if (!hasOrganization) return 'Go to onboarding';
    return 'Go to platform';
  };

  const getButtonHref = () => {
    if (!hasUser) return '/auth/login';
    if (!hasOrganization) return '/onboarding';
    return '/platform';
  };
  const steps = [
    {
      icon: <FileText className="w-8 h-8 text-sky-300" />,
      title: 'Create a Contract',
      description:
        'Define milestones, dates, and deliverables. Deposit funds upfront in a secure account.',
      details: 'Balances stay visible to both parties from day one.',
    },
    {
      icon: <Shield className="w-8 h-8 text-indigo-300" />,
      title: 'Accept & Align',
      description: 'Freelancer accepts knowing the budget is secured and expectations are clear.',
      details: 'Both parties see everything in one dashboard.',
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-emerald-300" />,
      title: 'Deliver & Approve',
      description: 'Upload work, collect feedback, and approve releases in real time.',
      details: 'Approvals release payments automatically.',
    },
    {
      icon: <Star className="w-8 h-8 text-purple-300" />,
      title: 'Get Paid',
      description:
        'Payments clear instantly when milestones are completed. No delays, no complications.',
      details: 'Simple, secure, and on time.',
    },
  ];

  return (
    <section ref={containerRef} className="relative py-24" id="how-it-works">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-10 h-72 bg-gradient-to-b from-white/10 via-transparent to-transparent blur-3xl" />
        <div className="absolute -left-20 top-1/3 h-52 w-52 rounded-full bg-gradient-to-br from-sky-500/20 to-indigo-600/10 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-64 w-64 rounded-full bg-gradient-to-br from-purple-500/20 to-sky-400/10 blur-3xl" />
      </div>
      <div className="relative max-w-6xl mx-auto px-4">
        <motion.div {...fadeInUp} className="text-center mb-16">
          <span className="inline-flex items-center justify-center rounded-full border border-white/15 bg-slate-900/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-zinc-200/80 backdrop-blur">
            Workflow
          </span>
          <h2 className="mt-6 text-4xl md:text-5xl font-bold text-zinc-50">
            Four Steps from Agreement to Payment
          </h2>
          <p className="mt-4 text-xl text-zinc-300/85 max-w-3xl mx-auto">
            Koopay keeps the flow simple while ensuring trust, transparency, and on-time payments
            every step of the way.
          </p>
        </motion.div>

        <div className="hidden lg:block">
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.98 }}
            animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 60, scale: 0.98 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-3xl border border-white/10 bg-slate-900/60 p-12 shadow-[0_35px_110px_-70px_rgba(79,70,229,0.8)] backdrop-blur-2xl"
          >
            <div className="absolute top-24 left-1/5 right-1/5 h-0.5 bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-400 opacity-60" />

            <motion.div {...staggerContainer} className="grid grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <motion.div key={index} {...stepAnimation} className="text-center">
                  <div className="relative z-10 mb-6 flex flex-col items-center">
                    <div className="w-20 h-20 bg-slate-900/70 rounded-full shadow-[0_18px_40px_-30px_rgba(59,130,246,0.85)] border border-white/15 flex items-center justify-center mb-4 backdrop-blur">
                      {step.icon}
                    </div>
                    <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-br from-sky-400 via-indigo-500 to-purple-500 text-white rounded-full flex items-center justify-center text-sm font-semibold shadow-[0_12px_30px_-20px_rgba(79,70,229,0.8)]">
                      {index + 1}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-100 mb-3">{step.title}</h3>
                  <p className="text-zinc-300/85 mb-2 leading-relaxed">{step.description}</p>
                  <p className="text-sm text-zinc-500 italic">{step.details}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        <div className="lg:hidden">
          <motion.div {...staggerContainer} className="space-y-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                {...stepAnimation}
                className="flex items-start gap-4 rounded-2xl border border-white/12 bg-slate-900/60 p-5 backdrop-blur shadow-[0_20px_60px_-45px_rgba(79,70,229,0.7)]"
              >
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 bg-slate-900/70 rounded-full border border-white/15 flex items-center justify-center backdrop-blur-sm">
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-sky-400 via-indigo-500 to-purple-500 text-white rounded-full flex items-center justify-center text-xs font-semibold shadow-[0_12px_30px_-20px_rgba(79,70,229,0.8)]">
                    {index + 1}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="absolute top-16 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-gradient-to-b from-sky-400 via-indigo-500 to-purple-500 opacity-60" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-zinc-100 mb-2">{step.title}</h3>
                  <p className="text-zinc-300/85 mb-1 leading-relaxed">{step.description}</p>
                  <p className="text-sm text-zinc-500 italic">{step.details}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.98 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.98 }}
          transition={{ duration: 0.8, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 text-center"
        >
          <div className="rounded-3xl border border-white/12 bg-gradient-to-br from-slate-900/80 via-[#0b1120]/70 to-slate-900/60 p-8 md:p-12 shadow-[0_40px_120px_-60px_rgba(59,130,246,0.85)] backdrop-blur-2xl">
            <h3 className="text-2xl md:text-3xl font-semibold text-zinc-100 mb-4">
              Ready to Get Paid on Time, Every Time?
            </h3>
            <p className="text-lg text-zinc-300/85 mb-8 max-w-2xl mx-auto">
              Join freelancers and clients already using Koopay to manage contracts, milestones, and
              payments with complete confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={getButtonHref()}
                className="px-8 py-4 bg-gradient-1 text-white text-sm font-semibold uppercase tracking-wide rounded-full shadow-[0_22px_55px_-20px_rgba(79,70,229,0.85)] transition-all duration-200 hover:brightness-110 text-center"
              >
                {getButtonText()}
              </Link>
              <a
                href="https://youtu.be/RwTcHQS54K4"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 border border-white/15 text-zinc-200/90 text-sm font-semibold uppercase tracking-wide rounded-full hover:bg-slate-900/60 transition-all duration-200 backdrop-blur"
              >
                Watch Demo
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
