import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

export async function PUT(request) {
  try {
    const { currentPassword, newPassword } = await request.json();
    const client = await clientPromise;
    const db = client.db("shopms");

    // Get the current admin user
    const admin = await db.collection("users").findOne({ role: "admin" });
    if (!admin) {
      return NextResponse.json({ message: "Admin user not found" }, { status: 404 });
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isValid) {
      return NextResponse.json({ message: "Current password is incorrect" }, { status: 401 });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.collection("users").updateOne(
      { role: "admin" },
      { $set: { password: hashedPassword } }
    );

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error('Password update error:', error);
    return NextResponse.json({ message: "Error updating password" }, { status: 500 });
  }
} 