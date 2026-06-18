import type { Metadata } from 'next'
import './globals.css'
import ThemeProvider from '@/components/ThemeProvider'

export const metadata: Metadata = {
  title: 'Open Notebook',
  description: 'Your collaborative note-taking space',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen cyber-scanlines transition-colors duration-200">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
