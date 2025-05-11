import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { generateText } from '@/lib/gemini';

function constructPromptForMessageSuggestions(campaignName, objective, audienceDescription) {
  let prompt = `You are an expert marketing copywriter AI.
  Generate 3 distinct, concise, and engaging message variations for a marketing campaign.
The messages should be suitable for sending to customers.
Ensure each message includes personalization placeholders like {{name}} where appropriate.
Do not include any explanatory text, just the messages themselves, each on a new line.
Campaign Details:; if (campaignName) { prompt +=\n- Campaign Name/Theme: "
{objective}"; } if (audienceDescription) { prompt +=\n- Target Audience: Customers who match: "${audienceDescription}"; } prompt +=
Generate 3 message suggestions:
1.[Message 1]
2.[Message 2]
3.[Message 3]`; 
return prompt;
}
export async function POST(request) {
const session = await getServerSession(authOptions);
if (!session) {
return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
}
try {
const body = await request.json();
const { campaignName, objective, audienceDescription } = body;
const prompt = constructPromptForMessageSuggestions(campaignName, objective, audienceDescription);
 console.log("Sending prompt to Gemini for Message Suggestions:", prompt);

 const geminiResponseText = await generateText(prompt);
 console.log("Raw Gemini Response for Message Suggestions:", geminiResponseText);

 const suggestions = geminiResponseText
   .split('\n') // Split by new line
   .map(s => s.replace(/^\d+\.\s*/, '').trim())
   .filter(s => s.length > 0); 

 if (suggestions.length === 0 && geminiResponseText.trim().length > 0) {
     suggestions.push(geminiResponseText.trim());
 }
 
 


 if (suggestions.length === 0) {
   return NextResponse.json({ message: "AI couldn't generate suggestions for this input. Please try adjusting the objective or campaign name.", suggestions: [] }, { status: 400 });
 }
 
 return NextResponse.json({ suggestions }, { status: 200 });
 } catch (error) {
console.error("Error in /api/ai/message-suggestions:", error);
return NextResponse.json({ message: error.message || "Failed to generate message suggestions." }, { status: 500 });
}
}