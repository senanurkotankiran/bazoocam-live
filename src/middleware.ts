import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Default fallback values - these will be used if database is not available
const defaultLocales = ["en", "fr", "es", "it", "tr"];
const defaultLocale = 'en';

export function middleware(request: NextRequest) {
  // Check if there is any supported locale in the pathname
  const pathname = request.nextUrl.pathname;

  // Skip middleware for admin, api, static files, and public assets
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('/favicon.ico') ||
    // Skip static files from public directory
    /\.(webp|jpg|jpeg|png|gif|svg|ico|css|js|woff|woff2|ttf|eot)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // For now, use default locales since middleware cannot be async
  // In production, you might want to use environment variables or a different approach
  const locales = defaultLocales;
  const currentDefaultLocale = defaultLocale;

  // Check if the pathname starts with a locale
  const localeInPath = locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // If there's a locale in path
  if (localeInPath) {
    // If it's the default locale, redirect to remove the prefix
    if (localeInPath === currentDefaultLocale) {
      const newPath = pathname.slice(3) || '/'; // Remove /locale
      return NextResponse.redirect(new URL(newPath, request.url));
    }
    // For other locales, continue normally
    return NextResponse.next();
  }

  // If no locale in path, assume it's the default locale
  // Rewrite to /defaultLocale internally but don't change the URL
  const url = request.nextUrl.clone();
  url.pathname = `/${currentDefaultLocale}${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|admin).*)']
}; 
