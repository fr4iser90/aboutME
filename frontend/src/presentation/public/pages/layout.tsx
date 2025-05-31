import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '@/styles/globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'About Me - Galaxy Portfolio',
  description: 'Personal portfolio in a cosmic style',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 min-h-screen text-slate-100`}>
        {children}
      </body>
    </html>
  )
} 