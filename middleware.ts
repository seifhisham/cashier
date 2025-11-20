import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Protect all routes except /auth and Next static assets
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow auth pages and next internals
  if (
    pathname.startsWith('/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/public') ||
    pathname.match(/\.(.*)$/)
  ) {
    return NextResponse.next();
  }

  const isAuthed = req.cookies.get('auth')?.value === '1';
  const isAdmin = req.cookies.get('role')?.value === 'admin';
  if (!isAuthed || !isAdmin) {
    const url = req.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!auth|_next/static|_next/image|favicon.ico|assets|images|public).*)'],
};
