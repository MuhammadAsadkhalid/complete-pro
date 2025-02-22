import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("shopms");
    
    const expenses = await db.collection("expenses").find({}).toArray();
    return NextResponse.json(expenses);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const client = await clientPromise;
    const db = client.db("shopms");
    const data = await request.json();

    const result = await db.collection("expenses").insertOne({
      ...data,
      date: new Date(),
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const client = await clientPromise;
    const db = client.db("shopms");
    const { id } = await request.json();

    const result = await db.collection("expenses").deleteOne({
      _id: new ObjectId(id)
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 