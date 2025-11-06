import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: 'access',
    value: '',
    path: '/',
    maxAge: 0,        // supprime le cookie
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  return res;
}