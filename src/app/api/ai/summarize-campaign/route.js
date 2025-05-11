import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { generateText } from '@/lib/gemini';

function constructPromptForCampaignSummary(details) {
  const { campaignName, messageTemplate, audienceSize, sentCount, failedCount } = details;

  const deliverySuccessRate = audienceSize > 0 ? ((sentCount / audienceSize) * 100).toFixed(1) : 0;

  let prompt = `You are an expert marketing analyst AI.Provide a concise and insightful summary of the following marketing campaign's performance.
Focus on key metrics and offer a brief takeaway or observation.
Do not include any introductory or concluding phrases like "Here is a summary..." or "Overall...". Just provide the summary paragraph.
Campaign Details:
Name: "${campaignName}"
Target Audience Size: ${audienceSize}
Messages Successfully Sent: ${sentCount}
Messages Failed: ${failedCount}
Delivery Success Rate: ${deliverySuccessRate}%
Message Sent: "messageTemplate.substring(0,100)messageTemplate.substring(0,100){messageTemplate.length > 100 ? '...' : ''}"
Based on this data, generate a short performance summary paragraph:
`;

return prompt;
}
export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const campaignDetails = await request.json();

    if (!campaignDetails || !campaignDetails.campaignName) {
      return NextResponse.json({ message: "Campaign details are required." }, { status: 400 });
    }

    const prompt = constructPromptForCampaignSummary(campaignDetails);
    console.log("Sending prompt to Gemini for Campaign Summary:", prompt);

    const geminiResponseText = await generateText(prompt);
    console.log("Raw Gemini Response for Campaign Summary:", geminiResponseText);

    const summary = geminiResponseText.trim();

    if (!summary) {
        return NextResponse.json({ message: "AI could not generate a summary for this campaign.", summary: "" }, { status: 400 });
    }

    return NextResponse.json({ summary }, { status: 200 });

  } catch (error) {
    console.error("Error in /api/ai/summarize-campaign:", error);
    return NextResponse.json({ message: error.message || "Failed to generate campaign summary." }, { status: 500 });
  }
}