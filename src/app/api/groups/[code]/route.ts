import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { getAuthUser } from '@/lib/auth'

export async function GET(_req: Request, { params }: { params: { code: string } }) {
  const auth = getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: group } = await admin
    .from('Group')
    .select('*, members:GroupMember!GroupMember_groupId_fkey(*, user:User!GroupMember_userId_fkey(id, username))')
    .eq('code', params.code)
    .maybeSingle()

  if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 })

  const isMember = group.members?.some((m: any) => m.userId === auth.userId)
  if (!isMember) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  return NextResponse.json({ group })
}
