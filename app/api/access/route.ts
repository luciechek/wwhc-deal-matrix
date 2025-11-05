import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    const expected = (process.env.APP_ACCESS_CODE || '').trim();

    if (!expected) {
      return NextResponse.json({ ok: false, error: 'Missing APP_ACCESS_CODE on server' }, { status: 500 });
    }
    if ((code || '').trim() !== expected) {
      return NextResponse.json({ ok: false, error: 'Invalid code' }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true });
    // cookie d’accès ~7 jours
    res.cookies.set('access', 'granted', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
      secure: true,
    });
    return res;
  } catch {
    return NextResponse.json({ ok: false, error: 'Bad request' }, { status: 400 });
  }
}
