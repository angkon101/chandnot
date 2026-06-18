import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { customAlphabet } from 'nanoid'

const generateCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8)

export async function GET() {
  const auth = getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const memberships = await prisma.groupMember.findMany({
    where: { userId: auth.userId },
    include: {
      group: {
        include: {
          members: { include: { user: { select: { username: true } } } },
          _count: { select: { notes: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const groups = memberships.map((m) => ({ ...m.group, role: m.role }))
  return NextResponse.json({ groups })
}

export async function POST(req: NextRequest) {
  const auth = getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Group name is required' }, { status: 400 })

  let code = generateCode()
  // Ensure code is unique
  while (await prisma.group.findUnique({ where: { code } })) {
    code = generateCode()
  }

  const group = await prisma.group.create({
    data: {
      code,
      name: name.trim(),
      members: { create: { userId: auth.userId, role: 'admin' } },
    },
    include: { members: { include: { user: { select: { username: true } } } } },
  })

  return NextResponse.json({ group }, { status: 201 })
}
