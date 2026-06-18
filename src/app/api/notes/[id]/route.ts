import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { getAuthUser } from '@/lib/auth'

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: note } = await admin
    .from('Note').select('*, user:User!Note_userId_fkey(username)').eq('id', params.id).maybeSingle()
  if (!note) return NextResponse.json({ error: 'Note not found' }, { status: 404 })

  if (note.groupId) {
    const { data: member } = await admin
      .from('GroupMember').select('id').eq('groupId', note.groupId).eq('userId', auth.userId).maybeSingle()
    if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  } else if (note.userId !== auth.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  return NextResponse.json({ note })
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: note } = await admin.from('Note').select('userId, groupId').eq('id', params.id).maybeSingle()
  if (!note) return NextResponse.json({ error: 'Note not found' }, { status: 404 })

  if (note.groupId) {
    const { data: member } = await admin
      .from('GroupMember').select('id').eq('groupId', note.groupId).eq('userId', auth.userId).maybeSingle()
    if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  } else if (note.userId !== auth.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { title, content } = await req.json()
  const { data: updated, error } = await admin
    .from('Note')
    .update({ ...(title !== undefined && { title }), ...(content !== undefined && { content }) })
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ note: updated })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: note } = await admin.from('Note').select('userId').eq('id', params.id).maybeSingle()
  if (!note) return NextResponse.json({ error: 'Note not found' }, { status: 404 })
  if (note.userId !== auth.userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await admin.from('Note').delete().eq('id', params.id)
  return NextResponse.json({ success: true })
}
