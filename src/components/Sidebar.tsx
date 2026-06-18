'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { NoteType, GroupType } from '@/lib/types'

interface SidebarProps {
  notes: NoteType[]
  groups: GroupType[]
  username: string
}

function relativeTime(dateStr: string): string {
  const now = Date.now()
  const date = new Date(dateStr).getTime()
  const diff = now - date
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

function getPreview(content: string): string {
  if (!content || content === '{}') return ''
  try {
    const json = JSON.parse(content)
    let text = ''
    if (json.content && Array.isArray(json.content)) {
      for (const node of json.content) {
        if (node.content && Array.isArray(node.content)) {
          for (const inner of node.content) {
            if (inner.text) text += inner.text + ' '
          }
        }
      }
    }
    return text.trim().slice(0, 100) || ''
  } catch {
    return content.replace(/<[^>]*>/g, '').trim().slice(0, 100)
  }
}

export default function Sidebar({ notes, groups, username }: SidebarProps) {
  const [showNewGroup, setShowNewGroup] = useState(false)
  const [showJoinGroup, setShowJoinGroup] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const router = useRouter()
  const pathname = usePathname()

  const filteredNotes = useMemo(() => {
    if (!search.trim()) return notes
    const q = search.toLowerCase()
    return notes.filter((n) => {
      const title = (n.title || '').toLowerCase()
      const preview = getPreview(n.content || '').toLowerCase()
      return title.includes(q) || preview.includes(q)
    })
  }, [notes, search])

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

  const leaveGroup = async (groupCode: string) => {
    if (!confirm('Leave this group?')) return
    setLoading(true)
    const res = await fetch(`/api/groups/${groupCode}/leave`, { method: 'POST' })
    setLoading(false)
    if (res.ok) {
      router.refresh()
      if (pathname === `/group/${groupCode}`) {
        router.push('/dashboard')
      }
    }
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  return (
    <aside className="w-64 flex-shrink-0 bg-cyber-darker border-r border-cyber-cyan/10 text-white flex flex-col h-screen overflow-hidden relative">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyber-cyan/30 to-transparent" />

      {/* Header */}
      <div className="px-4 py-5 border-b border-cyber-cyan/10">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">📓</span>
          <h1 className="text-lg font-bold cyber-gradient-text font-display">Open Notebook</h1>
        </div>
        <p className="text-xs text-white/20 font-mono">@{username}</p>
      </div>

      {/* Actions */}
      <div className="px-3 py-3 space-y-1 border-b border-cyber-cyan/10">
        <button
          onClick={createNote}
          className="w-full flex items-center gap-2 px-3 py-2 cyber-btn-primary text-sm rounded"
        >
          <span className="text-lg leading-none">+</span> New Note
        </button>
        <div className="flex gap-1">
          <button
            onClick={() => { setShowNewGroup(true); setShowJoinGroup(false); setError('') }}
            className="flex-1 px-2 py-1.5 cyber-btn-secondary text-xs rounded"
          >
            + New Group
          </button>
          <button
            onClick={() => { setShowJoinGroup(true); setShowNewGroup(false); setError('') }}
            className="flex-1 px-2 py-1.5 cyber-btn-secondary text-xs rounded"
          >
            Join Group
          </button>
        </div>

        {error && <p className="text-cyber-pink text-xs px-1">{error}</p>}

        {showNewGroup && (
          <div className="space-y-1">
            <input
              autoFocus
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createGroup()}
              placeholder="Group name..."
              className="w-full px-2 py-1.5 cyber-input text-sm rounded"
            />
            <div className="flex gap-1">
              <button onClick={createGroup} disabled={loading} className="flex-1 py-1 cyber-btn-primary text-xs rounded disabled:opacity-50">
                {loading ? '...' : 'Create'}
              </button>
              <button onClick={() => setShowNewGroup(false)} className="flex-1 py-1 cyber-btn-secondary text-xs rounded">
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
              className="w-full px-2 py-1.5 cyber-input text-sm rounded uppercase"
            />
            <div className="flex gap-1">
              <button onClick={joinGroup} disabled={loading} className="flex-1 py-1 cyber-btn-primary text-xs rounded disabled:opacity-50">
                {loading ? '...' : 'Join'}
              </button>
              <button onClick={() => setShowJoinGroup(false)} className="flex-1 py-1 cyber-btn-secondary text-xs rounded">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 cyber-scrollbar">
        {/* My Notes */}
        <section>
          <div className="flex items-center justify-between mb-1 px-1">
            <p className="text-xs font-semibold text-white/20 uppercase tracking-wider font-display">My Notes</p>
            <span className="text-[10px] font-mono text-white/15">{filteredNotes.length}</span>
          </div>

          {/* Search */}
          <div className="relative mb-1">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes..."
              className="w-full px-2 py-1 cyber-input text-xs rounded"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-1 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 text-[10px] px-1"
              >
                x
              </button>
            )}
          </div>

          {filteredNotes.length === 0 && (
            <p className="text-xs text-white/15 px-2 italic">{search ? 'No matching notes' : 'No notes yet'}</p>
          )}
          {filteredNotes.map((note) => {
            const preview = getPreview(note.content || '')
            return (
              <Link
                key={note.id}
                href={`/note/${note.id}`}
                className={`block px-2 py-1.5 transition-all ${
                  pathname === `/note/${note.id}`
                    ? 'bg-cyber-cyan/10 text-cyber-cyan border-l-2 border-cyber-cyan'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/[0.02] border-l-2 border-transparent'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm truncate">{note.title || 'Untitled Note'}</span>
                  <span className="text-[10px] font-mono text-white/20 shrink-0">{relativeTime(note.updatedAt)}</span>
                </div>
                {preview && (
                  <p className="text-[11px] text-white/20 truncate mt-0.5">{preview}</p>
                )}
              </Link>
            )
          })}
        </section>

        {/* Groups */}
        <section>
          <p className="text-xs font-semibold text-white/20 uppercase tracking-wider mb-1 px-1 font-display">Groups</p>
          {groups.length === 0 && (
            <p className="text-xs text-white/15 px-2 italic">No groups yet</p>
          )}
          {groups.map((group) => (
            <div key={group.id} className="group flex items-center">
              <Link
                href={`/group/${group.code}`}
                className={`flex-1 block px-2 py-1.5 transition-all ${
                  pathname === `/group/${group.code}`
                    ? 'bg-cyber-cyan/10 text-cyber-cyan border-l-2 border-cyber-cyan'
                    : 'text-white/40 hover:text-white/70 hover:bg-white/[0.02] border-l-2 border-transparent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm truncate">{group.name}</span>
                </div>
                <span className="text-xs text-white/15 font-mono">{group.code}</span>
              </Link>
              <button
                onClick={() => leaveGroup(group.code)}
                className="shrink-0 px-1.5 py-1 text-[10px] font-mono text-white/10 hover:text-cyber-pink opacity-0 group-hover:opacity-100 transition-all"
                title="Leave group"
              >
                x
              </button>
            </div>
          ))}
        </section>
      </div>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-cyber-cyan/10">
        <button
          onClick={logout}
          className="w-full px-3 py-2 cyber-btn-secondary text-sm text-left rounded"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
