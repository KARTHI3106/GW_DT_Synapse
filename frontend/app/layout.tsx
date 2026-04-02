import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'GigShield — Income Shield for Gig Workers',
  description: 'India\'s first weekly parametric income shield for Swiggy & Zomato delivery partners. Zero paperwork, auto payouts in 2 hours when disruptions strike.',
  keywords: ['gig worker insurance', 'delivery partner income shield', 'parametric insurance India', 'swiggy zomato insurance'],
  openGraph: {
    title: 'GigShield — Protect Your Earnings',
    description: 'Get paid automatically when rain, heat, or bandh destroys your earning day.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans bg-surface text-text-primary antialiased`}>
        {children}
      </body>
    </html>
  )
}
