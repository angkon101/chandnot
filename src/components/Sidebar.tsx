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
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d`
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
  const [open, setOpen] = useState(false)
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
      setOpen(false)
      router.push(`/note/${note.id}`)
      router.refresh()
    }
  }

  const createGroup = async () => {
    if (!groupName.trim()) return
    setLoading(true); setError('')
    const res = await fetch('/api/groups', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: groupName }),
    })
    setLoading(false)
    if (res.ok) {
      const { group } = await res.json()
      setShowNewGroup(false); setGroupName(''); setOpen(false)
      router.push(`/group/${group.code}`); router.refresh()
    } else {
      const d = await res.json(); setError(d.error)
    }
  }

  const joinGroup = async () => {
    if (!joinCode.trim()) return
    setLoading(true); setError('')
    const res = await fetch('/api/groups/join', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: joinCode }),
    })
    setLoading(false)
    if (res.ok) {
      const { group } = await res.json()
      setShowJoinGroup(false); setJoinCode(''); setOpen(false)
      router.push(`/group/${group.code}`); router.refresh()
    } else {
      const d = await res.json(); setError(d.error)
    }
  }

  const leaveGroup = async (groupCode: string) => {
    if (!confirm('Leave this group?')) return
    setLoading(true)
    const res = await fetch(`/api/groups/${groupCode}/leave`, { method: 'POST' })
    setLoading(false)
    if (res.ok) {
      router.refresh()
      if (pathname === `/group/${groupCode}`) router.push('/dashboard')
    }
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="text-lg">📓</span>
            <h1 className="text-base font-bold tracking-tight cyber-gradient-text">Open Notebook</h1>
          </div>
          <p className="text-xs text-white/20 font-mono">@{username}</p>
        </div>
        <button onClick={() => setOpen(false)} className="md:hidden text-white/20 hover:text-white/60 transition-colors px-1 py-1">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Actions */}
      <div className="px-4 py-4 space-y-2 border-b border-white/5">
        <button onClick={createNote} className="w-full flex items-center justify-center gap-2 px-3 py-2 cyber-btn-primary text-sm rounded-lg">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          New Note
        </button>
        <div className="flex gap-1.5">
          <button onClick={() => { setShowNewGroup(true); setShowJoinGroup(false); setError('') }} className="flex-1 px-2.5 py-2 cyber-btn-secondary text-xs rounded-lg">
            + New Group
          </button>
          <button onClick={() => { setShowJoinGroup(true); setShowNewGroup(false); setError('') }} className="flex-1 px-2.5 py-2 cyber-btn-secondary text-xs rounded-lg">
            Join Group
          </button>
        </div>

        {error && <p className="text-red-400/80 text-xs px-1">{error}</p>}

        {(showNewGroup || showJoinGroup) && (
          <div className="space-y-1.5 animate-[slide-up_0.2s_ease-out]">
            <input
              autoFocus
              value={showNewGroup ? groupName : joinCode}
              onChange={(e) => showNewGroup ? setGroupName(e.target.value) : setJoinCode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && (showNewGroup ? createGroup() : joinGroup())}
              placeholder={showNewGroup ? 'Group name...' : 'Group code...'}
              className={`w-full px-3 py-2 cyber-input text-sm rounded-lg ${showJoinGroup ? 'uppercase' : ''}`}
            />
            <div className="flex gap-1.5">
              <button onClick={showNewGroup ? createGroup : joinGroup} disabled={loading} className="flex-1 py-2 cyber-btn-primary text-xs rounded-lg disabled:opacity-50">
                {loading ? '...' : showNewGroup ? 'Create' : 'Join'}
              </button>
              <button onClick={() => { setShowNewGroup(false); setShowJoinGroup(false) }} className="flex-1 py-2 cyber-btn-secondary text-xs rounded-lg">
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto cyber-scrollbar">
        {/* My Notes */}
        <section className="px-4 pt-4 pb-2">
          <div className="flex items-center justify-between mb-2 px-1">
            <h2 className="text-[11px] font-semibold text-white/20 uppercase tracking-widest">Notes</h2>
            <span className="text-[10px] font-mono text-white/15">{filteredNotes.length}</span>
          </div>

          <div className="relative mb-2">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/15 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes..."
              className="w-full pl-7 pr-6 py-1.5 cyber-input text-xs rounded-lg"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/15 hover:text-white/50 transition-colors">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>

          {filteredNotes.length === 0 && (
            <p className="text-xs text-white/15 px-2 py-4 text-center italic">{search ? 'No matching notes' : 'No notes yet'}</p>
          )}
          <div className="space-y-0.5">
            {filteredNotes.map((note) => {
              const preview = getPreview(note.content || '')
              const isActive = pathname === `/note/${note.id}`
              return (
                <Link
                  key={note.id}
                  href={`/note/${note.id}`}
                  onClick={() => setOpen(false)}
                  className={`group block px-3 py-2.5 rounded-lg transition-all ${
                    isActive
                      ? 'bg-cyan-900/20 text-cyber-cyan border border-cyan-900/30'
                      : 'text-white/40 hover:text-white/70 hover:bg-white/[0.02] border border-transparent'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className={`text-sm leading-snug truncate ${isActive ? 'font-medium' : ''}`}>
                      {note.title || 'Untitled Note'}
                    </span>
                    <span className="text-[10px] font-mono text-white/15 shrink-0 mt-0.5">{relativeTime(note.updatedAt)}</span>
                  </div>
                  {preview && (
                    <p className="text-[11px] text-white/15 truncate mt-0.5 group-hover:text-white/20 transition-colors">{preview}</p>
                  )}
                </Link>
              )
            })}
          </div>
        </section>

        {/* Groups */}
        <section className="px-4 pb-4 pt-2">
          <h2 className="text-[11px] font-semibold text-white/20 uppercase tracking-widest mb-2 px-1">Groups</h2>
          {groups.length === 0 && (
            <p className="text-xs text-white/15 px-2 py-4 text-center italic">No groups yet</p>
          )}
          <div className="space-y-0.5">
            {groups.map((group) => {
              const isActive = pathname === `/group/${group.code}`
              return (
                <div key={group.id} className="group/item flex items-center">
                  <Link
                    href={`/group/${group.code}`}
                    onClick={() => setOpen(false)}
                    className={`flex-1 block px-3 py-2.5 rounded-lg transition-all ${
                      isActive
                        ? 'bg-cyan-900/20 text-cyber-cyan border border-cyan-900/30'
                        : 'text-white/40 hover:text-white/70 hover:bg-white/[0.02] border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm truncate">{group.name}</span>
                    </div>
                    <span className="text-[11px] text-white/15 font-mono">{group.code}</span>
                  </Link>
                  <button
                    onClick={() => leaveGroup(group.code)}
                    className="ml-1 px-1.5 py-1 text-[10px] font-mono text-white/10 hover:text-red-400 opacity-0 group-hover/item:opacity-100 transition-all"
                    title="Leave group"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                  </button>
                </div>
              )
            })}
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/5">
        <button onClick={logout} className="w-full px-3 py-2 cyber-btn-secondary text-sm rounded-lg text-left">
          Sign out
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-3 left-3 z-40 w-9 h-9 flex items-center justify-center bg-cyber-dark border border-cyber-cyan/15 rounded-lg text-cyber-cyan shadow-lg shadow-black/30 hover:bg-cyber-gray transition-colors"
        aria-label="Open menu"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="4" y1="6" x2="20" y2="6" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="18" x2="20" y2="18" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm animate-[fade-in_0.15s_ease]" onClick={() => setOpen(false)} />
      )}

      <aside
        className={`flex-shrink-0 bg-cyber-darker border-r border-white/5 text-white h-screen overflow-hidden relative
          md:flex md:w-64 md:relative
          ${open ? 'fixed inset-y-0 left-0 z-50 w-72 flex' : 'hidden'}
          transition-transform duration-300 ease-out-expo`}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
