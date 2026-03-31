import type { Metadata } from 'next';
import { Newsreader, Plus_Jakarta_Sans } from 'next/font/google';
import { SiteNav } from '@/components/ui';
import { getAllProblems } from '@/lib/dsa/content';
import { getAllFundamentalsSlugs } from '@/lib/dsa/fundamentals';
import { getAllScenarioSlugsFromDisk as getSdScenarios } from '@/lib/system-design/content';
import { getAllFundamentalsSlugs as getSdFundamentals } from '@/lib/system-design/fundamentals';
import { getAllScenarioSlugsFromDisk as getFsScenarios } from '@/lib/fullstack/content';
import { getAllFundamentalsSlugs as getFsFundamentals } from '@/lib/fullstack/fundamentals';
import './globals.css';

const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '600'],
  style: ['normal', 'italic'],
  adjustFontFallback: false,
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'MentalSystems',
  description:
    'A structured learning platform for DSA, system design, and fullstack development.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const availableProblemIds = getAllProblems().map((p) => p.id);
  const availableFundamentalsSlugs = getAllFundamentalsSlugs();

  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${plusJakarta.variable}`}
    >
      <body
        className="min-h-screen bg-[var(--bg)] text-[var(--fg)]"
        style={{ paddingLeft: '260px' }}
      >
        <SiteNav
          availableProblemIds={availableProblemIds}
          availableFundamentalsSlugs={availableFundamentalsSlugs}
          availableSystemDesignScenarioSlugs={getSdScenarios()}
          availableSystemDesignFundamentalsSlugs={getSdFundamentals()}
          availableFullstackScenarioSlugs={getFsScenarios()}
          availableFullstackFundamentalsSlugs={getFsFundamentals()}
        />
        <main className="w-full">{children}</main>
      </body>
    </html>
  );
}
