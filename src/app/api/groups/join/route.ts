import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { getAuthUser } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const auth = getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { code } = await req.json()
  if (!code) return NextResponse.json({ error: 'Group code is required' }, { status: 400 })

  const admin = createAdminClient()
  const { data: group } = await admin.from('Group').select('*').eq('code', code.toUpperCase()).maybeSingle()
  if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 })

  const { data: existing } = await admin
    .from('GroupMember').select('id').eq('userId', auth.userId).eq('groupId', group.id).maybeSingle()
  if (existing) return NextResponse.json({ error: 'Already a member of this group' }, { status: 409 })

  await admin.from('GroupMember').insert({ userId: auth.userId, groupId: group.id, role: 'member' })
  return NextResponse.json({ group })
}
