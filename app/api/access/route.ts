// app/api/access/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { code } = await req.json();

  if (code !== process.env.APP_ACCESS_CODE) {
    return NextResponse.json({ ok: false, error: 'Invalid code' }, { status: 401 });
  }

  // Cookie de session => pas de maxAge/expires => se supprime à la fermeture du navigateur
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: 'access',
    value: 'granted',
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    // PAS de expires / maxAge -> cookie de session
  });
  return res;
}
