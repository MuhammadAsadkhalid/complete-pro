import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const client = await clientPromise;
    const db = client.db("shopms");

    // Check if admin user already exists
    const existingAdmin = await db.collection("users").findOne({ role: "admin" });
    if (existingAdmin) {
      return NextResponse.json({ message: "Admin user already exists" }, { status: 400 });
    }

    // Create default admin user
    const defaultPassword = "admin123"; // This is the default password
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    await db.collection("users").insertOne({
      username: "admin",
      password: hashedPassword,
      role: "admin",
      createdAt: new Date()
    });

    return NextResponse.json({ 
      message: "Admin user created successfully",
      defaultCredentials: {
        username: "admin",
        password: defaultPassword
      }
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({ message: "Setup failed" }, { status: 500 });
  }
} 