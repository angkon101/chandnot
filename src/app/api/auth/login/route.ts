import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { verifyPassword, createToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()
    if (!username || !password)
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 })

    const admin = createAdminClient()
    const { data: user } = await admin.from('User').select('*').eq('username', username).maybeSingle()
    if (!user) return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })

    const valid = await verifyPassword(password, user.password)
    if (!valid) return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 })

    const token = createToken(user.id, user.username)
    const response = NextResponse.json({ user: { id: user.id, username: user.username } })
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    return response
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
