import React from "react";
import { AlertCircle, Clock, CreditCard, Users } from "lucide-react";

export function ProblemSection() {
  const problems = [
    {
      icon: <CreditCard className="w-8 h-8 text-rose-300" />,
      title: "High Fees",
      description:
        "Legacy platforms hold 15-20% of every invoice, shrinking freelancer margins overnight.",
    },
    {
      icon: <Clock className="w-8 h-8 text-sky-300" />,
      title: "Delayed Payments",
      description:
        "Weeks-long payout windows make cashflow unpredictable for independents and agencies alike.",
    },
    {
      icon: <AlertCircle className="w-8 h-8 text-amber-300" />,
      title: "Payment Disputes",
      description:
        "Opaque dispute processes force teams to swallow unpaid work or damage relationships.",
    },
    {
      icon: <Users className="w-8 h-8 text-indigo-300" />,
      title: "Trust Issues",
      description:
        "Both sides start projects unsure whether funds are secured or milestones are enforceable.",
    },
  ];

  return (
    <section className="relative py-24" id="pain-points">
      <div className="absolute inset-x-10 -top-24 h-56 rounded-full bg-gradient-to-r from-sky-500/20 via-indigo-500/15 to-purple-500/20 blur-3xl" />
      <div className="absolute inset-y-0 left-1/2 hidden w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-white/10 to-transparent lg:block" />
      <div className="relative max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-flex items-center justify-center rounded-full border border-white/15 bg-slate-900/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-zinc-200/80 backdrop-blur">
            Problems we fix
          </span>
          <h2 className="mt-6 text-4xl md:text-5xl font-bold text-zinc-50">
            Why Trust Breaks on Traditional Platforms
          </h2>
          <p className="mt-4 text-xl text-zinc-300/85 max-w-3xl mx-auto">
            The classic freelancer stack optimises for platform rake, not project health. Koopay replaces it with transparent escrow, instant payouts, and enforceable milestones.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {problems.map((problem, index) => (
            <div
              key={index}
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
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-white/12 bg-gradient-to-br from-slate-900/80 via-[#0b1120]/70 to-slate-900/60 p-8 md:p-12 shadow-[0_40px_120px_-60px_rgba(59,130,246,0.85)] backdrop-blur-2xl">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h3 className="text-2xl font-semibold text-zinc-100 mb-6">
                Status Quo Freelance Platforms
              </h3>
              <div className="space-y-4 text-zinc-400/90">
                <div className="flex items-center gap-3">
                  <div className="size-3 rounded-full bg-gradient-to-br from-rose-400 to-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)]" />
                  <span>15-20% platform rake per transaction</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="size-3 rounded-full bg-gradient-to-br from-rose-400 to-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)]" />
                  <span>15-30 day payout delays for freelancers</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="size-3 rounded-full bg-gradient-to-br from-rose-400 to-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)]" />
                  <span>Minimal protection when disputes arise</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="size-3 rounded-full bg-gradient-to-br from-rose-400 to-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.6)]" />
                  <span>Trust handled manually &mdash; if at all</span>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/15 bg-gradient-to-br from-sky-400/20 via-indigo-500/10 to-transparent p-8 shadow-[0_25px_80px_-50px_rgba(79,70,229,0.9)]">
              <h3 className="text-2xl font-semibold text-zinc-100 mb-6">Koopay Unlocks Fair Projects</h3>
              <div className="space-y-4 text-zinc-200/90">
                <div className="flex items-center gap-3">
                  <div className="size-3 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 shadow-[0_0_12px_rgba(56,189,248,0.7)]" />
                  <span>Flat 3% transaction fee with transparent pricing</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="size-3 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 shadow-[0_0_12px_rgba(56,189,248,0.7)]" />
                  <span>Instant stablecoin payouts once milestones clear</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="size-3 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 shadow-[0_0_12px_rgba(56,189,248,0.7)]" />
                  <span>Smart contract arbitration keeps work protected</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="size-3 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 shadow-[0_0_12px_rgba(56,189,248,0.7)]" />
                  <span>Escrowed funds build confidence before work starts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
