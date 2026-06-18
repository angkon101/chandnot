'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function GroupNoteCreate({ groupCode }: { groupCode: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const createNote = async () => {
    setLoading(true)
    const res = await fetch(`/api/groups/${groupCode}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      className="text-xs text-violet-600 hover:text-violet-800 font-medium disabled:opacity-50"
    >
      {loading ? '...' : '+ New'}
    </button>
  )
}
