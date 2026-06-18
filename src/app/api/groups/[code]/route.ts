import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function GET(_req: Request, { params }: { params: { code: string } }) {
  const auth = getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const group = await prisma.group.findUnique({
    where: { code: params.code },
    include: {
      members: { include: { user: { select: { id: true, username: true } } } },
    },
  })
  if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 })

  const isMember = group.members.some((m) => m.userId === auth.userId)
  if (!isMember) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  return NextResponse.json({ group })
}
