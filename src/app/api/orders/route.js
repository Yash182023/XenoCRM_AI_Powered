import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongdb';
import Order from '@/models/Order';
import Customer from '@/models/Customer'; 
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(request) {
  // const session = await getServerSession(authOptions);

  // if (!session) {
  //   return NextResponse.json({ message: "Unauthorized. Please log in." }, { status: 401 });
  // }

  try {
    await dbConnect();

    const body = await request.json();
    const { customerId, amount, orderDate } = body;

    if (!customerId || amount === undefined) { 
      return NextResponse.json({ message: "Customer ID and Amount are required." }, { status: 400 });
    }

    const customerExists = await Customer.findById(customerId);
    if (!customerExists) {
      return NextResponse.json({ message: "Customer not found with the provided ID." }, { status: 404 });
    }

    const newOrder = new Order({
      customerId,
      amount,
      orderDate,
      
    });

    await newOrder.save();

    
    customerExists.totalSpend = (customerExists.totalSpend || 0) + newOrder.amount;
    customerExists.visitCount = (customerExists.visitCount || 0) + 1;
    customerExists.lastActiveDate = newOrder.orderDate || Date.now(); 
    await customerExists.save();


    return NextResponse.json({ message: "Order created successfully", order: newOrder }, { status: 201 });

  } catch (error) {
    console.error("Error creating order:", error);
    if (error.name === 'ValidationError') {
      return NextResponse.json({ message: "Validation Error", errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        await dbConnect();
        const orders = await Order.find({})
                                  .populate('customerId', 'name email') 
                                  .sort({ orderDate: -1 });
        return NextResponse.json({ orders }, { status: 200 });
    } catch (error) {
        console.error("Error fetching orders:", error);
        return NextResponse.json({ message: "Error fetching orders", error: error.message }, { status: 500 });
    }
}