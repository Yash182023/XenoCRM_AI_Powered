import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongdb';
import Campaign from '@/models/Campaign';
import Customer from '@/models/Customer';
import CommunitcationLog from '@/models/CommunitcationLog';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { buildMongoQueryFromRules } from '@/lib/queryBuilder';

async function triggerMessageSending(communicationLogDocuments) { 
  if (!communicationLogDocuments || communicationLogDocuments.length === 0) {
    console.log("No communication log documents to send.");
    return;
  }

  console.log(`Attempting to send ${communicationLogDocuments.length} messages via dummy vendor...`);
  const vendorUrl = `${process.env.NEXTAUTH_URL}/api/dummy-vendor/send-message`;

  const sendPromises = communicationLogDocuments.map(async (logDoc) => { 
    try {
      const payload = {
        communicationLogId: logDoc._id.toString(), 
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
      }
    } catch (error) {
      console.error(`Failed to call dummy vendor for log for communicationLogId ${logDoc._id}:`, error);
    }
  });

  await Promise.all(sendPromises);
  console.log("All messages have been dispatched to the dummy vendor for processing.");
}

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

   
    const newCampaign = new Campaign({
      name,
      segmentRules,
      messageTemplate,
      createdByUserId: session.user.id,
      status: 'processing', 
    });
    await newCampaign.save();
    console.log(`Campaign ${newCampaign._id} saved. Status: processing.`);

    
    const mongoQuery = buildMongoQueryFromRules(segmentRules);
    const targetCustomers = await Customer.find(mongoQuery).select('_id name email').lean();
    console.log(`Found ${targetCustomers.length} customers for campaign ${newCampaign._id}`);

    if (targetCustomers.length === 0) {
      console.log(`No customers found for campaign ${newCampaign._id}.`);
      newCampaign.status = 'completed_no_audience'; 
      await newCampaign.save();
      return NextResponse.json({
        message: "Campaign created, but no customers matched the segment. No messages will be sent.",
        campaign: newCampaign
      }, { status: 201 });
    }

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

    let createdLogDocuments = []; 
    if (logEntriesToCreate.length > 0) {
      createdLogDocuments = await CommunitcationLog.insertMany(logEntriesToCreate); // CORRECTED MODEL NAME
      console.log(`${createdLogDocuments.length} communication log entries created for campaign ${newCampaign._id}`);
    }

    if (createdLogDocuments.length > 0) {
      await triggerMessageSending(createdLogDocuments);
      newCampaign.status = 'active'; 
      await newCampaign.save();
      console.log(`Campaign ${newCampaign._id} status updated to active after dispatching messages.`);
    } else {
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
                                          .lean(); 

        const campaignsWithStats = await Promise.all(
            campaignsFromDB.map(async (campaign) => {
                const logs = await CommunitcationLog.find({ campaignId: campaign._id }).select('status').lean();
                
                const audienceSize = logs.length;
                const sentCount = logs.filter(log => log.status === 'sent' || log.status === 'delivered').length; // delivered is also a success
                const failedCount = logs.filter(log => log.status === 'failed').length;

                return {
                    ...campaign, 
                    audienceSize,
                    sentCount,
                    failedCount,
                };
            })
        );

        return NextResponse.json({ campaigns: campaignsWithStats }, { status: 200 });
    } catch (error) {
        console.error("Error fetching campaigns with stats:", error);
        return NextResponse.json({ message: "Error fetching campaigns with stats", errorDetails: error.message }, { status: 500 });
    }
}