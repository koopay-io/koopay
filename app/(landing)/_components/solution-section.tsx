'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { Shield, Zap, Star, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const primaryButtonClasses =
  'bg-gradient-1 hover:brightness-110 text-white px-8 py-3 text-sm font-semibold uppercase tracking-wide rounded-full shadow-[0_22px_55px_-20px_rgba(79,70,229,0.85)]';

interface SolutionSectionProps {
  hasUser: boolean;
  hasOrganization: boolean;
}

export function SolutionSection({ hasUser, hasOrganization }: SolutionSectionProps) {
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
        staggerChildren: 0.15,
        delayChildren: 0.2
      }
    } : {}
  };

  const itemAnimation = {
    initial: { opacity: 0, y: 40, scale: 0.95 },
    animate: isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 40, scale: 0.95 },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }
  };

  const getButtonText = () => {
    if (!hasUser) return 'Begin now';
    if (!hasOrganization) return 'Go to onboarding';
    return 'Go to platform';
  };

  const getButtonHref = () => {
    if (!hasUser) return '/auth/login';
    if (!hasOrganization) return '/onboarding';
    return '/platform';
  };
  const features = [
    {
      icon: <Shield className="w-12 h-12 text-sky-300" />,
      title: 'Secure Contracts',
      description:
        'The client creates a contract with milestones, dates, and deliverables, and deposits funds upfront in a secure account. The freelancer works in peace, knowing the money is already reserved.',
      benefits: [
        'Contracts created automatically',
        'Shared balance visibility',
        'Automated dispute resolution',
      ],
    },
    {
      icon: <Zap className="w-12 h-12 text-indigo-200" />,
      title: 'Automatic Payments',
      description:
        'When a milestone is completed, Koopay automatically releases payment, ensuring fairness and avoiding delays. Built on Stellar for global reach, near-zero fees, and instant payments.',
      benefits: ['Same-day settlements', 'Low fees', 'Global reach'],
    },
    {
      icon: <Star className="w-12 h-12 text-purple-200" />,
      title: 'Real-Time Tracking',
      description:
        'Both parties see the status of payments, deadlines, deliveries, and reviews in one dashboard. If a conflict arises, the rules are programmed in the smart contract, protecting both sides.',
      benefits: ['Clear visibility', 'Transparent process', 'Protected payments'],
    },
  ];

  return (
    <section ref={containerRef} className="relative py-24" id="features">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="absolute inset-x-0 -top-32 h-64 bg-gradient-to-b from-white/10 via-transparent to-transparent blur-3xl" />
      <div className="relative max-w-6xl mx-auto px-4">
        <motion.div {...fadeInUp} className="text-center mb-16">
          <span className="inline-flex items-center justify-center rounded-full border border-white/15 bg-slate-900/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-zinc-200/80 backdrop-blur">
            Why Koopay wins
          </span>
          <h2 className="mt-6 text-4xl md:text-5xl font-bold text-zinc-50">
            A Secure Payment Method for When There's Distrust
          </h2>
          <p className="mt-4 text-xl text-zinc-300/85 max-w-3xl mx-auto">
            Koopay is a decentralized, transparent payment management platform that lets freelancers and clients collaborate with complete confidence. No crypto knowledge needed — just simple, secure payments.
          </p>
          <div className="mt-8 w-24 h-1 bg-gradient-1 mx-auto rounded-full" />
        </motion.div>

        <motion.div {...staggerContainer} className="grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              {...itemAnimation}
              className="group relative overflow-hidden rounded-3xl border border-white/12 bg-slate-900/60 p-8 shadow-[0_25px_75px_-50px_rgba(79,70,229,0.85)] backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-white/15 via-transparent to-transparent" />
              <div className="relative text-center flex flex-col items-center gap-6">
                <div className="w-20 h-20 bg-slate-900/70 rounded-2xl flex items-center justify-center border border-white/15 backdrop-blur-sm">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-semibold text-zinc-100">{feature.title}</h3>
                <p
                  className="text-zinc-300/90 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: feature.description }}
                />
                <div className="w-full border-t border-white/10 pt-6 space-y-3 text-left">
                  {feature.benefits.map((benefit, benefitIndex) => (
                    <div
                      key={benefitIndex}
                      className="flex items-center gap-3 text-sm text-zinc-200/90"
                    >
                      <div className="size-1.5 rounded-full bg-gradient-1" />
                      <span dangerouslySetInnerHTML={{ __html: benefit }} />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.98 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 60, scale: 0.98 }}
          transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl border border-white/12 bg-gradient-to-br from-slate-900/80 via-[#0b1120]/70 to-slate-900/60 p-8 md:p-12 shadow-[0_40px_130px_-65px_rgba(59,130,246,0.9)] backdrop-blur-2xl"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="grid md:grid-cols-2 gap-12 items-center"
          >
            <div className="space-y-6">
              <h3 className="text-3xl font-semibold text-zinc-100">
                How Koopay Works
              </h3>
              <p className="text-lg text-zinc-300/85 leading-relaxed">
                Instead of relying on chat agreements or manual transfers, Koopay uses smart escrow contracts to automate every stage of the project: from the initial agreement to delivery and payment.
              </p>
              <div className="space-y-4 text-zinc-200/90">
                <div className="flex items-start gap-3">
                  <div className="mt-1 size-2 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 shadow-[0_0_10px_rgba(56,189,248,0.6)]" />
                  <div>
                    <h4 className="font-semibold text-zinc-100">Client Creates Contract</h4>
                    <p className="text-sm text-zinc-400/90">
                      Define scope, deliverables, deadlines, and milestones. Deposit funds upfront in a secure account.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 size-2 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 shadow-[0_0_10px_rgba(167,139,250,0.6)]" />
                  <div>
                    <h4 className="font-semibold text-zinc-100">Freelancer Works Securely</h4>
                    <p className="text-sm text-zinc-400/90">
                      Work with peace of mind knowing the money is already reserved. When milestones are completed, payments release automatically.
                    </p>
                  </div>
                </div>
              </div>
              <Button className={primaryButtonClasses} asChild>
                <Link href={getButtonHref()}>
                  {getButtonText()}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="rounded-3xl border border-white/15 bg-gradient-to-br from-sky-500/25 via-[#0b1120]/70 to-transparent p-8 shadow-[0_30px_110px_-70px_rgba(99,102,241,0.8)] backdrop-blur-xl">
              <div className="text-center space-y-6">
                <div className="w-24 h-24 mx-auto bg-slate-900/70 rounded-full flex items-center justify-center border border-white/15 backdrop-blur">
                  <Shield className="w-10 h-10 text-sky-300" />
                </div>
                <h4 className="text-xl font-semibold text-zinc-100">Simple & Secure</h4>
                <p className="text-zinc-300/80">
                  Built on Stellar, Koopay combines global reach, near-zero fees, and instant payments with a simple, intuitive experience. No crypto knowledge required.
                </p>
                <div className="grid grid-cols-1 gap-4 text-left lg:grid-cols-3">
                  {[
                    {
                      title: 'Global',
                      copy: 'Send and receive payments anywhere in the world, instantly.',
                    },
                    {
                      title: 'Low Fees',
                      copy: 'Minimal transaction fees — no hidden costs or surprise charges.',
                    },
                    {
                      title: 'Instant',
                      copy: 'Payments clear immediately when milestones are completed.',
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 backdrop-blur"
                    >
                      <div className="text-xs font-semibold text-sky-200 uppercase tracking-wide">
                        {item.title}
                      </div>
                      <p className="text-[13px] text-zinc-300/80 mt-2">{item.copy}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
