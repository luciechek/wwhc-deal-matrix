import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  // remove the access cookie (same name + path as when you set it)
  (await cookies()).set({
    name: 'access',
    value: '',
    path: '/',
    maxAge: 0,
    httpOnly: true,
    sameSite: 'lax',
  });

  return NextResponse.json({ ok: true });
}
