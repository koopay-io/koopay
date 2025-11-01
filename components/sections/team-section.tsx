import Image from "next/image";
import React from "react";

const teamMembers = [
  {
    name: "Steven Molina",
    role: "Blockchain Developer",
    bio: "Specialises in decentralised architectures and smart contracts, bringing automation and security to Koopay's escrow system.",
    image: "/team/steven.jpg",
  },
  {
    name: "Tomas Salina",
    role: "Full-Stack Developer",
    bio: "Builds scalable, user-friendly applications to keep Koopay fast, reliable, and intuitive for freelancers and clients.",
    image: "/team/tomas.jpg",
  },
  {
    name: "Renzo Barcos",
    role: "Full-Stack Developer",
    bio: "Bridges backend and frontend to deliver smooth milestone management and seamless integrations across web technologies.",
    image: "/team/renzo.jpg",
  },
  {
    name: "Micaela Descotte",
    role: "Web3 Designer",
    bio: "Designs human-centred experiences that translate complex blockchain flows into simple, beautiful interfaces.",
    image: "/team/micaela.jpg",
  },
];

export function TeamSection() {
  return (
    <section className="relative py-24" id="team">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-white/10 via-transparent to-transparent blur-3xl" />
        <div className="absolute -right-24 top-1/2 h-64 w-64 rounded-full bg-gradient-to-br from-sky-500/20 to-purple-500/15 blur-3xl" />
      </div>
      <div className="relative max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-flex items-center justify-center rounded-full border border-white/15 bg-slate-900/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-zinc-200/80 backdrop-blur">
            Builders
          </span>
          <h2 className="mt-6 text-4xl md:text-5xl font-bold text-zinc-50">Our Team</h2>
          <p className="mt-4 text-xl text-zinc-300/85 max-w-4xl mx-auto">
            Koopay is built by a passionate team of young builders from Buenos Aires, combining blockchain expertise, full-stack development, and Web3 design. Together, we are shaping a secure, seamless, and fair freelancing experience for the next generation of global work.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {teamMembers.map((member) => (
            <div
              key={member.name}
              className="group relative overflow-hidden rounded-3xl border border-white/12 bg-slate-900/60 p-6 shadow-[0_28px_80px_-55px_rgba(99,102,241,0.75)] backdrop-blur-xl text-center"
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-white/15 via-transparent to-transparent" />
              <div className="relative flex flex-col items-center gap-4">
                <div className="relative w-28 h-28 overflow-hidden rounded-2xl border border-white/15 bg-slate-900/70 backdrop-blur">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 112px, 140px"
                  />
                </div>
                <h3 className="text-xl font-semibold text-zinc-100">{member.name}</h3>
                <p className="text-sky-200 text-sm uppercase tracking-wide">{member.role}</p>
                <p className="text-sm text-zinc-300/85 leading-relaxed">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-white/12 bg-gradient-to-br from-slate-900/80 via-[#0b1120]/70 to-slate-900/60 p-8 md:p-12 shadow-[0_40px_120px_-65px_rgba(59,130,246,0.85)] backdrop-blur-2xl text-center">
          <h3 className="text-3xl font-semibold text-zinc-100 mb-4">Work With Us</h3>
          <p className="text-lg text-zinc-300/85 max-w-2xl mx-auto mb-8">
            We collaborate openly with freelancers, founders, and partners who believe in trust-first payments. Reach out if you are exploring ecosystem partnerships, beta testing, or strategic support.
          </p>
          <a
            href="mailto:team@koopay.xyz"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600 text-white text-xs font-semibold uppercase tracking-wide rounded-full shadow-[0_22px_55px_-20px_rgba(79,70,229,0.85)] hover:brightness-110"
          >
            <span>Contact the Team</span>
          </a>
        </div>
      </div>
    </section>
  );
}
