import type { Metadata } from 'next'
import { Inter, Noto_Serif_SC } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-geist' })
const notoSerifSC = Noto_Serif_SC({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-serif-sc',
})

export const metadata: Metadata = {
  title: 'Gallery | Photography Portfolio',
  description: 'Professional photography portfolio',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.variable} ${notoSerifSC.variable} font-sans`}>
        {children}
      </body>
    </html>
  )
}
