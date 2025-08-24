import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJwt } from './src/lib/auth';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');

  // Check if the request is for admin routes
  if (request.nextUrl.pathname === '/admin' || request.nextUrl.pathname.startsWith('/admin/')) {
    if (!token) {
      // Redirect to login if no token
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const decoded = verifyJwt<{ userId: string; role: string }>(token);
      
      if (!decoded || decoded.role !== 'admin') {
        // Redirect to dashboard if not admin
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch (error) {
      // Redirect to login if token is invalid
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Check if the request is for login/register routes and user is already logged in
  if (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/register') {
    if (token) {
      try {
        const decoded = verifyJwt<{ userId: string; role: string }>(token);
        
        if (decoded) {
          // User is logged in, redirect based on role
          if (decoded.role === 'admin') {
            return NextResponse.redirect(new URL('/admin', request.url));
          } else {
            return NextResponse.redirect(new URL('/dashboard', request.url));
          }
        }
      } catch (error) {
        // Token is invalid, remove it and continue to login/register
        // The client-side component will handle this
      }
    }
  }

  // Check if the request is for profile route and user is not logged in
  if (request.nextUrl.pathname === '/profile') {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const decoded = verifyJwt<{ userId: string; role: string }>(token);
      
      if (!decoded) {
        return NextResponse.redirect(new URL('/login', request.url));
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/login', '/register', '/profile'],
};
