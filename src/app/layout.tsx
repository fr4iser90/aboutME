import type { Metadata } from 'next'
import Script from 'next/script'
import { Inter } from 'next/font/google'
import fs from 'fs'
import path from 'path'
import './globals.css'
import { ThemeInit } from './theme-init'
import { getThemeInitScript } from './theme-script'

const inter = Inter({ subsets: ['latin'] })

function readSiteMeta(): Metadata {
  try {
    const configPath = path.join(process.cwd(), 'public/data/config/config.json')
    const userPath = path.join(process.cwd(), 'public/data/user/user.json')
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
    const user = JSON.parse(fs.readFileSync(userPath, 'utf8'))
    const title =
      config.seo?.title ||
      config.portfolio?.title ||
      (user.name ? `${user.name} — Portfolio` : 'Portfolio')
    const description =
      config.seo?.description ||
      user.bio ||
      config.portfolio?.description ||
      'Personal portfolio'
    const author = config.seo?.author || user.name || user.username
    return {
      title,
      description,
      authors: author ? [{ name: author }] : undefined,
      openGraph: {
        title,
        description,
        type: 'website',
        images: user.avatar ? [{ url: user.avatar }] : undefined,
      },
      twitter: {
        card: 'summary',
        title,
        description,
      },
    }
  } catch {
    return {
      title: 'Portfolio',
      description: 'Personal portfolio powered by aboutME',
    }
  }
}

export const metadata: Metadata = readSiteMeta()

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" data-theme="dark" data-design="minimal" suppressHydrationWarning>
      <body className={inter.className}>
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
