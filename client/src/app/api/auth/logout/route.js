import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // Clear the auth token cookie
    cookies().delete('auth_token');
    return NextResponse.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ message: "Logout failed" }, { status: 500 });
  }
} 