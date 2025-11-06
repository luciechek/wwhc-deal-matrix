// app/api/access/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { code } = await req.json().catch(() => ({}));

  if (!code || code !== process.env.APP_ACCESS_CODE) {
    return NextResponse.json({ error: 'Invalid code' }, { status: 401 });
  }

  // Cookie de session : pas de maxAge/expires
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: 'access',
    value: 'granted',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });
  return res;
}
