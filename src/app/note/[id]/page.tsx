import { redirect, notFound } from 'next/navigation'
import { getAuthUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import NoteEditor from '@/components/Editor'

export default async function NotePage({ params }: { params: { id: string } }) {
  const auth = getAuthUser()
  if (!auth) redirect('/login')

  const admin = createAdminClient()
  const [{ data: note }, { data: notes }, { data: memberships }] = await Promise.all([
    admin.from('Note').select('*').eq('id', params.id).eq('userId', auth.userId).maybeSingle(),
    admin
      .from('Note')
      .select('id, title, updatedAt, createdAt, userId, groupId, content')
      .eq('userId', auth.userId)
      .is('groupId', null)
      .order('updatedAt', { ascending: false }),
    admin
      .from('GroupMember')
      .select('group:Group!GroupMember_groupId_fkey(id, code, name, createdAt)')
      .eq('userId', auth.userId),
  ])

  if (!note) notFound()

  const groups = (memberships ?? []).map((m: any) => m.group).filter(Boolean)

  return (
    <div className="flex h-screen">
      <Sidebar notes={notes ?? []} groups={groups} username={auth.username} />
      <main className="flex-1 overflow-hidden bg-white">
        <NoteEditor
          noteId={note.id}
          initialTitle={note.title}
          initialContent={note.content}
          username={auth.username}
        />
      </main>
    </div>
  )
}
