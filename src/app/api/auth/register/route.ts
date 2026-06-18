import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { hashPassword, createToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()

    if (!username || !password)
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 })
    if (username.length < 3)
      return NextResponse.json({ error: 'Username must be at least 3 characters' }, { status: 400 })
    if (password.length < 6)
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    if (!/^[a-zA-Z0-9_]+$/.test(username))
      return NextResponse.json({ error: 'Username can only contain letters, numbers, and underscores' }, { status: 400 })

    const admin = createAdminClient()
    const { data: existing } = await admin.from('User').select('id').eq('username', username).maybeSingle()
    if (existing) return NextResponse.json({ error: 'Username already taken' }, { status: 409 })

    const hashed = await hashPassword(password)
    const { data: user, error } = await admin
      .from('User').insert({ username, password: hashed }).select('id, username').single()

    if (error || !user) {
      console.error('Insert error:', JSON.stringify(error))
      return NextResponse.json({ error: error?.message ?? 'Failed to create user' }, { status: 500 })
    }

    const token = createToken(user.id, user.username)
    const response = NextResponse.json({ user }, { status: 201 })
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
