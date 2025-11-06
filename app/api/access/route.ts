// app/api/access/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { code } = await req.json();
  if (code !== process.env.APP_ACCESS_CODE) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });

  // Cookie de session (PAS de maxAge / expires) => redemande après redémarrage du navigateur
  res.cookies.set({
    name: 'access',
    value: 'granted',
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  return res;
}
