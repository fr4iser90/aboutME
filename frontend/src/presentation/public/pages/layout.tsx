'use client'; // Added 'use client'

import { Inter } from 'next/font/google'
import '@/domain/shared/styles/globals.css'; // Corrected path

const inter = Inter({ subsets: ['latin'] })

// Metadata removed from here, should be in src/app/layout.tsx

export default function RootLayoutContent({ // Renamed function
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
