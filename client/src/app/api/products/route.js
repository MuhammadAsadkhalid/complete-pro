import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("shopms");
    
    const products = await db.collection("products").find({}).toArray();
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const client = await clientPromise;
    const db = client.db("shopms");
    const data = await request.json();

    // Convert stock and price to numbers
    const productData = {
      ...data,
      stock: Number(data.stock),
      price: Number(data.price)
    };

    const result = await db.collection("products").insertOne(productData);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const client = await clientPromise;
    const db = client.db("shopms");
    const data = await request.json();
    const { _id, ...updateData } = data;

    // Convert stock and price to numbers if they exist in the update
    if (updateData.stock !== undefined) {
      updateData.stock = Number(updateData.stock);
    }
    if (updateData.price !== undefined) {
      updateData.price = Number(updateData.price);
    }

    const result = await db.collection("products").updateOne(
      { _id: new ObjectId(_id) },
      { $set: updateData }
    );

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

    const result = await db.collection("products").deleteOne({
      _id: new ObjectId(id)
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 