import { redirect, notFound } from 'next/navigation'
import { getAuthUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import NoteEditor from '@/components/Editor'
import GroupPanel from './GroupPanel'

export default async function GroupPage({
  params,
  searchParams,
}: {
  params: { code: string }
  searchParams: { note?: string }
}) {
  const auth = getAuthUser()
  if (!auth) redirect('/login')

  const admin = createAdminClient()
  const [{ data: group }, { data: myNotes }, { data: memberships }] = await Promise.all([
    admin
      .from('Group')
      .select('*, members:GroupMember!GroupMember_groupId_fkey(*, user:User!GroupMember_userId_fkey(id, username))')
      .eq('code', params.code)
      .maybeSingle(),
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

  if (!group) notFound()

  const isMember = group.members?.some((m: any) => m.userId === auth.userId)
  if (!isMember) redirect('/dashboard')

  const { data: groupNotes } = await admin
    .from('Note')
    .select('*, user:User!Note_userId_fkey(username)')
    .eq('groupId', group.id)
    .order('updatedAt', { ascending: false })

  const groups = (memberships ?? []).map((m: any) => m.group).filter(Boolean)
  const activeNote = searchParams.note ? (groupNotes ?? []).find((n: any) => n.id === searchParams.note) : null

  return (
    <div className="flex h-screen">
      <Sidebar notes={myNotes ?? []} groups={groups} username={auth.username} />

      <GroupPanel
        group={group}
        groupNotes={groupNotes ?? []}
        activeNoteId={activeNote?.id ?? null}
        groupCode={params.code}
      />

      <main className="flex-1 overflow-hidden bg-cyber-black min-w-0">
        {activeNote ? (
          <NoteEditor
            noteId={activeNote.id}
            initialTitle={activeNote.title}
            initialContent={activeNote.content}
            groupCode={params.code}
            username={auth.username}
          />
        ) : (
          <div className="flex items-center justify-center h-full px-4 animate-[fade-in_0.4s_ease]">
            <div className="text-center">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-xl font-bold font-display cyber-gradient-text mb-1">{group.name}</h3>
              <p className="text-white/25 text-sm mb-4 font-mono">Select a note or create a new one</p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/[0.02] border border-white/5 rounded-lg">
                <span className="text-[10px] font-mono text-white/20 tracking-widest">SHARE CODE</span>
                <span className="font-mono text-xs font-bold cyber-neon-text tracking-widest">{group.code}</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
