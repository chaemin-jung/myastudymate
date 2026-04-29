import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '스터디윗먀 | StudyWithMya',
  description: 'AI study companion with personality',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
