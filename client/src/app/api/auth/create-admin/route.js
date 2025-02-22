import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { username, password } = await request.json();
    const client = await clientPromise;
    const db = client.db("shopms");

    // Check if username already exists
    const existingUser = await db.collection("users").findOne({ username });
    if (existingUser) {
      return NextResponse.json({ message: "Username already exists" }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    await db.collection("users").insertOne({
      username,
      password: hashedPassword,
      role: "admin",
      createdAt: new Date()
    });

    return NextResponse.json({ message: "Admin user created successfully" });
  } catch (error) {
    console.error('Create admin error:', error);
    return NextResponse.json({ message: "Failed to create admin user" }, { status: 500 });
  }
} 