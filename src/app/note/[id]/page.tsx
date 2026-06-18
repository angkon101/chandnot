import { redirect, notFound } from 'next/navigation'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Sidebar from '@/components/Sidebar'
import NoteEditor from '@/components/Editor'

export default async function NotePage({ params }: { params: { id: string } }) {
  const auth = getAuthUser()
  if (!auth) redirect('/login')

  const [note, notes, memberships] = await Promise.all([
    prisma.note.findFirst({ where: { id: params.id, userId: auth.userId } }),
    prisma.note.findMany({
      where: { userId: auth.userId, groupId: null },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, title: true, updatedAt: true, createdAt: true, userId: true, groupId: true, content: true },
    }),
    prisma.groupMember.findMany({
      where: { userId: auth.userId },
      include: { group: true },
    }),
  ])

  if (!note) notFound()

  const groups = memberships.map((m) => ({
    id: m.group.id,
    code: m.group.code,
    name: m.group.name,
    createdAt: m.group.createdAt.toISOString(),
  }))

  const serializedNotes = notes.map((n) => ({
    ...n,
    createdAt: n.createdAt.toISOString(),
    updatedAt: n.updatedAt.toISOString(),
  }))

  return (
    <div className="flex h-screen">
      <Sidebar notes={serializedNotes} groups={groups} username={auth.username} />
      <main className="flex-1 overflow-hidden bg-white">
        <NoteEditor
          noteId={note.id}
          initialTitle={note.title}
          initialContent={note.content}
          username={auth.username}
        />
      </main>
    </div>
  )
}
