import Image from 'next/image';
import React from 'react';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';

export function Footer() {
  const footerLinks = {
    product: [
      { name: 'How it Works', href: '#how-it-works' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'Security', href: '#security' },
      { name: 'API', href: '#api' },
    ],
    company: [
      { name: 'About', href: '#about' },
      { name: 'Blog', href: '#blog' },
      { name: 'Careers', href: '#careers' },
      { name: 'Press', href: '#press' },
    ],
    resources: [
      { name: 'Whitepaper', href: '#whitepaper' },
      { name: 'Documentation', href: '#docs' },
      { name: 'Help Center', href: '#help' },
      { name: 'Community', href: '#community' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '#privacy' },
      { name: 'Terms of Service', href: '#terms' },
      { name: 'Cookie Policy', href: '#cookies' },
      { name: 'Compliance', href: '#compliance' },
    ],
  };

  const socialLinks = [
    { icon: <Twitter className="w-5 h-5" />, href: '#', label: 'Twitter' },
    { icon: <Github className="w-5 h-5" />, href: '#', label: 'GitHub' },
    { icon: <Linkedin className="w-5 h-5" />, href: '#', label: 'LinkedIn' },
    { icon: <Mail className="w-5 h-5" />, href: '#', label: 'Email' },
  ];

  return (
    <footer className="relative border-t border-white/10 text-zinc-300" id="contact">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-slate-900/70 via-transparent to-transparent blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-60 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent blur-3xl" />
        <div className="absolute inset-0 opacity-15 [background-image:linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:90px_90px]" />
      </div>
      <div className="relative max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-6 gap-10">
          <div className="md:col-span-2">
            <div className="mb-6 rounded-3xl border border-white/12 bg-slate-900/60 p-6 backdrop-blur shadow-[0_25px_80px_-60px_rgba(79,70,229,0.75)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative h-9 w-9">
                  <Image
                    src="/mini-logo.svg"
                    alt="Koopay logo"
                    fill
                    className="object-contain drop-shadow-lg"
                    sizes="36px"
                  />
                </div>
                <h3 className="text-2xl font-semibold text-zinc-100">Koopay</h3>
              </div>
              <p className="text-zinc-400/85 leading-relaxed">
                Smart escrow, instant payouts, and portable reputation for the independent economy.
              </p>
            </div>

            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="size-10 rounded-full border border-white/15 bg-slate-900/60 text-zinc-300 hover:text-white hover:border-sky-400/60 transition-all duration-200 flex items-center justify-center backdrop-blur"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-100 mb-4">Product</h4>
            <ul className="space-y-3 text-zinc-400/85">
              {footerLinks.product.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="hover:text-zinc-100 transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-100 mb-4">Company</h4>
            <ul className="space-y-3 text-zinc-400/85">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="hover:text-zinc-100 transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-100 mb-4">Resources</h4>
            <ul className="space-y-3 text-zinc-400/85">
              {footerLinks.resources.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="hover:text-zinc-100 transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-zinc-100 mb-4">Legal</h4>
            <ul className="space-y-3 text-zinc-400/85">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="hover:text-zinc-100 transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="rounded-3xl border border-white/12 bg-slate-900/60 p-6 mt-12 backdrop-blur shadow-[0_25px_90px_-70px_rgba(79,70,229,0.8)]">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="font-semibold text-zinc-100 mb-2">Stay Updated</h4>
              <p className="text-zinc-400/85">Release notes and exclusive previews. No spam.</p>
            </div>
            <div className="flex w-full md:w-auto max-w-md rounded-2xl border border-white/12 bg-slate-900/60 backdrop-blur">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 px-4 py-3 bg-transparent rounded-l-2xl text-zinc-200 placeholder-zinc-500 focus:outline-none"
              />
              <button className="px-6 py-3 bg-gradient-1 hover:brightness-110 text-white font-semibold text-xs uppercase tracking-wide rounded-r-2xl transition-colors duration-200">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-zinc-500/90 gap-4">
          <p>© {new Date().getFullYear()} Koopay. All rights reserved.</p>
          <div className="flex items-center gap-3">
            <span className="text-zinc-400/85">Built for the independent workforce</span>
            <div className="flex items-center gap-2 text-emerald-400">
              <div className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-zinc-500/90">All systems operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
