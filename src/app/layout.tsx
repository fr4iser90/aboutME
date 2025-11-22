import type { Metadata } from 'next'
import Script from 'next/script'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeInit } from './theme-init'
import { getThemeInitScript } from './theme-script'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Patrick B. - Portfolio',
  description: 'Just another fucking vibecoder',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" data-theme="dark" data-design="glassmorphism" suppressHydrationWarning>
      <body className={inter.className}>
        {/* Inline script runs immediately before React loads - prevents white flash */}
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: getThemeInitScript()
          }}
        />
        <ThemeInit />
        <main className="main-content">
          {children}
        </main>
      </body>
    </html>
  )
}
