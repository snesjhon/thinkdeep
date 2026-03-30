import React from 'react'

interface PageLayoutProps {
  aside: React.ReactNode
  children: React.ReactNode
  accentColor?: string | null
}

export function PageLayout({ aside, children, accentColor }: PageLayoutProps) {
  return (
    <div
      style={{
        background: accentColor
          ? `color-mix(in srgb, ${accentColor} 8%, var(--bg))`
          : 'var(--bg)',
      }}
    >
      <div className="block lg:grid items-start gap-12 px-10 py-10 lg:grid-cols-[0.3fr_minmax(250px,1fr)]">
        <aside className="hidden lg:block sticky top-20 self-start max-h-[calc(100vh-5rem)] overflow-y-auto">
          {aside}
        </aside>
        <div className="min-w-0">
          {children}
        </div>
      </div>
    </div>
  )
}
