import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { getAuthUser } from '@/lib/auth'
import { customAlphabet } from 'nanoid'

const generateCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8)

export async function GET() {
  const auth = getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: memberships } = await admin
    .from('GroupMember')
    .select('role, group:Group!GroupMember_groupId_fkey(*, members:GroupMember(*))')
    .eq('userId', auth.userId)
    .order('createdAt', { ascending: false })

  const groups = (memberships ?? []).map((m: any) => ({ ...m.group, role: m.role }))
  return NextResponse.json({ groups })
}

export async function POST(req: NextRequest) {
  const auth = getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Group name is required' }, { status: 400 })

  const admin = createAdminClient()

  // Generate unique code
  let code = generateCode()
  while (true) {
    const { data } = await admin.from('Group').select('id').eq('code', code).maybeSingle()
    if (!data) break
    code = generateCode()
  }

  const { data: group, error } = await admin
    .from('Group').insert({ code, name: name.trim() }).select().single()
  if (error || !group) return NextResponse.json({ error: 'Failed to create group' }, { status: 500 })

  await admin.from('GroupMember').insert({ userId: auth.userId, groupId: group.id, role: 'admin' })

  return NextResponse.json({ group }, { status: 201 })
}
