import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const note = await prisma.note.findFirst({
    where: { id: params.id },
    include: { user: { select: { username: true } } },
  })
  if (!note) return NextResponse.json({ error: 'Note not found' }, { status: 404 })

  // Allow if personal note of user, or if user is a member of the group
  if (note.groupId) {
    const member = await prisma.groupMember.findFirst({
      where: { groupId: note.groupId, userId: auth.userId },
    })
    if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  } else if (note.userId !== auth.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json({ note })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const note = await prisma.note.findFirst({ where: { id: params.id } })
  if (!note) return NextResponse.json({ error: 'Note not found' }, { status: 404 })

  if (note.groupId) {
    const member = await prisma.groupMember.findFirst({
      where: { groupId: note.groupId, userId: auth.userId },
    })
    if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  } else if (note.userId !== auth.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { title, content } = await req.json()
  const updated = await prisma.note.update({
    where: { id: params.id },
    data: {
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
    },
  })

  // Broadcast change to group members if it's a group note
  if (note.groupId && global.io) {
    const group = await prisma.group.findUnique({ where: { id: note.groupId } })
    if (group) {
      global.io.to(`group:${group.code}`).emit('note-updated', {
        noteId: updated.id,
        title: updated.title,
        content: updated.content,
        username: auth.username,
      })
    }
  }

  return NextResponse.json({ note: updated })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const note = await prisma.note.findFirst({ where: { id: params.id } })
  if (!note) return NextResponse.json({ error: 'Note not found' }, { status: 404 })

  if (note.userId !== auth.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.note.delete({ where: { id: params.id } })
  return NextResponse.json({ success: true })
}
