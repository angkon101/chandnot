import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'

export default async function DashboardPage() {
  const auth = getAuthUser()
  if (!auth) redirect('/login')

  const admin = createAdminClient()
  const [{ data: notes }, { data: memberships }] = await Promise.all([
    admin
      .from('Note')
      .select('id, title, updatedAt, createdAt, userId, groupId, content')
      .eq('userId', auth.userId)
      .is('groupId', null)
      .order('updatedAt', { ascending: false }),
    admin
      .from('GroupMember')
      .select('group:Group!GroupMember_groupId_fkey(id, code, name, createdAt)')
      .eq('userId', auth.userId)
      .order('createdAt', { ascending: false }),
  ])

  const groups = (memberships ?? []).map((m: any) => m.group).filter(Boolean)

  return (
    <div className="flex h-screen">
      <Sidebar notes={notes ?? []} groups={groups} username={auth.username} />
      <main className="flex-1 flex items-center justify-center bg-cyber-black cyber-grid relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-px h-40 bg-gradient-to-b from-transparent via-cyber-cyan/10 to-transparent" />
          <div className="absolute bottom-1/4 right-1/4 w-px h-40 bg-gradient-to-t from-transparent via-cyber-pink/10 to-transparent" />
        </div>

        <div className="text-center relative">
          <div className="text-5xl mb-4 inline-block">📓</div>
          <h2 className="text-2xl font-bold font-display cyber-gradient-text mb-2">Your Open Notebook</h2>
          <p className="text-white/30 mb-6 font-mono text-sm">Select a note to edit or create a new one</p>
          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
            <div className="cyber-card p-4">
              <div className="text-xl mb-1">📝</div>
              <div className="font-bold cyber-gradient-text text-lg font-mono">{(notes ?? []).length}</div>
              <div className="text-white/30 text-xs font-mono mt-1">PERSONAL NOTES</div>
            </div>
            <div className="cyber-card p-4">
              <div className="text-xl mb-1">👥</div>
              <div className="font-bold cyber-gradient-text text-lg font-mono">{groups.length}</div>
              <div className="text-white/30 text-xs font-mono mt-1">GROUPS JOINED</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
