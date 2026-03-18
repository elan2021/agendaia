import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('atendimento_session');
  const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard');

  if (isDashboardPage && !session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If logged in and trying to access login/register, go to dashboard
  const isAuthPage = request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/cadastro';
  if (isAuthPage && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/cadastro'],
};
