import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { getAuthUser } from '@/lib/auth'

export async function GET() {
  const auth = getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: notes } = await admin
    .from('Note')
    .select('id, title, updatedAt, createdAt')
    .eq('userId', auth.userId)
    .is('groupId', null)
    .order('updatedAt', { ascending: false })

  return NextResponse.json({ notes: notes ?? [] })
}

export async function POST(req: NextRequest) {
  const auth = getAuthUser()
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const admin = createAdminClient()
  const { data: note, error } = await admin
    .from('Note')
    .insert({ title: body.title || 'Untitled Note', content: body.content || '{}', userId: auth.userId })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ note }, { status: 201 })
}
