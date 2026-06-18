'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { NoteType, GroupType } from '@/lib/types'

interface SidebarProps {
  notes: NoteType[]
  groups: GroupType[]
  username: string
}

export default function Sidebar({ notes, groups, username }: SidebarProps) {
  const [showNewGroup, setShowNewGroup] = useState(false)
  const [showJoinGroup, setShowJoinGroup] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const pathname = usePathname()

  const createNote = async () => {
    const res = await fetch('/api/notes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
    if (res.ok) {
      const { note } = await res.json()
      router.push(`/note/${note.id}`)
      router.refresh()
    }
  }

  const createGroup = async () => {
    if (!groupName.trim()) return
    setLoading(true)
    setError('')
    const res = await fetch('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: groupName }),
    })
    setLoading(false)
    if (res.ok) {
      const { group } = await res.json()
      setShowNewGroup(false)
      setGroupName('')
      router.push(`/group/${group.code}`)
      router.refresh()
    } else {
      const d = await res.json()
      setError(d.error)
    }
  }

  const joinGroup = async () => {
    if (!joinCode.trim()) return
    setLoading(true)
    setError('')
    const res = await fetch('/api/groups/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: joinCode }),
    })
    setLoading(false)
    if (res.ok) {
      const { group } = await res.json()
      setShowJoinGroup(false)
      setJoinCode('')
      router.push(`/group/${group.code}`)
      router.refresh()
    } else {
      const d = await res.json()
      setError(d.error)
    }
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <aside className="w-64 flex-shrink-0 bg-gray-900 text-white flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="px-4 py-5 border-b border-gray-700">
        <h1 className="text-lg font-bold text-violet-400">📓 Open Notebook</h1>
        <p className="text-xs text-gray-400 mt-0.5">@{username}</p>
      </div>

      {/* Actions */}
      <div className="px-3 py-3 space-y-1 border-b border-gray-700">
        <button
          onClick={createNote}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors"
        >
          <span>+</span> New Note
        </button>
        <div className="flex gap-1">
          <button
            onClick={() => { setShowNewGroup(true); setShowJoinGroup(false); setError('') }}
            className="flex-1 px-2 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 text-xs transition-colors"
          >
            + New Group
          </button>
          <button
            onClick={() => { setShowJoinGroup(true); setShowNewGroup(false); setError('') }}
            className="flex-1 px-2 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 text-xs transition-colors"
          >
            Join Group
          </button>
        </div>

        {error && <p className="text-red-400 text-xs px-1">{error}</p>}

        {showNewGroup && (
          <div className="space-y-1">
            <input
              autoFocus
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createGroup()}
              placeholder="Group name..."
              className="w-full px-2 py-1.5 rounded bg-gray-800 text-white text-sm outline-none border border-gray-600 focus:border-violet-500"
            />
            <div className="flex gap-1">
              <button onClick={createGroup} disabled={loading} className="flex-1 py-1 rounded bg-violet-600 hover:bg-violet-700 text-xs disabled:opacity-50">
                {loading ? '...' : 'Create'}
              </button>
              <button onClick={() => setShowNewGroup(false)} className="flex-1 py-1 rounded bg-gray-700 hover:bg-gray-600 text-xs">
                Cancel
              </button>
            </div>
          </div>
        )}

        {showJoinGroup && (
          <div className="space-y-1">
            <input
              autoFocus
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && joinGroup()}
              placeholder="Group code..."
              className="w-full px-2 py-1.5 rounded bg-gray-800 text-white text-sm outline-none border border-gray-600 focus:border-violet-500 uppercase"
            />
            <div className="flex gap-1">
              <button onClick={joinGroup} disabled={loading} className="flex-1 py-1 rounded bg-violet-600 hover:bg-violet-700 text-xs disabled:opacity-50">
                {loading ? '...' : 'Join'}
              </button>
              <button onClick={() => setShowJoinGroup(false)} className="flex-1 py-1 rounded bg-gray-700 hover:bg-gray-600 text-xs">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {/* My Notes */}
        <section>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 px-1">My Notes</p>
          {notes.length === 0 && (
            <p className="text-xs text-gray-500 px-2 italic">No notes yet</p>
          )}
          {notes.map((note) => (
            <Link
              key={note.id}
              href={`/note/${note.id}`}
              className={`block px-2 py-1.5 rounded-lg text-sm truncate transition-colors ${
                pathname === `/note/${note.id}`
                  ? 'bg-violet-700 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              {note.title || 'Untitled Note'}
            </Link>
          ))}
        </section>

        {/* Groups */}
        <section>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 px-1">Groups</p>
          {groups.length === 0 && (
            <p className="text-xs text-gray-500 px-2 italic">No groups yet</p>
          )}
          {groups.map((group) => (
            <Link
              key={group.id}
              href={`/group/${group.code}`}
              className={`block px-2 py-1.5 rounded-lg transition-colors ${
                pathname === `/group/${group.code}`
                  ? 'bg-violet-700 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm truncate">{group.name}</span>
              </div>
              <span className="text-xs text-gray-500 font-mono">{group.code}</span>
            </Link>
          ))}
        </section>
      </div>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-gray-700">
        <button
          onClick={logout}
          className="w-full px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm transition-colors text-left"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
