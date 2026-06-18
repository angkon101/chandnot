'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import GroupNoteCreate from '@/components/GroupNoteCreate'

interface GroupPanelProps {
  group: any
  groupNotes: any[]
  activeNoteId: string | null
  groupCode: string
}

export default function GroupPanel({ group, groupNotes, activeNoteId, groupCode }: GroupPanelProps) {
  const [panelOpen, setPanelOpen] = useState(false)
  const pathname = usePathname()

  const panelContent = (
    <div className="flex flex-col h-full">
      <div className="px-4 py-4 border-b border-white/5">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-white/80 truncate text-sm font-display">{group.name}</h2>
          <button onClick={() => setPanelOpen(false)} className="md:hidden text-white/20 hover:text-white/50 transition-colors px-1" aria-label="Close panel">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4l8 8M12 4l-8 8"/></svg>
          </button>
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[10px] font-semibold font-mono tracking-widest text-white/30 bg-white/[0.03] px-2 py-0.5 rounded border border-white/5">
            {group.code}
          </span>
          <span className="text-[11px] text-white/20 font-mono">
            [{group.members?.length ?? 0}]
          </span>
        </div>
      </div>

      <div className="px-4 py-3 border-b border-white/5">
        <p className="text-[11px] font-semibold text-white/20 uppercase tracking-widest mb-2 font-display">Members</p>
        {(group.members ?? []).map((m: any) => (
          <div key={m.userId} className="flex items-center gap-2 py-0.5">
            <div className="w-5 h-5 rounded-full bg-white/[0.04] border border-white/5 flex items-center justify-center text-[9px] font-mono text-white/30 shrink-0">
              {m.user?.username?.[0]?.toUpperCase()}
            </div>
            <span className="text-xs text-white/40 truncate font-mono">{m.user?.username}</span>
            {m.role === 'admin' && (
              <span className="text-[10px] font-mono text-cyber-pink/60 ml-auto shrink-0">admin</span>
            )}
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 cyber-scrollbar">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-semibold text-white/20 uppercase tracking-widest font-display">Notes</p>
          <GroupNoteCreate groupCode={groupCode} />
        </div>
        {(groupNotes ?? []).length === 0 && (
          <p className="text-xs text-white/15 italic font-mono">No notes yet. Create one!</p>
        )}
        {(groupNotes ?? []).map((note: any) => (
          <Link
            key={note.id}
            href={`/group/${groupCode}?note=${note.id}`}
            onClick={() => setPanelOpen(false)}
            className={`block rounded-lg px-3 py-2 text-sm transition-all mb-0.5 ${
              activeNoteId === note.id
                ? 'bg-cyan-400/10 text-cyber-cyan border border-cyan-900/30'
                : 'text-white/35 hover:text-white/60 hover:bg-white/[0.02] border border-transparent'
            }`}
          >
            <div className="text-xs truncate">{note.title || 'Untitled'}</div>
            <div className="text-[10px] text-white/20 font-mono mt-0.5">by {note.user?.username}</div>
          </Link>
        ))}
      </div>
    </div>
  )

  return (
    <>
      <button
        onClick={() => setPanelOpen(true)}
        className="md:hidden fixed bottom-4 right-4 z-30 w-11 h-11 flex items-center justify-center bg-white/5 border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20 rounded-xl backdrop-blur-sm text-xs font-mono transition-all"
        aria-label="Group panel"
      >
        G
      </button>

      {panelOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setPanelOpen(false)}
        />
      )}

      <aside
        className={`
          flex-shrink-0 border-r border-white/5 bg-black/20 h-screen overflow-hidden relative
          md:flex md:w-60 md:relative
          ${panelOpen ? 'fixed inset-y-0 right-0 z-50 w-64 sm:w-72 flex' : 'hidden'}
          transition-transform duration-300 ease-in-out
        `}
      >
        {panelContent}
      </aside>
    </>
  )
}
