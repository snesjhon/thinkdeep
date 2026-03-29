'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export interface NavLink {
  href: string;
  label: string;
}

export interface SiteHeaderProps {
  title: string;
  homeHref?: string;
  icon?: React.ReactNode;
  navLinks?: NavLink[];
}

export function SiteHeader({
  title,
  homeHref = '/',
  icon,
  navLinks = [],
}: SiteHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
    const check = () => setScrolled(window.scrollY > 12);
    check();
    window.addEventListener('scroll', check, { passive: true });
    return () => window.removeEventListener('scroll', check);
  }, []);

  const toggleDark = () => {
    const next = !dark;
    document.documentElement.classList.toggle('dark', next);
    setDark(next);
  };

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        background: scrolled
          ? 'color-mix(in srgb, var(--active-phase-color) 9%, color-mix(in srgb, var(--bg) 87%, transparent))'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(16px) saturate(1.3)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(16px) saturate(1.3)' : 'none',
        transition: 'background 500ms ease',
      }}
    >
      <div className="relative">
        <nav className="w-full flex items-center gap-6 h-[68px] px-10">
          <Link
            href={homeHref}
            className="no-underline flex items-center gap-[10px] shrink-0 focus:outline-none"
          >
            {icon}
            <span
              className="italic font-normal text-[1.125rem] text-[var(--fg)] tracking-[-0.01em]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {title}
            </span>
          </Link>

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm transition-opacity hover:opacity-70 text-[var(--fg-comment)] no-underline"
            >
              {link.label}
            </Link>
          ))}

          <div className="ml-auto" />

          <button
            onClick={toggleDark}
            aria-label="Toggle dark mode"
            className="bg-transparent border border-[var(--border)] rounded-[6px] px-[8px] py-[4px] cursor-pointer text-[var(--fg-comment)] text-[14px] leading-none shrink-0"
          >
            {dark ? '☀' : '◑'}
          </button>
        </nav>

        <div
          aria-hidden="true"
          className="absolute bottom-0 left-0 right-0 h-px pointer-events-none"
          style={{
            background:
              'color-mix(in srgb, var(--active-phase-color) 30%, transparent)',
            opacity: scrolled ? 1 : 0,
            transition: 'opacity 450ms ease',
          }}
        />
      </div>
    </header>
  );
}
