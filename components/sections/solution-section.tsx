import React from "react";
import { Shield, Zap, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const primaryButtonClasses =
  "bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 hover:brightness-110 text-white px-8 py-3 text-sm font-semibold uppercase tracking-wide rounded-full shadow-[0_22px_55px_-20px_rgba(79,70,229,0.85)]";

export function SolutionSection() {
  const features = [
    {
      icon: <Shield className="w-12 h-12 text-sky-300" />,
      title: "Smart Escrow",
      description:
        "Milestone-based smart contracts lock funds until both sides sign off on deliverables.",
      benefits: [
        "Escrow created automatically",
        "Shared balance visibility",
        "On-chain dispute automation",
      ],
    },
    {
      icon: <Zap className="w-12 h-12 text-indigo-200" />,
      title: "Instant Payouts",
      description:
        "Stablecoin rails deliver cleared milestones in seconds &mdash; no banking delays or FX fees.",
      benefits: [
        "Same-day settlements",
        "Programmable stablecoins",
        "Compliance-ready ledger",
      ],
    },
    {
      icon: <Star className="w-12 h-12 text-purple-200" />,
      title: "Portable Reputation",
      description:
        "Every milestone writes verifiable reputation to a portable Koopay profile you own.",
      benefits: [
        "On-chain proof of work",
        "Shareable profile",
        "Cross-platform trust",
      ],
    },
  ];

  return (
    <section className="relative py-24" id="features">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <div className="absolute inset-x-0 -top-32 h-64 bg-gradient-to-b from-white/10 via-transparent to-transparent blur-3xl" />
      <div className="relative max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-flex items-center justify-center rounded-full border border-white/15 bg-slate-900/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-zinc-200/80 backdrop-blur">
            Why Koopay wins
          </span>
          <h2 className="mt-6 text-4xl md:text-5xl font-bold text-zinc-50">
            Koopay is the Trust Layer for Freelance Teams
          </h2>
          <p className="mt-4 text-xl text-zinc-300/85 max-w-3xl mx-auto">
            Escrow, instant payouts, and verifiable reputation converge in one
            workflow, giving both sides a dashboard-level view of every project.
          </p>
          <div className="mt-8 w-24 h-1 bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 mx-auto rounded-full" />
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-3xl border border-white/12 bg-slate-900/60 p-8 shadow-[0_25px_75px_-50px_rgba(79,70,229,0.85)] backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-white/15 via-transparent to-transparent" />
              <div className="relative text-center flex flex-col items-center gap-6">
                <div className="w-20 h-20 bg-slate-900/70 rounded-2xl flex items-center justify-center border border-white/15 backdrop-blur-sm">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-semibold text-zinc-100">
                  {feature.title}
                </h3>
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
                      <div className="size-1.5 rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600" />
                      <span dangerouslySetInnerHTML={{ __html: benefit }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-white/12 bg-gradient-to-br from-slate-900/80 via-[#0b1120]/70 to-slate-900/60 p-8 md:p-12 shadow-[0_40px_130px_-65px_rgba(59,130,246,0.9)] backdrop-blur-2xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h3 className="text-3xl font-semibold text-zinc-100">
                One Command Center for Secure Collaborations
              </h3>
              <p className="text-lg text-zinc-300/85 leading-relaxed">
                Koopay packages audited smart contracts, instant payouts, and
                transparent reporting without the crypto overwhelm. Spin up
                escrow accounts, automate releases, and keep every stakeholder
                informed.
              </p>
              <div className="space-y-4 text-zinc-200/90">
                <div className="flex items-start gap-3">
                  <div className="mt-1 size-2 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 shadow-[0_0_10px_rgba(56,189,248,0.6)]" />
                  <div>
                    <h4 className="font-semibold text-zinc-100">
                      For Freelancers
                    </h4>
                    <p className="text-sm text-zinc-400/90">
                      Guaranteed funds, payout alerts, and reputation that
                      travels with every win.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-1 size-2 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 shadow-[0_0_10px_rgba(167,139,250,0.6)]" />
                  <div>
                    <h4 className="font-semibold text-zinc-100">For Clients</h4>
                    <p className="text-sm text-zinc-400/90">
                      Milestones stay accountable with escrow-backed approvals
                      and dispute automation.
                    </p>
                  </div>
                </div>
              </div>
              <Button className={primaryButtonClasses}>
                Join the Waitlist
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <div className="rounded-3xl border border-white/15 bg-gradient-to-br from-sky-500/25 via-[#0b1120]/70 to-transparent p-8 shadow-[0_30px_110px_-70px_rgba(99,102,241,0.8)] backdrop-blur-xl">
              <div className="text-center space-y-6">
                <div className="w-24 h-24 mx-auto bg-slate-900/70 rounded-full flex items-center justify-center border border-white/15 backdrop-blur">
                  <Shield className="w-10 h-10 text-sky-300" />
                </div>
                <h4 className="text-xl font-semibold text-zinc-100">
                  Audit-Ready Infrastructure
                </h4>
                <p className="text-zinc-300/80">
                  Every contract ships with logs, permissions, and risk controls
                  aligned to fintech standards.
                </p>
                <div className="grid grid-cols-1 gap-4 text-left lg:grid-cols-3">
                  {[
                    {
                      title: "Reliability",
                      copy: "Redundant infrastructure and audits are in progress for beta launch.",
                    },
                    {
                      title: "Pricing",
                      copy: "Pricing experiments are underway; final fee structure will be shared pre-launch.",
                    },
                    {
                      title: "Payouts",
                      copy: "Instant stablecoin payouts are planned; settlement timing will be validated with beta users.",
                    },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 backdrop-blur"
                    >
                      <div className="text-xs font-semibold text-sky-200 uppercase tracking-wide">
                        {item.title}
                      </div>
                      <p className="text-[13px] text-zinc-300/80 mt-2">
                        {item.copy}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
