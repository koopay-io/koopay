import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mail, Bell } from "lucide-react";

const primaryButtonClasses =
  "px-8 py-4 text-sm font-semibold uppercase tracking-wide rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 hover:brightness-110 text-white shadow-[0_24px_60px_-25px_rgba(79,70,229,0.9)]";

const secondaryButtonClasses =
  "px-8 py-4 text-sm font-semibold uppercase tracking-wide rounded-full border border-white/15 text-zinc-200/90 hover:bg-slate-900/60 backdrop-blur";

export function CTASection() {
  return (
    <section
      id="waitlist-beta"
      className="relative py-24 border-t border-white/10"
    >
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-white/12 via-transparent to-transparent blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-white/10 via-transparent to-transparent blur-3xl" />
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(148,163,184,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.15)_1px,transparent_1px)] [background-size:100px_100px]" />
      </div>
      <div className="relative max-w-4xl mx-auto px-4 text-center">
        <div className="mb-12">
          <span className="inline-flex items-center justify-center rounded-full border border-white/15 bg-slate-900/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-zinc-200/80 backdrop-blur">
            Beta waitlist
          </span>
          <h2 className="mt-6 text-4xl md:text-6xl font-bold text-zinc-50 mb-6 leading-tight">
            Secure Work. Instant Pay. Verified Reputation.
          </h2>
          <p className="text-xl md:text-2xl text-zinc-300/85 mb-8 max-w-3xl mx-auto leading-relaxed">
            Koopay gives freelancers and clients fintech-grade rails without the
            complexity of building it in-house.
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 mx-auto rounded-full" />
        </div>

        <div className="bg-gradient-to-br from-slate-900/80 via-[#0b1120]/70 to-slate-900/60 backdrop-blur-xl rounded-3xl p-8 md:p-12 border border-white/12 shadow-[0_45px_140px_-80px_rgba(79,70,229,0.85)] mb-10">
          <div className="flex items-center justify-center mb-6 text-zinc-100">
            <Bell className="w-7 h-7 text-sky-300 mr-3" />
            <span className="font-semibold uppercase tracking-wide text-xs text-zinc-200/80">
              Beta Launch Coming Soon
            </span>
          </div>

          <div className="max-w-md mx-auto mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0 rounded-2xl sm:rounded-full bg-slate-900/60 border border-white/12 p-2 backdrop-blur">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 w-full px-4 py-3 bg-transparent text-sm text-zinc-200 placeholder-zinc-500 outline-none"
              />
              <Button className="w-full sm:w-auto rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 hover:brightness-110 text-white text-xs font-semibold uppercase tracking-wide px-6">
                <Mail className="w-4 h-4 mr-2" />
                Join Waitlist
              </Button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className={primaryButtonClasses}>
              Request Beta Invite
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className={secondaryButtonClasses}
              asChild
            >
              <a
                href="/video/pitch-demo.mp4"
                target="_blank"
                rel="noopener noreferrer"
              >
                Watch Demo
              </a>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          {[
            {
              title: "Waitlist",
              copy: "Public waitlist opens after private beta validation.",
            },
            {
              title: "Beta",
              copy: "We&apos;re onboarding a small group of freelancers and clients now.",
            },
            {
              title: "Roadmap",
              copy: "Status updates land in your inbox once milestones clear.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-white/12 bg-slate-900/60 p-6 shadow-[0_30px_90px_-70px_rgba(79,70,229,0.8)] backdrop-blur"
            >
              <div className="text-sm font-semibold text-sky-200 uppercase tracking-wide mb-2">
                {item.title}
              </div>
              <div
                className="text-zinc-300/80 text-sm"
                dangerouslySetInnerHTML={{ __html: item.copy }}
              />
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-zinc-400/80 text-sm">
            Join the revolution. No spam, just release notes and roadmap
            invites.
          </p>
        </div>
      </div>
    </section>
  );
}
