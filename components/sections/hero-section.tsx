import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const primaryButtonClasses =
  "px-8 py-4 text-sm font-semibold uppercase tracking-wide rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 hover:brightness-110 text-white shadow-[0_20px_45px_-15px_rgba(99,102,241,0.7)]";

const secondaryButtonClasses =
  "px-8 py-4 text-sm font-semibold uppercase tracking-wide rounded-full border border-white/20 text-zinc-200/90 hover:bg-white/10 backdrop-blur";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden min-h-screen flex items-center justify-center px-4 pt-28 pb-24">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-white/10 via-transparent to-transparent blur-3xl" />
        <div className="absolute -right-32 top-24 h-72 w-72 rounded-full bg-gradient-to-br from-indigo-500/30 to-sky-500/20 blur-3xl" />
        <div className="absolute -left-32 bottom-10 h-80 w-80 rounded-full bg-gradient-to-br from-purple-500/25 to-indigo-500/20 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </div>

      <div className="max-w-5xl mx-auto text-center">
        <div className="mb-12 space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-zinc-100 shadow-[0_10px_30px_-15px_rgba(148,163,184,0.9)] backdrop-blur">
            Future of freelance payments
          </span>
          <h1 className="text-5xl md:text-7xl font-bold text-zinc-50 leading-tight drop-shadow-[0_25px_60px_rgba(37,99,235,0.25)]">
            <span className="text-gradient bg-gradient-to-r from-sky-300 via-indigo-200 to-purple-300">
              Secure payments
            </span>{" "}
            for freelancers
          </h1>
          <p className="text-lg md:text-2xl text-zinc-300/90 max-w-3xl mx-auto leading-relaxed">
            Koopay locks every project inside secure escrow, pushes instant
            stablecoin payouts, and keeps your reputation portable across the
            web.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Button size="lg" className={primaryButtonClasses}>
            Join the Waitlist
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className={secondaryButtonClasses}
          >
            Learn More
          </Button>
        </div>

        <div className="relative max-w-3xl mx-auto">
          <div className="rounded-3xl border border-white/15 bg-white/5 p-4 sm:p-6 md:p-8 shadow-[0_30px_80px_-40px_rgba(59,130,246,0.95)] backdrop-blur-2xl">
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0f172a]/90 via-[#0b1120]/80 to-[#111827]/90 backdrop-blur">
              <video
                className="h-full w-full object-cover"
                src="/video/pitch-demo.mp4"
                preload="metadata"
                controls
                playsInline
                poster="/video/pitch-demo-thumbnail.svg"
              >
                Your browser does not support the Koopay product demo video.
              </video>
              <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-100 backdrop-blur">
                Live product demo
              </div>
            </div>
            <p className="mt-4 text-sm text-zinc-400/80 text-center">
              Watch the Koopay walkthrough recorded from our latest internal
              beta build.
            </p>
          </div>
          <div className="pointer-events-none absolute inset-x-10 -bottom-10 h-28 rounded-full bg-gradient-to-r from-sky-500/25 via-indigo-500/20 to-purple-500/25 blur-3xl" />
        </div>
      </div>
    </section>
  );
}
