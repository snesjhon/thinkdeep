import React from 'react';
import { RightPanel } from '../RightPanel/RightPanel';

interface TDPageLayoutProps {
  hero: React.ReactNode;
  progress?: React.ReactNode;
  aside: React.ReactNode;
  children: React.ReactNode;
}

export function TDPageLayout({
  hero,
  progress,
  aside,
  children,
}: TDPageLayoutProps) {
  return (
    <div className="grid min-h-screen grid-cols-[minmax(0,1fr)_auto]">
      <div className="min-w-0">
        {hero}
        <div className="px-10 py-10 2xl:px-24">{children}</div>
      </div>
      <RightPanel progress={progress} toc={aside} />
    </div>
  );
}
