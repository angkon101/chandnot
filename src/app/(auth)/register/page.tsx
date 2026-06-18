'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password !== confirm) return setError('Passwords do not match')
    setLoading(true)
    const res = await fetch('/api/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    })
    setLoading(false)
    if (res.ok) { router.push('/dashboard') }
    else { const d = await res.json(); setError(d.error) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cyber-black cyber-grid relative overflow-hidden px-4 py-8">
      <div className="w-full max-w-sm relative animate-[slide-up_0.4s_ease-out]">
        <div className="text-center mb-8">
          <div className="text-3xl sm:text-4xl mb-4">📓</div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight cyber-gradient-text">Open Notebook</h1>
          <p className="text-white/25 mt-1.5 font-mono text-xs sm:text-sm">Create your account</p>
        </div>

        <div className="cyber-card rounded-xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-mono text-white/30 mb-1.5 tracking-wide">USERNAME</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="your_username" required autoFocus
                className="w-full px-4 py-2.5 cyber-input text-sm rounded-lg" />
              <p className="text-xs font-mono text-white/15 mt-1.5">Letters, numbers, underscores. Min 3 characters.</p>
            </div>
            <div>
              <label className="block text-xs font-mono text-white/30 mb-1.5 tracking-wide">PASSWORD</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" required
                className="w-full px-4 py-2.5 cyber-input text-sm rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-mono text-white/30 mb-1.5 tracking-wide">CONFIRM PASSWORD</label>
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm your password" required
                className="w-full px-4 py-2.5 cyber-input text-sm rounded-lg" />
            </div>

            {error && (
              <p className="text-red-400/80 text-sm bg-red-400/5 px-3.5 py-2.5 rounded-lg border border-red-400/10 font-mono text-xs">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-2.5 cyber-btn-primary rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-white/25 mt-6 font-mono text-xs">
            Already have an account?{' '}
            <Link href="/login" className="text-cyan-400/70 hover:text-cyan-400 transition-colors font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
