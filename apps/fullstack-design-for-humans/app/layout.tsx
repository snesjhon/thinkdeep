import type { Metadata } from 'next'
import { Space_Grotesk, Sora } from 'next/font/google'
import { SiteHeader } from '@for-humans/ui'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
})

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Fullstack for Humans',
  description: 'Learn fullstack development by building a real app — guided by mental models, checked by Claude.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${sora.variable}`}>
      <body className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
        <SiteHeader
          title="Fullstack for Humans"
          homeHref="/path"
          navLinks={[{ href: '/settings', label: 'Settings' }]}
        />
        <main className="w-full">{children}</main>
      </body>
    </html>
  )
}
