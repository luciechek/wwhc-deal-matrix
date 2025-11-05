import { NextResponse, NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // endpoints publics
  if (pathname.startsWith('/access') || pathname.startsWith('/api/access') || pathname.startsWith('/_next') || pathname.startsWith('/favicon')) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get('access')?.value;
  if (cookie === 'granted') {
    return NextResponse.next();
  }

  const url = req.nextUrl.clone();
  url.pathname = '/access';
  return NextResponse.redirect(url);
}

// Protège toutes les pages sauf les ressources internes
export const config = {
  matcher: ['/((?!_next|.*\\.(?:svg|png|jpg|jpeg|gif|ico|txt)).*)'],
};
