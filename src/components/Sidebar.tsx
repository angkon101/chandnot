'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useTheme } from './ThemeProvider'
import { NoteType, GroupType } from '@/lib/types'

interface SidebarProps {
  notes: NoteType[]
  groups: GroupType[]
  username: string
}

/* ── Tiny reusable SVG icons ── */
const Icons = {
  pencil: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  folderPlus: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
      <line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/>
    </svg>
  ),
  key: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7.5" cy="15.5" r="5.5"/>
      <path d="M21 2l-9.6 9.6"/><path d="M15.5 7.5l3 3L22 7l-3-3"/>
    </svg>
  ),
  fileText: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      <line x1="10" y1="9" x2="8" y2="9"/>
    </svg>
  ),
  users: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  folder: (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  file: (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
      <polyline points="13 2 13 9 20 9"/>
    </svg>
  ),
  logout: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  user: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  search: (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  x: (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  close: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  menu: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>
    </svg>
  ),
  exitGroup: (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  clock: (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'now'
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
    return text.trim().slice(0, 80) || ''
  } catch {
    return content.replace(/<[^>]*>/g, '').trim().slice(0, 80)
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
  const { theme, toggleTheme } = useTheme()

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
    const res = await fetch('/api/notes', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
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
    <div className="flex flex-col w-full h-full min-h-0">

      {/* ── Header ── */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-4 border-b border-cyber-fg/10">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base flex-shrink-0">📓</span>
            <span className="text-sm font-bold tracking-wide cyber-gradient-text truncate">
              Open Notebook
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-cyber-fg/35 font-mono">
            {Icons.user}
            <span className="truncate">@{username}</span>
          </div>
        </div>
        <button
          onClick={() => setOpen(false)}
          className="md:hidden flex-shrink-0 ml-2 text-cyber-fg/25 hover:text-cyber-fg/70 transition-colors p-1 rounded"
        >
          {Icons.close}
        </button>
      </div>

      {/* ── Action buttons ── */}
      <div className="flex-shrink-0 px-3 py-3 space-y-2 border-b border-cyber-fg/10">

        {/* New Note */}
        <button onClick={createNote} className="w-full flex items-center justify-center gap-2 px-3 py-2.5 cyber-btn-primary rounded-sm">
          <span className="flex-shrink-0">{Icons.pencil}</span>
          <span>New Note</span>
        </button>

        {/* New Group + Join Group */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => { setShowNewGroup(true); setShowJoinGroup(false); setError('') }}
            className="flex items-center justify-center gap-1.5 px-2 py-2 cyber-btn-secondary text-xs rounded-sm"
          >
            <span className="flex-shrink-0">{Icons.folderPlus}</span>
            <span>New Group</span>
          </button>
          <button
            onClick={() => { setShowJoinGroup(true); setShowNewGroup(false); setError('') }}
            className="flex items-center justify-center gap-1.5 px-2 py-2 cyber-btn-secondary text-xs rounded-sm"
          >
            <span className="flex-shrink-0">{Icons.key}</span>
            <span>Join Group</span>
          </button>
        </div>

        {error && (
          <p className="text-red-500/70 text-xs px-1 font-mono">⚠ {error}</p>
        )}

        {/* Inline form: create or join */}
        {(showNewGroup || showJoinGroup) && (
          <div className="space-y-1.5 pt-1 animate-[slide-up_0.2s_ease-out]">
            <input
              autoFocus
              value={showNewGroup ? groupName : joinCode}
              onChange={(e) =>
                showNewGroup
                  ? setGroupName(e.target.value)
                  : setJoinCode(e.target.value.toUpperCase())
              }
              onKeyDown={(e) =>
                e.key === 'Enter' && (showNewGroup ? createGroup() : joinGroup())
              }
              placeholder={showNewGroup ? 'Group name...' : 'Enter code...'}
              className={`w-full px-3 py-2 cyber-input text-xs rounded-sm ${showJoinGroup ? 'uppercase tracking-widest' : ''}`}
            />
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={showNewGroup ? createGroup : joinGroup}
                disabled={loading}
                className="py-2 cyber-btn-primary text-xs rounded-sm disabled:opacity-40"
              >
                <span>{loading ? '...' : showNewGroup ? 'Create' : 'Join'}</span>
              </button>
              <button
                onClick={() => { setShowNewGroup(false); setShowJoinGroup(false) }}
                className="py-2 cyber-btn-secondary text-xs rounded-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 min-h-0 overflow-y-auto cyber-scrollbar">

        {/* Notes section */}
        <section className="px-3 pt-4 pb-2">
          <div className="flex items-center justify-between mb-2.5 px-1">
            <div className="flex items-center gap-1.5 text-cyber-fg/30">
              {Icons.fileText}
              <span className="text-[10px] font-semibold uppercase tracking-widest">Notes</span>
            </div>
            <span className="text-[10px] font-mono text-cyber-fg/20 tabular-nums">
              {filteredNotes.length}
            </span>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-cyber-fg/20 pointer-events-none">
              {Icons.search}
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes..."
              className="w-full pl-7 pr-6 py-1.5 cyber-input text-xs rounded-sm"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-cyber-fg/20 hover:text-cyber-fg/55 transition-colors"
              >
                {Icons.x}
              </button>
            )}
          </div>

          {filteredNotes.length === 0 && (
            <p className="text-xs text-cyber-fg/20 px-2 py-3 text-center italic">
              {search ? 'No matching notes' : 'No notes yet'}
            </p>
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
                  className={`group flex items-start gap-2 px-2.5 py-2 rounded-sm transition-all border ${
                    isActive
                      ? 'bg-cyber-fg/8 border-cyber-fg/25 text-cyber-fg'
                      : 'border-transparent text-cyber-fg/45 hover:text-cyber-fg/75 hover:bg-cyber-fg/[0.03] hover:border-cyber-fg/10'
                  }`}
                >
                  <span className="flex-shrink-0 mt-0.5 text-cyber-fg/20">
                    {Icons.file}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-1 min-w-0">
                      <span className={`text-xs leading-snug truncate ${isActive ? 'font-semibold' : ''}`}>
                        {note.title || 'Untitled Note'}
                      </span>
                      <span className="flex items-center gap-0.5 text-[9px] font-mono text-cyber-fg/18 flex-shrink-0 mt-px">
                        {Icons.clock}
                        {relativeTime(note.updatedAt)}
                      </span>
                    </div>
                    {preview && (
                      <p className="text-[10px] text-cyber-fg/22 truncate mt-0.5">{preview}</p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        {/* Groups section */}
        <section className="px-3 pb-4 pt-2">
          <div className="flex items-center gap-1.5 mb-2.5 px-1 text-cyber-fg/30">
            {Icons.users}
            <span className="text-[10px] font-semibold uppercase tracking-widest">Groups</span>
          </div>

          {groups.length === 0 && (
            <p className="text-xs text-cyber-fg/20 px-2 py-3 text-center italic">
              No groups yet
            </p>
          )}

          <div className="space-y-0.5">
            {groups.map((group) => {
              const isActive = pathname === `/group/${group.code}`
              return (
                <div key={group.id} className="group/item flex items-center gap-1 min-w-0">
                  <Link
                    href={`/group/${group.code}`}
                    onClick={() => setOpen(false)}
                    className={`flex items-start gap-2 flex-1 min-w-0 px-2.5 py-2 rounded-sm transition-all border ${
                      isActive
                        ? 'bg-cyber-fg/8 border-cyber-fg/25 text-cyber-fg'
                        : 'border-transparent text-cyber-fg/45 hover:text-cyber-fg/75 hover:bg-cyber-fg/[0.03] hover:border-cyber-fg/10'
                    }`}
                  >
                    <span className="flex-shrink-0 mt-0.5 text-cyber-fg/20">{Icons.folder}</span>
                    <div className="min-w-0">
                      <span className="block text-xs truncate font-medium">{group.name}</span>
                      <span className="block text-[10px] text-cyber-fg/22 font-mono tracking-widest mt-0.5">
                        {group.code}
                      </span>
                    </div>
                  </Link>
                  <button
                    onClick={() => leaveGroup(group.code)}
                    className="flex-shrink-0 p-1.5 text-cyber-fg/12 hover:text-red-500/70 opacity-0 group-hover/item:opacity-100 transition-all rounded-sm"
                    title="Leave group"
                  >
                    {Icons.exitGroup}
                  </button>
                </div>
              )
            })}
          </div>
        </section>
      </div>

      {/* ── Footer ── */}
      <div className="flex-shrink-0 px-3 py-3 border-t border-cyber-fg/10 space-y-1.5">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-2 px-3 py-2 cyber-btn-secondary rounded-sm text-xs"
        >
          <span className="flex-shrink-0">
            {theme === 'dark' ? (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </span>
          <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
        </button>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 cyber-btn-secondary rounded-sm text-xs"
        >
          <span className="flex-shrink-0">{Icons.logout}</span>
          <span>Sign out</span>
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-3 left-3 z-40 w-9 h-9 flex items-center justify-center bg-cyber-dark border border-cyber-fg/15 rounded-sm text-cyber-fg/70 shadow-cyber-md hover:bg-cyber-fg/[0.06] transition-colors"
        aria-label="Open menu"
      >
        {Icons.menu}
      </button>

      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden backdrop-blur-sm animate-[fade-in_0.15s_ease]"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`
          flex-shrink-0 flex flex-col h-screen w-72
          bg-cyber-darker border-r border-cyber-fg/10
          text-cyber-fg/80
          md:relative md:flex
          ${open ? 'fixed inset-y-0 left-0 z-50 flex' : 'hidden'}
        `}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
