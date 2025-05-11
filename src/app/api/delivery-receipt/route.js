import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongdb';
import CommunitcationLog from '@/models/CommunitcationLog';

export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { communicationLogId, status, failureReason, vendorMessageId } = body;

    if (!communicationLogId || !status) {
      console.error("DeliveryReceipt: Missing communicationLogId or status", body);
      return NextResponse.json({ message: "DeliveryReceipt: Missing communicationLogId or status" }, { status: 400 });
    }

    const validStatuses = ['sent', 'failed', 'delivered']; 
    if (!validStatuses.includes(status)) {
        console.error("DeliveryReceipt: Invalid status received", status);
        return NextResponse.json({ message: `DeliveryReceipt: Invalid status. Must be one of ${validStatuses.join(', ')}` }, { status: 400 });
    }

    console.log(`DeliveryReceipt: Received status update for log ID ${communicationLogId}. Status: ${status}`);

    const logEntry = await CommunitcationLog.findById(communicationLogId);

    if (!logEntry) {
      console.error(`DeliveryReceipt: CommunicationLog entry not found for ID: ${communicationLogId}`);
      return NextResponse.json({ message: "CommunicationLog entry not found" }, { status: 404 });
    }

    logEntry.status = status;
    logEntry.sentAt = new Date(); 
    if (failureReason && status === 'failed') {
      logEntry.failureReason = failureReason;
    }
    

    await logEntry.save();
    console.log(`DeliveryReceipt: Updated CommunicationLog ID ${communicationLogId} to status ${status}`);

    

    return NextResponse.json({ message: "Delivery receipt processed successfully" }, { status: 200 });

  } catch (error) {
    console.error("DeliveryReceipt: Error processing delivery receipt:", error);
    return NextResponse.json({ message: "DeliveryReceipt: Internal Server Error processing receipt" }, { status: 500 });
  }
}