import React from 'react';
import { FileText, Shield, CheckCircle, Star } from 'lucide-react';
import Link from 'next/link';

interface HowItWorksSectionProps {
  hasUser: boolean;
  hasOrganization: boolean;
}

export function HowItWorksSection({ hasUser, hasOrganization }: HowItWorksSectionProps) {
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
      title: 'Client Posts Brief',
      description:
        'Scope the project, lock funds in escrow, and outline milestone checkpoints in minutes.',
      details: 'Balances stay visible to both parties from day one.',
    },
    {
      icon: <Shield className="w-8 h-8 text-indigo-300" />,
      title: 'Freelancer Accepts',
      description:
        'Verified talent accepts work knowing budgets are secured and timelines are agreed upfront.',
      details: 'Productized milestones keep everyone aligned.',
    },
    {
      icon: <CheckCircle className="w-8 h-8 text-emerald-300" />,
      title: 'Deliver & Review',
      description:
        'Upload deliverables, collect feedback, and trigger automated approvals inside Koopay.',
      details: 'Approvals release payouts instantly.',
    },
    {
      icon: <Star className="w-8 h-8 text-purple-300" />,
      title: 'Payout & Reputation',
      description:
        'Funds land in wallets while both sides earn verifiable reputation that travels everywhere.',
      details: 'Profiles update the moment milestones close.',
    },
  ];

  return (
    <section className="relative py-24" id="how-it-works">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-10 h-72 bg-gradient-to-b from-white/10 via-transparent to-transparent blur-3xl" />
        <div className="absolute -left-20 top-1/3 h-52 w-52 rounded-full bg-gradient-to-br from-sky-500/20 to-indigo-600/10 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-64 w-64 rounded-full bg-gradient-to-br from-purple-500/20 to-sky-400/10 blur-3xl" />
      </div>
      <div className="relative max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-flex items-center justify-center rounded-full border border-white/15 bg-slate-900/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-zinc-200/80 backdrop-blur">
            Workflow
          </span>
          <h2 className="mt-6 text-4xl md:text-5xl font-bold text-zinc-50">
            Four Steps from Brief to Payout
          </h2>
          <p className="mt-4 text-xl text-zinc-300/85 max-w-3xl mx-auto">
            Koopay keeps the flow intuitive while the infrastructure quietly guarantees trust,
            compliance, and payouts.
          </p>
        </div>

        <div className="hidden lg:block">
          <div className="relative rounded-3xl border border-white/10 bg-slate-900/60 p-12 shadow-[0_35px_110px_-70px_rgba(79,70,229,0.8)] backdrop-blur-2xl">
            <div className="absolute top-24 left-1/5 right-1/5 h-0.5 bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-400 opacity-60" />

            <div className="grid grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="text-center">
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
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:hidden">
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div
                key={index}
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
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 text-center">
          <div className="rounded-3xl border border-white/12 bg-gradient-to-br from-slate-900/80 via-[#0b1120]/70 to-slate-900/60 p-8 md:p-12 shadow-[0_40px_120px_-60px_rgba(59,130,246,0.85)] backdrop-blur-2xl">
            <h3 className="text-2xl md:text-3xl font-semibold text-zinc-100 mb-4">
              Ready to Ship Confident Projects?
            </h3>
            <p className="text-lg text-zinc-300/85 mb-8 max-w-2xl mx-auto">
              Join builders already managing escrow, payouts, and reputation with Koopay&apos;s
              all-in-one dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href={getButtonHref()}
                className="px-8 py-4 bg-gradient-1 text-white text-sm font-semibold uppercase tracking-wide rounded-full shadow-[0_22px_55px_-20px_rgba(79,70,229,0.85)] transition-all duration-200 hover:brightness-110 text-center"
              >
                {getButtonText()}
              </Link>
              <a
                href="/landing/pitch-demo.mp4"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 border border-white/15 text-zinc-200/90 text-sm font-semibold uppercase tracking-wide rounded-full hover:bg-slate-900/60 transition-all duration-200 backdrop-blur"
              >
                Watch Demo
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
