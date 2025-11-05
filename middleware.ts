// middleware.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  const cookie = req.cookies.get('accessgranted')?.value;

  // Laissez passer la page d'accès, ses assets et la route API qui pose le cookie
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/access') ||
    pathname.startsWith('/api/access')
  ) {
    return NextResponse.next();
  }

  // Déjà authentifié ?
  if (cookie === 'yes') return NextResponse.next();

  // Bloquer les autres API si non authentifié
  if (pathname.startsWith('/api')) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  // Rediriger vers /access pour les pages
  const url = req.nextUrl.clone();
  url.pathname = '/access';
  url.searchParams.set('next', pathname + (searchParams.toString() ? `?${searchParams.toString()}` : ''));
  return NextResponse.redirect(url);
}

// Appliquer le middleware partout (sauf fichiers statiques déjà exclus plus haut)
export const config = {
  matcher: ['/((?!_next|favicon.ico).*)'],
};
