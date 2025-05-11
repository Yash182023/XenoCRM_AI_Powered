// src/lib/gemini.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not set in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey);

// Specify the model - 'gemini-pro' is good for text generation tasks
// For vision tasks (like image suggestions if you go for the bonus), you might use 'gemini-pro-vision'
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro-exp-03-25" });

export async function generateText(prompt) {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error("Error generating text with Gemini:", error);
    throw new Error("Failed to generate text using Gemini API.");
  }
}

// You can add more specific functions here for different AI tasks