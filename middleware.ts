import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { siteConfig } from '@/config/site';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only check root
  if (pathname === '/') {
    const visited = request.cookies.get('visited');

    // Check feature flag for splash screen
    if (!visited && siteConfig.features.splashScreen) {
      return NextResponse.redirect(new URL('/splash', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/'],
};
