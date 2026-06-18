import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function GET(_req: Request, { params }: { params: { code: string } }) {
  const auth = getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const group = await prisma.group.findUnique({ where: { code: params.code } })
  if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 })

  const member = await prisma.groupMember.findFirst({
    where: { groupId: group.id, userId: auth.userId },
  })
  if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const notes = await prisma.note.findMany({
    where: { groupId: group.id },
    include: { user: { select: { username: true } } },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json({ notes })
}

export async function POST(req: NextRequest, { params }: { params: { code: string } }) {
  const auth = getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const group = await prisma.group.findUnique({ where: { code: params.code } })
  if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 })

  const member = await prisma.groupMember.findFirst({
    where: { groupId: group.id, userId: auth.userId },
  })
  if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json().catch(() => ({}))
  const note = await prisma.note.create({
    data: {
      title: body.title || 'Untitled Note',
      content: body.content || '{}',
      userId: auth.userId,
      groupId: group.id,
    },
    include: { user: { select: { username: true } } },
  })

  return NextResponse.json({ note }, { status: 201 })
}
