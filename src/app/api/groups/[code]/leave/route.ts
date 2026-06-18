import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { getAuthUser } from '@/lib/auth'

export async function POST(_req: Request, { params }: { params: { code: string } }) {
  const auth = getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: group } = await admin.from('Group').select('id').eq('code', params.code).maybeSingle()
  if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 })

  const { data: membership } = await admin
    .from('GroupMember')
    .select('id, role')
    .eq('groupId', group.id)
    .eq('userId', auth.userId)
    .maybeSingle()

  if (!membership) return NextResponse.json({ error: 'Not a member' }, { status: 400 })

  const { data: admins } = await admin
    .from('GroupMember')
    .select('id')
    .eq('groupId', group.id)
    .eq('role', 'admin')

  if (membership.role === 'admin' && (admins?.length ?? 0) <= 1) {
    await admin.from('Group').delete().eq('id', group.id)
  } else {
    await admin.from('GroupMember').delete().eq('id', membership.id)
  }

  return NextResponse.json({ success: true })
}
