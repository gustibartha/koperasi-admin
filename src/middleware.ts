import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Deteksi apakah user sedang mencoba masuk ke halaman rahasia
  const isProtectedRoute = path.startsWith('/dashboard');
  
  // Better Auth menyimpan tiket masuk bernama 'better-auth.session_token' di Cookies
  const hasSession = request.cookies.has('better-auth.session_token');

  // Jika mencoba ke dashboard tapi tidak punya tiket -> Lempar ke Login
  if (isProtectedRoute && !hasSession) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Jika sudah punya tiket tapi malah buka halaman login -> Dorong ke Dashboard
  if (path === '/login' && hasSession) {
     return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Beri tahu satpam halaman mana saja yang harus dijaga ketat
export const config = {
  matcher: ['/dashboard/:path*', '/login'],
};