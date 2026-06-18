'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function GroupNoteCreate({ groupCode }: { groupCode: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const createNote = async () => {
    setLoading(true)
    const res = await fetch(`/api/groups/${groupCode}/notes`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    setLoading(false)
    if (res.ok) {
      const { note } = await res.json()
      router.push(`/group/${groupCode}?note=${note.id}`)
      router.refresh()
    }
  }

  return (
    <button
      onClick={createNote}
      disabled={loading}
      className="text-xs font-mono text-cyber-cyan/60 hover:text-cyber-cyan transition-colors disabled:opacity-40"
    >
      {loading ? '...' : '+ New'}
    </button>
  )
}
