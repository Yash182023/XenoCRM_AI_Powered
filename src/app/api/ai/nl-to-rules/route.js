import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { generateText } from '@/lib/gemini'; 

function constructPromptForNLRules(userQuery) {
  return `You are an expert AI assistant that converts natural language customer descriptions into structured JSON segmentation rules for a CRM.
Your goal is to output a valid JSON array of rule objects. Do NOT include any explanatory text before or after the JSON output itself.
Available customer fields for segmentation:
"totalSpend": Numeric. Represents total money spent by the customer in INR.
"visitCount": Numeric. Represents the total number of visits the customer has made.
"lastActiveDate": Numeric. Represents the number of days since the customer was last active. For example, "inactive for 90 days" means lastActiveDate >= 90. "Active in the last 30 days" means lastActiveDate <= 30.
Each rule object in the JSON array must have the following keys:
"field": (string) One of "totalSpend", "visitCount", "lastActiveDate".
"operator": (string) One of ">", "<", "=", ">=", "<=".
"value": (string or number) The value for the condition. For "lastActiveDate", this will be the number of days.
Logic:
If multiple conditions are clearly connected by "AND", create separate rule objects for each condition. The frontend will treat them as ANDed.
If conditions are connected by "OR", try to represent this if it's simple. However, complex OR logic is harder for the current CRM. If a query implies multiple distinct segments (strong OR), it's okay to generate rules for the most prominent part or ask the user to simplify.
If a query is too vague or doesn't map to the available fields, output an empty JSON array: [].
Example 1:
User Query: "Customers who spent over 10000 INR AND made less than 3 visits"
JSON Output:
[
{ "field": "totalSpend", "operator": ">", "value": "10000" },
{ "field": "visitCount", "operator": "<", "value": "3" }
]
Example 2:
User Query: "People inactive for more than 90 days"
JSON Output:
[
{ "field": "lastActiveDate", "operator": ">=", "value": "90" }
]
Example 3:
User Query: "Customers active in the last 7 days who spent exactly 500"
JSON Output:
[
{ "field": "lastActiveDate", "operator": "<=", "value": "7" },
{ "field": "totalSpend", "operator": "=", "value": "500" }
]
Example 4 (Vague query):
User Query: "My best customers"
JSON Output:
[]
Example 5 (Query doesn't map well):
User Query: "Customers who like blue shirts"
JSON Output:
[]
Now, convert the following user query into ONLY the JSON rule array format. Do not add any other text.
User Query: "${userQuery}"
JSON Output:
`;
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const userQuery = body.query;

    if (!userQuery || typeof userQuery !== 'string' || userQuery.trim() === '') {
      return NextResponse.json({ message: "Query is required." }, { status: 400 });
    }

    const prompt = constructPromptForNLRules(userQuery);
    console.log("Sending prompt to Gemini for NL to Rules:", prompt);

    const geminiResponseText = await generateText(prompt);
    console.log("Raw Gemini Response for NL to Rules:", geminiResponseText);

    let parsedRules = [];
    try {
      const jsonMatch = geminiResponseText.match(/```json\s*([\s\S]*?)\s*```|(\[[\s\S]*\])/);
      let jsonString = "";

      if (jsonMatch) {
        jsonString = jsonMatch[1] || jsonMatch[2];
      } else {
        jsonString = geminiResponseText;
      }
      
      parsedRules = JSON.parse(jsonString.trim());

      if (!Array.isArray(parsedRules) || !parsedRules.every(
          rule => typeof rule.field === 'string' &&
                  typeof rule.operator === 'string' &&
                  rule.value !== undefined
        )) {
          console.warn("Gemini response parsed but not a valid rule array structure:", parsedRules);
      }

    } catch (parseError) {
      console.error("Failed to parse Gemini response as JSON:", parseError);
      console.error("Gemini raw text was:", geminiResponseText);
      return NextResponse.json({ 
        message: "AI generated an invalid response format. Please try rephrasing your query.",
        rules: [], 
        debug_ai_response: geminiResponseText 
      }, { status: 500 }); 
    }

    return NextResponse.json({ rules: parsedRules }, { status: 200 });

  } catch (error) {
    console.error("Error in /api/ai/nl-to-rules:", error);
    return NextResponse.json({ message: error.message || "Failed to process natural language query." }, { status: 500 });
  }
}
