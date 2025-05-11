// src/app/api/campaigns/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongdb';// Corrected path if mongodb.js is in lib
import Campaign from '@/models/Campaign';
import Customer from '@/models/Customer';
import CommunitcationLog from '@/models/CommunitcationLog';// CORRECTED TYPO and standard import
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { buildMongoQueryFromRules } from '@/lib/queryBuilder';

// --- Helper function for triggering message sending ---
async function triggerMessageSending(communicationLogDocuments) { // Takes array of actual DB documents
  if (!communicationLogDocuments || communicationLogDocuments.length === 0) {
    console.log("No communication log documents to send.");
    return;
  }

  console.log(`Attempting to send ${communicationLogDocuments.length} messages via dummy vendor...`);
  const vendorUrl = `${process.env.NEXTAUTH_URL}/api/dummy-vendor/send-message`;

  const sendPromises = communicationLogDocuments.map(async (logDoc) => { // logDoc is a Mongoose document
    try {
      const payload = {
        communicationLogId: logDoc._id.toString(), // Use the actual _id from the saved document
        customerId: logDoc.customerId.toString(),
        messageContent: logDoc.messageContent,
      };

      const response = await fetch(vendorUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error(`Error calling dummy vendor for logId ${payload.communicationLogId}: ${response.status} - ${errorData}`);
      } else {
        // console.log(`Successfully called dummy vendor for logId ${payload.communicationLogId}`);
      }
    } catch (error) {
      console.error(`Failed to call dummy vendor for log for communicationLogId ${logDoc._id}:`, error);
    }
  });

  await Promise.all(sendPromises);
  console.log("All messages have been dispatched to the dummy vendor for processing.");
}
// --- End of helper function ---

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    console.error("Unauthorized POST /api/campaigns: Session or user ID missing");
    return NextResponse.json({ message: "Unauthorized. Session or user ID missing." }, { status: 401 });
  }

  try {
    await dbConnect();
    const body = await request.json();
    const { name, segmentRules, messageTemplate } = body;

    if (!name || !segmentRules || !messageTemplate) {
      return NextResponse.json({ message: "Name, segment rules, and message template are required." }, { status: 400 });
    }

    // 1. Save the Campaign
    const newCampaign = new Campaign({
      name,
      segmentRules,
      messageTemplate,
      createdByUserId: session.user.id,
      status: 'processing', // Changed status to 'processing' while we work
    });
    await newCampaign.save();
    console.log(`Campaign ${newCampaign._id} saved. Status: processing.`);

    // 2. Fetch Customers Matching Segment Rules
    const mongoQuery = buildMongoQueryFromRules(segmentRules);
    const targetCustomers = await Customer.find(mongoQuery).select('_id name email').lean();
    console.log(`Found ${targetCustomers.length} customers for campaign ${newCampaign._id}`);

    if (targetCustomers.length === 0) {
      console.log(`No customers found for campaign ${newCampaign._id}.`);
      newCampaign.status = 'completed_no_audience'; // More descriptive status
      await newCampaign.save();
      return NextResponse.json({
        message: "Campaign created, but no customers matched the segment. No messages will be sent.",
        campaign: newCampaign
      }, { status: 201 });
    }

    // 3. Create CommunicationLog Entries for each targeted customer
    const logEntriesToCreate = targetCustomers.map(customer => {
      let personalizedMessage = messageTemplate
        .replace(/{{name}}/gi, customer.name || '')
        .replace(/{{email}}/gi, customer.email || '');
      return {
        campaignId: newCampaign._id,
        customerId: customer._id,
        status: 'pending',
        messageContent: personalizedMessage,
      };
    });

    let createdLogDocuments = []; // To store the actual documents from DB
    if (logEntriesToCreate.length > 0) {
      // insertMany returns an array of the inserted documents, including their _ids
      createdLogDocuments = await CommunitcationLog.insertMany(logEntriesToCreate); // CORRECTED MODEL NAME
      console.log(`${createdLogDocuments.length} communication log entries created for campaign ${newCampaign._id}`);
    }

    // 4. Trigger message sending with the actual created log documents
    if (createdLogDocuments.length > 0) {
      await triggerMessageSending(createdLogDocuments); // Call the helper function
      // After dispatching, we can update the campaign status.
      // The actual 'sent'/'failed' status will be on individual logs.
      newCampaign.status = 'active'; // Or 'dispatched'
      await newCampaign.save();
      console.log(`Campaign ${newCampaign._id} status updated to active after dispatching messages.`);
    } else {
        // This case should be covered by targetCustomers.length === 0, but as a fallback
        newCampaign.status = 'completed_no_logs';
        await newCampaign.save();
    }

    return NextResponse.json({
      message: `Campaign created and ${createdLogDocuments.length} messages dispatched to vendor.`,
      campaign: newCampaign,
      audienceSize: targetCustomers.length
    }, { status: 201 });

  } catch (error) {
    console.error("Error in POST /api/campaigns:", error);
    if (error.name === 'ValidationError') {
      return NextResponse.json({ message: "Validation Error", errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: "Internal Server Error", errorDetails: error.message, errorStack: error.stack }, { status: 500 }); // Added errorStack for more debug info
  }
}

export async function GET(request) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        console.error("Unauthorized GET /api/campaigns: Session or user missing");
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    try {
        await dbConnect();
        const campaignsFromDB = await Campaign.find({ createdByUserId: session.user.id })
                                          .sort({ createdAt: -1 })
                                          .lean(); // Use .lean() for plain JS objects, easier to add properties

        // For each campaign, fetch its communication log stats
        const campaignsWithStats = await Promise.all(
            campaignsFromDB.map(async (campaign) => {
                const logs = await CommunitcationLog.find({ campaignId: campaign._id }).select('status').lean();
                
                const audienceSize = logs.length;
                const sentCount = logs.filter(log => log.status === 'sent' || log.status === 'delivered').length; // delivered is also a success
                const failedCount = logs.filter(log => log.status === 'failed').length;
                // const pendingCount = logs.filter(log => log.status === 'pending').length; // If you want to show pending

                return {
                    ...campaign, // Spread the original campaign properties
                    audienceSize,
                    sentCount,
                    failedCount,
                    // pendingCount
                };
            })
        );

        return NextResponse.json({ campaigns: campaignsWithStats }, { status: 200 });
    } catch (error) {
        console.error("Error fetching campaigns with stats:", error);
        return NextResponse.json({ message: "Error fetching campaigns with stats", errorDetails: error.message }, { status: 500 });
    }
}