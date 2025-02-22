import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("shopms");

    const admin = await db.collection("users").findOne({ role: "admin" });
    
    return NextResponse.json({
      adminExists: !!admin,
      username: admin ? admin.username : null
    });
  } catch (error) {
    console.error('Check error:', error);
    return NextResponse.json({ message: "Check failed" }, { status: 500 });
  }
} 