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
      <aside className="w-60 flex-shrink-0 border-r border-gray-200 bg-gray-50 flex flex-col">
        <div className="px-4 py-4 border-b border-gray-200">
          <h2 className="font-bold text-gray-800 truncate">{group.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-mono bg-violet-100 text-violet-700 px-2 py-0.5 rounded font-medium">
              {group.code}
            </span>
            <span className="text-xs text-gray-400">
              {group.members?.length ?? 0} member{(group.members?.length ?? 0) !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Members */}
        <div className="px-4 py-3 border-b border-gray-200">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Members</p>
          {(group.members ?? []).map((m: any) => (
            <div key={m.userId} className="flex items-center gap-1.5 py-0.5">
              <div className="w-5 h-5 rounded-full bg-violet-200 flex items-center justify-center text-xs text-violet-700 font-medium">
                {m.user?.username?.[0]?.toUpperCase()}
              </div>
              <span className="text-sm text-gray-600 truncate">{m.user?.username}</span>
              {m.role === 'admin' && <span className="text-xs text-violet-500 ml-auto">admin</span>}
            </div>
          ))}
        </div>

        {/* Notes */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Notes</p>
            <GroupNoteCreate groupCode={params.code} />
          </div>
          {(groupNotes ?? []).length === 0 && (
            <p className="text-xs text-gray-400 italic">No notes yet. Create one!</p>
          )}
          {(groupNotes ?? []).map((note: any) => (
            <Link
              key={note.id}
              href={`/group/${params.code}?note=${note.id}`}
              className={`block px-2 py-1.5 rounded-lg text-sm truncate transition-colors mb-0.5 ${
                activeNote?.id === note.id
                  ? 'bg-violet-100 text-violet-800 font-medium'
                  : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <div className="truncate">{note.title || 'Untitled'}</div>
              <div className="text-xs text-gray-400 truncate">by {note.user?.username}</div>
            </Link>
          ))}
        </div>
      </aside>

      {/* Editor or welcome */}
      <main className="flex-1 overflow-hidden bg-white">
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
              <div className="text-5xl mb-3">👥</div>
              <h3 className="text-xl font-bold text-gray-700 mb-1">{group.name}</h3>
              <p className="text-gray-400 text-sm mb-4">Select a note or create a new one</p>
              <p className="text-xs text-gray-400">
                Share code{' '}
                <span className="font-mono font-bold text-violet-600">{group.code}</span>{' '}
                with others to collaborate
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
