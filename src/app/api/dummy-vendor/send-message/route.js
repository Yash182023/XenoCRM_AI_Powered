import { NextResponse } from 'next/server';


export async function POST(request) {
  try {
    const body = await request.json();
    const { communicationLogId, customerId, messageContent } = body; 

    if (!communicationLogId || !customerId || !messageContent) {
      console.error("DummyVendor: Missing required fields", body);
      return NextResponse.json({ message: "DummyVendor: Missing communicationLogId, customerId, or messageContent" }, { status: 400 });
    }

    console.log(`DummyVendor: Received message to send for log ID ${communicationLogId} to customer ${customerId}: "${messageContent.substring(0, 50)}..."`);

    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));

    const isSuccess = Math.random() < 0.9; 
    const deliveryStatus = isSuccess ? 'sent' : 'failed'; 
    const failureReason = isSuccess ? null : "Simulated vendor delivery failure";

    console.log(`DummyVendor: Simulated sending for log ID ${communicationLogId}. Status: ${deliveryStatus}`);

    const receiptApiUrl = `${process.env.NEXTAUTH_URL}/api/delivery-receipt`;

    try {
        const callbackResponse = await fetch(receiptApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                communicationLogId: communicationLogId,
                status: deliveryStatus,
                failureReason: failureReason,
                vendorMessageId: `dummy-vendor-${Date.now()}-${communicationLogId}` 
            }),
        });

        if (!callbackResponse.ok) {
            const errorData = await callbackResponse.text();
            console.error(`DummyVendor: Callback to Delivery Receipt API failed for log ID ${communicationLogId}. Status: ${callbackResponse.status}, Body: ${errorData}`);
        } else {
            console.log(`DummyVendor: Successfully called back Delivery Receipt API for log ID ${communicationLogId}`);
        }
    } catch (callbackError) {
        console.error(`DummyVendor: Error calling Delivery Receipt API for log ID ${communicationLogId}:`, callbackError);
    }



    return NextResponse.json({ message: "Message received by dummy vendor for processing.", vendorTrackingId: `dummy-vendor-${Date.now()}` }, { status: 202 }); // 202 Accepted

  } catch (error) {
    console.error("DummyVendor: Error processing send-message request:", error);
    return NextResponse.json({ message: "DummyVendor: Internal Server Error", error: error.message }, { status: 500 });
  }
}