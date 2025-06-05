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
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
