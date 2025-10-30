import React from "react";

export function BackgroundAurora() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-20 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(129,140,248,0.18),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(236,72,153,0.12),transparent_60%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,23,42,0.4)_0%,rgba(15,23,42,0)_45%,rgba(79,70,229,0.1)_60%,rgba(30,41,59,0.45)_100%)]" />
      <div className="absolute inset-x-0 top-[15%] h-64 -skew-y-6 bg-gradient-to-r from-blue-500/25 via-indigo-500/20 to-purple-500/25 blur-3xl" />
      <div className="absolute -left-1/3 top-1/3 h-[420px] w-[420px] rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/20 blur-3xl" />
      <div className="absolute -right-1/4 bottom-0 h-[520px] w-[520px] rounded-full bg-gradient-to-br from-sky-500/25 via-blue-500/20 to-transparent blur-3xl" />
      <div className="absolute inset-0 opacity-[0.12] [background-image:linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:80px_80px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_65%)]" />
    </div>
  );
}
