import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'

export default async function DashboardPage() {
  const auth = getAuthUser()
  if (!auth) redirect('/login')

  const admin = createAdminClient()
  const [{ data: notes }, { data: memberships }] = await Promise.all([
    admin.from('Note').select('id, title, updatedAt, createdAt, userId, groupId, content')
      .eq('userId', auth.userId).is('groupId', null).order('updatedAt', { ascending: false }),
    admin.from('GroupMember')
      .select('group:Group!GroupMember_groupId_fkey(id, code, name, createdAt)')
      .eq('userId', auth.userId).order('createdAt', { ascending: false }),
  ])

  const groups = (memberships ?? []).map((m: any) => m.group).filter(Boolean)

  return (
    <div className="flex h-screen">
      <Sidebar notes={notes ?? []} groups={groups} username={auth.username} />
      <main className="flex-1 flex items-center justify-center bg-cyber-black cyber-grid relative overflow-hidden min-w-0">
        <div className="text-center relative px-4 py-8 animate-[fade-in_0.5s_ease]">
          <div className="text-5xl mb-5">📓</div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight cyber-gradient-text mb-2">Your Open Notebook</h2>
          <p className="text-white/25 mb-8 font-mono text-xs sm:text-sm">Select a note to edit or create a new one</p>
          <div className="grid grid-cols-2 gap-3 max-w-64 mx-auto">
            <div className="cyber-card rounded-xl p-4 sm:p-5">
              <div className="text-2xl mb-2">📝</div>
              <div className="font-bold text-xl sm:text-2xl tracking-tight cyber-gradient-text font-mono">{(notes ?? []).length}</div>
              <div className="text-white/20 text-[10px] sm:text-xs font-mono mt-1.5 tracking-wide">NOTES</div>
            </div>
            <div className="cyber-card rounded-xl p-4 sm:p-5">
              <div className="text-2xl mb-2">👥</div>
              <div className="font-bold text-xl sm:text-2xl tracking-tight cyber-gradient-text font-mono">{groups.length}</div>
              <div className="text-white/20 text-[10px] sm:text-xs font-mono mt-1.5 tracking-wide">GROUPS</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
