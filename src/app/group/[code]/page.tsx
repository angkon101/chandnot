import { redirect, notFound } from 'next/navigation'
import { getAuthUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import NoteEditor from '@/components/Editor'
import GroupNoteCreate from '@/components/GroupNoteCreate'
import Link from 'next/link'

export default async function GroupPage({
  params,
  searchParams,
}: {
  params: { code: string }
  searchParams: { note?: string }
}) {
  const auth = getAuthUser()
  if (!auth) redirect('/login')

  const admin = createAdminClient()
  const [{ data: group }, { data: myNotes }, { data: memberships }] = await Promise.all([
    admin
      .from('Group')
      .select('*, members:GroupMember!GroupMember_groupId_fkey(*, user:User!GroupMember_userId_fkey(id, username))')
      .eq('code', params.code)
      .maybeSingle(),
    admin
      .from('Note')
      .select('id, title, updatedAt, createdAt, userId, groupId, content')
      .eq('userId', auth.userId)
      .is('groupId', null)
      .order('updatedAt', { ascending: false }),
    admin
      .from('GroupMember')
      .select('group:Group!GroupMember_groupId_fkey(id, code, name, createdAt)')
      .eq('userId', auth.userId),
  ])

  if (!group) notFound()

  const isMember = group.members?.some((m: any) => m.userId === auth.userId)
  if (!isMember) redirect('/dashboard')

  const { data: groupNotes } = await admin
    .from('Note')
    .select('*, user:User!Note_userId_fkey(username)')
    .eq('groupId', group.id)
    .order('updatedAt', { ascending: false })

  const groups = (memberships ?? []).map((m: any) => m.group).filter(Boolean)
  const activeNote = searchParams.note ? (groupNotes ?? []).find((n: any) => n.id === searchParams.note) : null

  return (
    <div className="flex h-screen">
      <Sidebar notes={myNotes ?? []} groups={groups} username={auth.username} />

      {/* Group panel */}
      <aside className="w-60 flex-shrink-0 border-r border-cyber-cyan/10 bg-cyber-dark/40 flex flex-col">
        <div className="px-4 py-4 border-b border-cyber-cyan/10">
          <h2 className="font-bold text-white/80 truncate font-display">{group.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-mono cyber-badge px-2 py-0.5 font-medium">
              {group.code}
            </span>
            <span className="text-xs text-white/30 font-mono">
              [{group.members?.length ?? 0}]
            </span>
          </div>
        </div>

        {/* Members */}
        <div className="px-4 py-3 border-b border-cyber-cyan/10">
          <p className="text-xs font-semibold text-white/20 uppercase tracking-wider mb-2 font-display">Members</p>
          {(group.members ?? []).map((m: any) => (
            <div key={m.userId} className="flex items-center gap-1.5 py-0.5">
              <div className="w-5 h-5 bg-cyber-dark border border-cyber-cyan/30 flex items-center justify-center text-[10px] font-mono text-cyber-cyan">
                {m.user?.username?.[0]?.toUpperCase()}
              </div>
              <span className="text-sm text-white/50 truncate font-mono text-xs">{m.user?.username}</span>
              {m.role === 'admin' && <span className="text-[10px] text-cyber-pink ml-auto font-mono">admin</span>}
            </div>
          ))}
        </div>

        {/* Notes */}
        <div className="flex-1 overflow-y-auto px-4 py-3 cyber-scrollbar">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-white/20 uppercase tracking-wider font-display">Notes</p>
            <GroupNoteCreate groupCode={params.code} />
          </div>
          {(groupNotes ?? []).length === 0 && (
            <p className="text-xs text-white/20 italic font-mono">No notes yet. Create one!</p>
          )}
          {(groupNotes ?? []).map((note: any) => (
            <Link
              key={note.id}
              href={`/group/${params.code}?note=${note.id}`}
              className={`block px-2 py-1.5 text-sm truncate transition-all mb-0.5 ${
                activeNote?.id === note.id
                  ? 'bg-cyber-cyan/10 text-cyber-cyan border-l-2 border-cyber-cyan'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/[0.02] border-l-2 border-transparent'
              }`}
            >
              <div className="truncate">{note.title || 'Untitled'}</div>
              <div className="text-xs text-white/20 font-mono">by {note.user?.username}</div>
            </Link>
          ))}
        </div>
      </aside>

      {/* Editor or welcome */}
      <main className="flex-1 overflow-hidden bg-cyber-black">
        {activeNote ? (
          <NoteEditor
            noteId={activeNote.id}
            initialTitle={activeNote.title}
            initialContent={activeNote.content}
            groupCode={params.code}
            username={auth.username}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-4xl mb-3">👥</div>
              <h3 className="text-xl font-bold font-display cyber-gradient-text mb-1">{group.name}</h3>
              <p className="text-white/30 text-sm mb-4 font-mono">Select a note or create a new one</p>
              <p className="text-xs text-white/20 font-mono">
                SHARE CODE{' '}
                <span className="font-mono font-bold cyber-neon-text">{group.code}</span>{' '}
                TO COLLABORATE
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
