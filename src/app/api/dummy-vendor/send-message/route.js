// src/app/api/dummy-vendor/send-message/route.js
import { NextResponse } from 'next/server';

// This is a DUMMY vendor. In a real app, this would be an external service.
// We are simulating its behavior within our own backend for this assignment.

export async function POST(request) {
  try {
    const body = await request.json();
    const { communicationLogId, customerId, messageContent } = body; // We expect these fields

    if (!communicationLogId || !customerId || !messageContent) {
      console.error("DummyVendor: Missing required fields", body);
      return NextResponse.json({ message: "DummyVendor: Missing communicationLogId, customerId, or messageContent" }, { status: 400 });
    }

    console.log(`DummyVendor: Received message to send for log ID ${communicationLogId} to customer ${customerId}: "${messageContent.substring(0, 50)}..."`);

    // Simulate network delay and processing
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500)); // 0.5s to 1.5s delay

    const isSuccess = Math.random() < 0.9; // 90% success rate

    const deliveryStatus = isSuccess ? 'sent' : 'failed'; // Or 'delivered' if vendor confirms actual delivery
    const failureReason = isSuccess ? null : "Simulated vendor delivery failure";

    console.log(`DummyVendor: Simulated sending for log ID ${communicationLogId}. Status: ${deliveryStatus}`);

    // IMPORTANT: The dummy vendor now calls BACK to our Delivery Receipt API
    // In a real scenario, NEXTAUTH_URL might be different if the vendor is truly external.
    // For this assignment, it's calling back to itself.
    const receiptApiUrl = `${process.env.NEXTAUTH_URL}/api/delivery-receipt`;

    try {
        const callbackResponse = await fetch(receiptApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                communicationLogId: communicationLogId,
                status: deliveryStatus,
                failureReason: failureReason,
                vendorMessageId: `dummy-vendor-${Date.now()}-${communicationLogId}` // Example vendor ID
            }),
        });

        if (!callbackResponse.ok) {
            const errorData = await callbackResponse.text();
            console.error(`DummyVendor: Callback to Delivery Receipt API failed for log ID ${communicationLogId}. Status: ${callbackResponse.status}, Body: ${errorData}`);
            // If callback fails, what should the vendor do? Retry? For now, we just log.
        } else {
            console.log(`DummyVendor: Successfully called back Delivery Receipt API for log ID ${communicationLogId}`);
        }
    } catch (callbackError) {
        console.error(`DummyVendor: Error calling Delivery Receipt API for log ID ${communicationLogId}:`, callbackError);
    }


    // The vendor itself might just return a "queued" or "processing" status to its caller.
    // The actual delivery status comes via the webhook/callback.
    return NextResponse.json({ message: "Message received by dummy vendor for processing.", vendorTrackingId: `dummy-vendor-${Date.now()}` }, { status: 202 }); // 202 Accepted

  } catch (error) {
    console.error("DummyVendor: Error processing send-message request:", error);
    return NextResponse.json({ message: "DummyVendor: Internal Server Error", error: error.message }, { status: 500 });
  }
}