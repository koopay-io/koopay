'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, ArrowRight } from 'lucide-react';

interface NavigationProps {
  hasUser: boolean;
  hasOrganization: boolean;
}

export function Navigation({ hasUser, hasOrganization }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const navItems = [
    { name: 'How it Works', href: '#how-it-works' },
    { name: 'Features', href: '#features' },
    { name: 'Vision', href: '#vision' },
  ];

  const primaryCtaClasses =
    'bg-gradient-1 hover:brightness-110 text-white uppercase tracking-wide text-xs font-semibold rounded-full shadow-[0_18px_45px_-20px_rgba(79,70,229,0.85)]';

  const getButtonText = () => {
    if (!hasUser) return 'Log in';
    if (!hasOrganization) return 'Go to onboarding';
    return 'Go to platform';
  };

  const getButtonHref = () => {
    if (!hasUser) return '/auth/login';
    if (!hasOrganization) return '/onboarding';
    return '/platform';
  };

  return (
    <nav className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <div className="w-full max-w-6xl">
        <div className="flex items-center justify-between rounded-full border border-white/15 bg-slate-900/60 px-5 py-3 shadow-[0_25px_70px_-40px_rgba(79,70,229,0.85)] backdrop-blur-2xl">
          <Link href="/" className="flex items-center gap-3" aria-label="Koopay home">
            <div className="relative h-9 w-9">
              <Image
                src="/mini-logo.svg"
                alt="Koopay logo"
                fill
                className="object-contain drop-shadow-lg"
                sizes="36px"
                priority
              />
            </div>
            <span className="text-lg font-semibold text-zinc-100">Koopay</span>
          </Link>

          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-zinc-200/90 hover:text-white px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap"
                >
                  {item.name}
                </a>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center">
            <Button className={primaryCtaClasses} asChild>
              <Link href={getButtonHref()}>
                {getButtonText()}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-zinc-200 hover:text-white focus:outline-none focus:text-white p-2"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden">
            <div className="mt-3 space-y-2 rounded-3xl border border-white/12 bg-slate-900/60 p-4 shadow-[0_30px_80px_-50px_rgba(79,70,229,0.8)] backdrop-blur-2xl">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-zinc-200/90 hover:text-white block px-3 py-2 text-base font-medium transition-colors whitespace-nowrap"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <div className="pt-4">
                <Button className={`${primaryCtaClasses} w-full justify-center`} asChild>
                  <a href="#waitlist-beta">
                    Join Waitlist
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
