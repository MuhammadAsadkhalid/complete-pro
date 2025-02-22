import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("shopms");
    
    const sales = await db.collection("sales")
      .aggregate([
        {
          $lookup: {
            from: "products",
            localField: "items.productId",
            foreignField: "_id",
            as: "productDetails"
          }
        },
        {
          $sort: { date: -1 }  // Sort by date in descending order (newest first)
        }
      ])
      .toArray();

    return NextResponse.json(sales);
  } catch (error) {
    console.error('Sales GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const client = await clientPromise;
    const db = client.db("shopms");
    const data = await request.json();

    // Calculate total and ensure numbers
    const total = data.items.reduce((sum, item) => {
      return sum + (Number(item.quantity) * Number(item.salePrice));
    }, 0);

    // Get current products to store their cost prices and validate stock
    const productIds = data.items.map(item => new ObjectId(item.productId));
    const products = await db.collection("products").find({
      _id: { $in: productIds }
    }).toArray();

    // Validate stock levels before proceeding
    for (const item of data.items) {
      const product = products.find(p => p._id.toString() === item.productId);
      if (!product) {
        return NextResponse.json({ error: `Product not found: ${item.productId}` }, { status: 404 });
      }
      if (Number(product.stock) < Number(item.quantity)) {
        return NextResponse.json({ 
          error: `Insufficient stock for product: ${product.name}. Available: ${product.stock}` 
        }, { status: 400 });
      }
    }

    // Convert items data and add cost price
    const items = data.items.map(item => {
      const product = products.find(p => p._id.toString() === item.productId);
      return {
        productId: new ObjectId(item.productId),
        quantity: Number(item.quantity),
        salePrice: Number(item.salePrice),
        costPrice: Number(product.price) // Store the cost price at time of sale
      };
    });

    // Create the sale
    const result = await db.collection("sales").insertOne({
      buyerName: data.buyerName,
      items,
      total,
      date: new Date(),
    });

    // Update product stock
    for (const item of items) {
      await db.collection("products").updateOne(
        { _id: item.productId },
        { $inc: { stock: -item.quantity } }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Sales POST Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const client = await clientPromise;
    const db = client.db("shopms");
    const { id, ...data } = await request.json();

    const result = await db.collection("sales").updateOne(
      { _id: new ObjectId(id) },
      { $set: data }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Sales PUT Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const client = await clientPromise;
    const db = client.db("shopms");
    const { id } = await request.json();

    // First get the sale details
    const sale = await db.collection("sales").findOne({ _id: new ObjectId(id) });
    
    if (!sale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    // Revert product stock
    for (const item of sale.items) {
      await db.collection("products").updateOne(
        { _id: item.productId },
        { $inc: { stock: Number(item.quantity) } }
      );
    }

    // Delete the sale
    const result = await db.collection("sales").deleteOne({
      _id: new ObjectId(id)
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Sales DELETE Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 