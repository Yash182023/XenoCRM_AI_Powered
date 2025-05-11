// src/app/api/consumers/process-customer/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongdb';
import Customer from '@/models/Customer';
// Correct import for App Router
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs"; // <<< CHANGE THIS IMPORT

async function handler(request) { // request is a standard Request object
  console.log("QSTASH APP ROUTER CONSUMER HANDLER CALLED");

  let body;
  try {
    // For App Router, `request.json()` is the standard way
    body = await request.json();
  } catch (e) {
    console.error("QStash Consumer (App Router): Failed to parse request.json()", e);
    // If body parsing fails, QStash might resend. It's good to see what was sent.
    try {
        const textBody = await request.text();
        console.error("QStash Consumer (App Router): Request body as text:", textBody);
    } catch (textErr) {
        console.error("QStash Consumer (App Router): Could not even read body as text.", textErr);
    }
    return NextResponse.json({ message: "Failed to parse request body." }, { status: 400 });
  }

  console.log("QStash Consumer (App Router): Received job payload:", body);
  const customerData = body;

  if (!customerData || typeof customerData.name === 'undefined' || typeof customerData.email === 'undefined') {
    console.error("QStash Consumer (App Router): Invalid or missing customerData in payload", customerData);
    return NextResponse.json({ message: "Invalid customer data in payload." }, { status: 400 });
  }

  try {
    await dbConnect();
    const newCustomer = new Customer(customerData);
    await newCustomer.save();
    console.log(`QStash Consumer (App Router): Successfully saved customer ${newCustomer._id}`);
    return NextResponse.json({ message: "Customer processed (App Router verified)", customerId: newCustomer._id }, { status: 200 });
  } catch (error) {
    console.error("QStash Consumer (App Router): Error processing job:", error);
    if (error.code === 11000) {
         console.warn(`QStash Consumer (App Router): Duplicate email...`);
         return NextResponse.json({ message: "Duplicate entry (App Router verified).", error: error.message }, { status: 200 });
    }
    return NextResponse.json({ message: "Error processing customer data (App Router verified)", error: error.message }, { status: 500 });
  }
}

// Use the correct HOF for App Router
export const POST = verifySignatureAppRouter(handler); // <<< CHANGE THIS LINE