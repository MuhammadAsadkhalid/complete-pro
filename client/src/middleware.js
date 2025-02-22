import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export function middleware(request) {
  // Check if the request is for the login page or setup page
  if (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/setup') {
    return NextResponse.next();
  }

  // Get the token from cookies
  const token = request.cookies.get('auth_token')?.value;

  // If there's no token, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    return NextResponse.next();
  } catch (error) {
    // If token is invalid, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api/auth/* (authentication endpoints)
     * 2. /login (login page)
     * 3. /_next/static (static files)
     * 4. /_next/image (image optimization files)
     * 5. /favicon.ico (favicon file)
     */
    '/((?!api/auth|login|_next/static|_next/image|favicon.ico).*)',
  ],
}; 