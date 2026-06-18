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
      <main className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-7xl mb-4">📓</div>
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Your Open Notebook</h2>
          <p className="text-gray-400 mb-6">Select a note to edit or create a new one</p>
          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto text-sm text-gray-500">
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="text-2xl mb-1">📝</div>
              <div className="font-medium text-gray-700">{(notes ?? []).length}</div>
              <div>Personal notes</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="text-2xl mb-1">👥</div>
              <div className="font-medium text-gray-700">{groups.length}</div>
              <div>Groups joined</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
