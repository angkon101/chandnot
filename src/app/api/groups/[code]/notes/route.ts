import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { getAuthUser } from '@/lib/auth'

export async function GET(_req: Request, { params }: { params: { code: string } }) {
  const auth = getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: group } = await admin.from('Group').select('id').eq('code', params.code).maybeSingle()
  if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 })

  const { data: member } = await admin
    .from('GroupMember').select('id').eq('groupId', group.id).eq('userId', auth.userId).maybeSingle()
  if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: notes } = await admin
    .from('Note')
    .select('*, user:User!Note_userId_fkey(username)')
    .eq('groupId', group.id)
    .order('updatedAt', { ascending: false })

  return NextResponse.json({ notes: notes ?? [] })
}

export async function POST(req: NextRequest, { params }: { params: { code: string } }) {
  const auth = getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: group } = await admin.from('Group').select('id').eq('code', params.code).maybeSingle()
  if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 })

  const { data: member } = await admin
    .from('GroupMember').select('id').eq('groupId', group.id).eq('userId', auth.userId).maybeSingle()
  if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json().catch(() => ({}))
  const { data: note, error } = await admin
    .from('Note')
    .insert({ title: body.title || 'Untitled Note', content: body.content || '{}', userId: auth.userId, groupId: group.id })
    .select('*, user:User!Note_userId_fkey(username)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ note }, { status: 201 })
}
