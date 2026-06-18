import { createClient } from '@supabase/supabase-js'

const URL = 'https://izfsglgrpyxfrimznzhc.supabase.co'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml6ZnNnbGdycHl4ZnJpbXpuemhjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTc4MTQyOSwiZXhwIjoyMDk3MzU3NDI5fQ.EO0qYCNPUv3hsKqRfzTmrZRcIBQK1qjQaA7s6pI4L3U'

const supabase = createClient(URL, SERVICE_KEY, {
  auth: { persistSession: false }
})

async function runMigration() {
  console.log('Creating tables via Supabase...')

  // Try creating exec_sql helper function first via direct REST
  const res = await fetch(`${URL}/rest/v1/rpc/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'apikey': SERVICE_KEY,
      'Content-Type': 'application/json',
    },
  })

  // Try inserting to see what error we get (helps diagnose permissions)
  const { error: testError } = await supabase.from('User').select('id').limit(1)
  console.log('Table check:', testError?.message ?? 'Table exists!')

  if (testError?.message?.includes('does not exist') || testError?.code === 'PGRST205') {
    console.log('\nTables do not exist. Cannot create via REST API (DDL restriction).')
    console.log('\nPlease run migrate.sql in Supabase SQL Editor:')
    console.log('https://supabase.com/dashboard/project/izfsglgrpyxfrimznzhc/sql/new')
    process.exit(1)
  }

  console.log('Database is ready!')
}

runMigration().catch(console.error)
