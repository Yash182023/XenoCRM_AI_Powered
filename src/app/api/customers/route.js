// src/app/api/customers/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongdb';
import Customer from '@/models/Customer';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // Adjust path as per your project
//import customerIngestionQueue from '@/lib/queues/customerQueue'; // For BullMQ
import { Client } from "@upstash/qstash"; // For QStash

let qstashClient;
if (process.env.QSTASH_TOKEN) {
    qstashClient = new Client({ token: process.env.QSTASH_TOKEN });
}

export async function POST(request) {
  // const session = await getServerSession(authOptions);
  // if (!session) {
  //   return NextResponse.json({ message: "Unauthorized. Please log in." }, { status: 401 });
  // }

  try {
    const body = await request.json();
    const { name, email, totalSpend, visitCount, lastActiveDate } = body;

    if (!name || !email) {
      return NextResponse.json({ message: "Name and Email are required." }, { status: 400 });
    }
    // Add other synchronous validation...

    const jobData = { name, email, totalSpend, visitCount, lastActiveDate };

    // Conditionally use QStash or BullMQ
    if (process.env.ASYNC_PROCESSING_MODE === 'qstash') {
      if (!qstashClient) {
        console.error("/api/customers: QStash client not initialized. QSTASH_TOKEN missing?");
        return NextResponse.json({ message: "Internal Server Error: Async processing service (QStash) misconfigured." }, { status: 503 });
      }
      if (!process.env.QSTASH_CUSTOMER_CONSUMER_URL) {
        console.error("/api/customers: QSTASH_CUSTOMER_CONSUMER_URL not set for QStash mode.");
        return NextResponse.json({ message: "Internal Server Error: QStash consumer URL not configured." }, { status: 503 });
      }

      console.log("/api/customers: Publishing job to QStash for URL:", process.env.QSTASH_CUSTOMER_CONSUMER_URL);
      const qstashResponse = await qstashClient.publishJSON({
        url: process.env.QSTASH_CUSTOMER_CONSUMER_URL, // Your consumer endpoint
        // topic: "customer-ingestion", // Or publish to a topic
        body: jobData,
        // headers: { ... } // Optional: custom headers for your consumer
        // delay: "5s", // Optional: delay job
        // retries: 3, // Optional: configure retries
      });
      console.log(`/api/customers: Job ${qstashResponse.messageId} published to QStash.`);
      return NextResponse.json({ message: "Customer data received and queued for processing (QStash).", messageId: qstashResponse.messageId }, { status: 202 });

    } else { // Default to BullMQ or if ASYNC_PROCESSING_MODE is 'bullmq' or not set
      if (!customerIngestionQueue) {
        console.error("/api/customers: customerIngestionQueue (BullMQ) is not initialized.");
        return NextResponse.json({ message: "Internal Server Error: Queue service (BullMQ) unavailable." }, { status: 503 });
      }
      const job = await customerIngestionQueue.add('ingest-customer-data', jobData);
      console.log(`/api/customers: Added job ${job.id} to BullMQ with data:`, jobData);
      return NextResponse.json({ message: "Customer data received and queued for processing (BullMQ).", jobId: job.id }, { status: 202 });
    }

  } catch (error) {
    console.error("Error in POST /api/customers (queuing):", error);
    return NextResponse.json({ message: "Internal Server Error during queuing", error: error.message }, { status: 500 });
  }
}

// Optional: GET method to fetch customers (you might need this later)
export async function GET(request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        await dbConnect();
        const customers = await Customer.find({}).sort({ createdAt: -1 }); // Get all, newest first
        return NextResponse.json({ customers }, { status: 200 });
    } catch (error) {
        console.error("Error fetching customers:", error);
        return NextResponse.json({ message: "Error fetching customers", error: error.message }, { status: 500 });
    }
}