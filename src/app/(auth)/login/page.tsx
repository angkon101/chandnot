'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    setLoading(false)
    if (res.ok) {
      router.push('/dashboard')
    } else {
      const data = await res.json()
      setError(data.error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cyber-black cyber-grid relative overflow-hidden">
      {/* Animated grid lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-40 h-px bg-gradient-to-r from-transparent via-cyber-cyan/20 to-transparent animate-scanline" style={{ animationDuration: '6s' }} />
        <div className="absolute top-2/4 -right-20 w-40 h-px bg-gradient-to-l from-transparent via-cyber-pink/20 to-transparent animate-scanline" style={{ animationDuration: '8s' }} />
      </div>

      <div className="w-full max-w-sm relative">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3 inline-block">📓</div>
          <h1 className="text-3xl font-bold font-display cyber-gradient-text">Open Notebook</h1>
          <p className="text-white/30 mt-1 font-mono text-sm">SIGN IN // TERMINAL</p>
        </div>

        <div className="cyber-card p-8 relative">
          <div className="absolute top-2 right-3 text-[10px] font-mono text-cyber-cyan/30">AUTH::LOGIN</div>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div>
              <label className="block text-xs font-mono text-white/40 mb-1">USERNAME</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your_username"
                required
                autoFocus
                className="w-full px-4 py-2.5 cyber-input text-sm rounded"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-white/40 mb-1">PASSWORD</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2.5 cyber-input text-sm rounded"
              />
            </div>

            {error && (
              <p className="text-cyber-pink text-sm bg-cyber-pink/[0.04] px-3 py-2 border border-cyber-pink/10 font-mono text-xs">{'>'} {error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 cyber-btn-primary rounded text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <span>{loading ? 'AUTHENTICATING...' : 'SIGN IN'}</span>
            </button>
          </form>

          <p className="text-center text-sm text-white/30 mt-6 font-mono text-xs">
            NO ACCOUNT?{' '}
            <Link href="/register" className="cyber-gradient-text hover:opacity-80 transition-opacity font-medium">
              CREATE ONE
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
