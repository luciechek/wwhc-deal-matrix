// app/api/access/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const form = await req.formData();
  const code = String(form.get('code') || '');
  const next = String(form.get('next') || '/');

  if (code && code === process.env.APP_ACCESS_CODE) {
    const res = NextResponse.redirect(new URL(next, req.url));
    res.cookies.set('accessgranted', 'yes', {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 jours
      path: '/',
    });
    return res;
  }

  // Mauvais code → retour sur /access avec un flag d'erreur
  const url = new URL('/access', req.url);
  url.searchParams.set('error', '1');
  url.searchParams.set('next', next);
  return NextResponse.redirect(url);
}
