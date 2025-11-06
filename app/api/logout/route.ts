// app/api/logout/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
  // On efface le cookie d’accès
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: 'access',
    value: '',
    expires: new Date(0),
    path: '/',
  });
  return res;
}
