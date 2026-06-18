import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Open Notebook',
  description: 'Your collaborative note-taking space',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-cyber-black min-h-screen cyber-scanlines">{children}</body>
    </html>
  )
}
