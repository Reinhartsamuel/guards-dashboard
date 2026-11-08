import { NextResponse } from 'next/server';
import { verifyPassword, signToken } from '@/lib/auth';

export async function POST(req: Request) {
  const { username, password } = await req.json();

  if (username !== process.env.ADMIN_USER) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const valid = await verifyPassword(password, process.env.ADMIN_PASSWORD_HASH!);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const token = signToken({ user: username });
  const res = NextResponse.json({ ok: true });
  res.cookies.set('token', token, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  return res;
}
