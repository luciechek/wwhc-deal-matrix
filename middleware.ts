// middleware.ts (à la racine du projet)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_FILE = /\.(.*)$/;

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith('/access') ||
    pathname.startsWith('/api/access') ||
    pathname.startsWith('/api/logout') ||
    pathname.startsWith('/_next') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const access = req.cookies.get('access')?.value;
  if (access !== 'granted') {
    const url = req.nextUrl.clone();
    url.pathname = '/access';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
