'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const router = useRouter()
  return (
    <nav className="bg-white border-b border-amber-100 px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      <Link href="/" className="flex items-center gap-2 group">
        <span className="text-2xl group-hover:animate-bounce inline-block">🐱</span>
        <span className="font-display font-bold text-gray-700 text-sm leading-tight">
          스터디<br/>윗먀
        </span>
      </Link>
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/create-session')}
          className="btn-primary text-sm py-2 px-4"
        >
          Create session
        </button>
        <button
          onClick={() => router.push('/mates')}
          className="btn-primary text-sm py-2 px-4"
        >
          Mates
        </button>
        <button className="btn-secondary text-sm py-2 px-4">
          Settings
        </button>
        <div className="w-10 h-10 rounded-full border-2 border-blue-300 flex items-center justify-center text-xl bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors">
          🐧
        </div>
      </div>
    </nav>
  )
}
