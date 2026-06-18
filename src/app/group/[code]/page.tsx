import { redirect, notFound } from 'next/navigation'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
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

  const [group, notes, memberships, myNotes] = await Promise.all([
    prisma.group.findUnique({
      where: { code: params.code },
      include: { members: { include: { user: { select: { username: true } } } } },
    }),
    prisma.note.findMany({
      where: { group: { code: params.code } },
      include: { user: { select: { username: true } } },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.groupMember.findMany({
      where: { userId: auth.userId },
      include: { group: true },
    }),
    prisma.note.findMany({
      where: { userId: auth.userId, groupId: null },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, title: true, updatedAt: true, createdAt: true, userId: true, groupId: true, content: true },
    }),
  ])

  if (!group) notFound()

  const isMember = group.members.some((m) => m.userId === auth.userId)
  if (!isMember) redirect('/dashboard')

  const groups = memberships.map((m) => ({
    id: m.group.id,
    code: m.group.code,
    name: m.group.name,
    createdAt: m.group.createdAt.toISOString(),
  }))

  const serializedMyNotes = myNotes.map((n) => ({
    ...n,
    createdAt: n.createdAt.toISOString(),
    updatedAt: n.updatedAt.toISOString(),
  }))

  const activeNote = searchParams.note ? notes.find((n) => n.id === searchParams.note) : null

  return (
    <div className="flex h-screen">
      <Sidebar notes={serializedMyNotes} groups={groups} username={auth.username} />

      {/* Group panel */}
      <aside className="w-60 flex-shrink-0 border-r border-gray-200 bg-gray-50 flex flex-col">
        <div className="px-4 py-4 border-b border-gray-200">
          <h2 className="font-bold text-gray-800 truncate">{group.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-mono bg-violet-100 text-violet-700 px-2 py-0.5 rounded font-medium">
              {group.code}
            </span>
            <span className="text-xs text-gray-400">
              {group.members.length} member{group.members.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Members */}
        <div className="px-4 py-3 border-b border-gray-200">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Members</p>
          {group.members.map((m) => (
            <div key={m.userId} className="flex items-center gap-1.5 py-0.5">
              <div className="w-5 h-5 rounded-full bg-violet-200 flex items-center justify-center text-xs text-violet-700 font-medium">
                {m.user.username[0].toUpperCase()}
              </div>
              <span className="text-sm text-gray-600 truncate">{m.user.username}</span>
              {m.role === 'admin' && (
                <span className="text-xs text-violet-500 ml-auto">admin</span>
              )}
            </div>
          ))}
        </div>

        {/* Group Notes */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Notes</p>
            <GroupNoteCreate groupCode={params.code} />
          </div>
          {notes.length === 0 && (
            <p className="text-xs text-gray-400 italic">No notes yet. Create one!</p>
          )}
          {notes.map((note) => (
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
              <div className="text-xs text-gray-400 truncate">by {note.user.username}</div>
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
