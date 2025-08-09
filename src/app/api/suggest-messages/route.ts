import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export async function POST(req: Request) {
  try {
    const prompt = "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be seperated by '||'. These questions are for an anonymous social messaging plarform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What's a hobby you've recently started?||If you could have dinner with any historical figure, who would it be?||What's a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment."

    if (!prompt) {
      console.log("Prompt is required");
      return Response.json({success: false, message: "Prompt is required"}, {status: 400})
    }
    const response = await generateText({
      model: google('gemini-2.5-flash'),
      prompt,
    });

    const text = response?.text

    if (!text) {
      throw new Error("Failed to generate text")   
    }

    return Response.json({success: true, message: "Text generated successfully", text }, {status: 200})
  } catch (error) {
    console.log("Error generating text :: ", error);
    return Response.json({success: false, message: "Failed to generate text"}, {status: 500})
  }
}