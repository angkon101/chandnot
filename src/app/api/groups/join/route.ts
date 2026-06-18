import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const auth = getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { code } = await req.json()
  if (!code) return NextResponse.json({ error: 'Group code is required' }, { status: 400 })

  const group = await prisma.group.findUnique({ where: { code: code.toUpperCase() } })
  if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 })

  const existing = await prisma.groupMember.findUnique({
    where: { userId_groupId: { userId: auth.userId, groupId: group.id } },
  })
  if (existing) return NextResponse.json({ error: 'Already a member of this group' }, { status: 409 })

  await prisma.groupMember.create({
    data: { userId: auth.userId, groupId: group.id, role: 'member' },
  })

  return NextResponse.json({ group })
}
