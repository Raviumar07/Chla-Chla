import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Chla Chla - Enhanced Carpooling Platform',
  description: 'The best carpooling platform with advanced security, real-time tracking, SOS emergency features, and OTP authentication. Travel smart, travel safe.',
  keywords: 'carpooling, ride sharing, travel, cost sharing, intercity travel, enhanced security, real-time tracking, SOS emergency',
  authors: [{ name: 'Chla Chla Team' }],
  openGraph: {
    title: 'Chla Chla - Enhanced Carpooling Platform',
    description: 'Travel smart, travel safe with advanced security features',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chla Chla - Enhanced Carpooling Platform',
    description: 'Travel smart, travel safe with advanced security features',
  },
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#0ea5e9" />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
          {children}
        </div>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
            },
          }}
        />
      </body>
    </html>
  )
}
