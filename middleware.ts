// middleware.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const isAccess = req.nextUrl.pathname.startsWith('/access');
  const hasAccess = req.cookies.get('access')?.value === 'granted';

  if (!hasAccess && !isAccess) {
    const url = req.nextUrl.clone();
    url.pathname = '/access';
    return NextResponse.redirect(url);
  }
  if (hasAccess && isAccess) {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  // protège tout sauf /api, _next, favicon, etc.
  matcher: ['/((?!api|_next|favicon.ico|.*\\.(png|jpg|svg|ico)).*)'],
};
