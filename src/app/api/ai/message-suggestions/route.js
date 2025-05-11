// src/app/api/ai/message-suggestions/route.js
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { generateText } from '@/lib/gemini'; // Your Gemini utility

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
3.[Message 3]`; // The [Message X] is for Gemini to understand the format, it shouldn't output it literally.
// Alternative: Ask for JSON output
// prompt = ... (context above) ... // Output a JSON array of 3 strings, where each string is a message suggestion. Example: ["message 1", "message 2", "message 3"] // JSON array of suggestions: //;
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

 // Parse the suggestions. Gemini might return them as a numbered list or just new-line separated.
 const suggestions = geminiResponseText
   .split('\n') // Split by new line
   .map(s => s.replace(/^\d+\.\s*/, '').trim()) // Remove leading numbers like "1. ", "2. " and trim whitespace
   .filter(s => s.length > 0); // Remove any empty lines

 if (suggestions.length === 0 && geminiResponseText.trim().length > 0) {
     // If splitting didn't work well but there's text, add the whole text as one suggestion
     suggestions.push(geminiResponseText.trim());
 }
 
 // If you asked for JSON array output in the prompt, the parsing would be:
 // let suggestions = [];
 // try {
 //   const jsonMatch = geminiResponseText.match(/(\[[\s\S]*\])/);
 //   if (jsonMatch && jsonMatch[1]) {
 //     suggestions = JSON.parse(jsonMatch[1]);
 //   } else { suggestions = JSON.parse(geminiResponseText); } // Fallback
 //   if (!Array.isArray(suggestions) || !suggestions.every(s => typeof s === 'string')) {
 //      suggestions = [geminiResponseText.trim()]; // Fallback if not array of strings
 //   }
 // } catch (e) { ... }


 if (suggestions.length === 0) {
   return NextResponse.json({ message: "AI couldn't generate suggestions for this input. Please try adjusting the objective or campaign name.", suggestions: [] }, { status: 400 });
 }
 
 return NextResponse.json({ suggestions }, { status: 200 });
 } catch (error) {
console.error("Error in /api/ai/message-suggestions:", error);
return NextResponse.json({ message: error.message || "Failed to generate message suggestions." }, { status: 500 });
}
}