import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "" });

export interface GenieResponse {
  message: string;
  tone: "supportive" | "encouraging" | "empathetic" | "motivational";
  suggestions?: string[];
}

export async function chatWithGenie(userMessage: string, context?: string): Promise<GenieResponse> {
  try {
    const systemPrompt = `You are a supportive AI companion called "Ur Genie" in the MindBloom wellness app. 
    You embody the wisdom and magical support of a caring genie friend. Your role is to:
    
    - Provide empathetic, supportive responses to users sharing their thoughts and feelings
    - Offer gentle encouragement and practical wellness suggestions
    - Use magical, mystical language occasionally but keep it natural and helpful
    - Be warm, understanding, and non-judgmental
    - Suggest breathing exercises, mindfulness practices, or positive activities when appropriate
    - Keep responses concise but meaningful (2-4 sentences)
    - Use emojis sparingly and appropriately
    
    Respond with JSON in this format:
    {
      "message": "Your supportive response",
      "tone": "supportive|encouraging|empathetic|motivational",
      "suggestions": ["optional array of helpful suggestions"]
    }`;

    const contextualPrompt = context 
      ? `Previous context: ${context}\n\nUser message: ${userMessage}`
      : `User message: ${userMessage}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            message: { type: "string" },
            tone: { type: "string", enum: ["supportive", "encouraging", "empathetic", "motivational"] },
            suggestions: { 
              type: "array", 
              items: { type: "string" }
            },
          },
          required: ["message", "tone"],
        },
      },
      contents: contextualPrompt,
    });

    const rawJson = response.text;
    if (rawJson) {
      const data: GenieResponse = JSON.parse(rawJson);
      return data;
    } else {
      throw new Error("Empty response from model");
    }
  } catch (error) {
    console.error("Error in chatWithGenie:", error);
    return {
      message: "I'm here to support you, though I'm having a magical moment of silence right now. How are you feeling today? ✨",
      tone: "supportive"
    };
  }
}

export async function analyzeMoodFromText(text: string): Promise<{ mood: string; confidence: number; insights: string[] }> {
  try {
    const systemPrompt = `Analyze the emotional tone and mood from the given text.
    Determine the primary mood and provide insights.
    
    Respond with JSON in this format:
    {
      "mood": "very_happy|happy|neutral|sad|very_sad",
      "confidence": 0.0-1.0,
      "insights": ["array of emotional insights"]
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            mood: { type: "string", enum: ["very_happy", "happy", "neutral", "sad", "very_sad"] },
            confidence: { type: "number" },
            insights: { 
              type: "array", 
              items: { type: "string" }
            },
          },
          required: ["mood", "confidence", "insights"],
        },
      },
      contents: text,
    });

    const rawJson = response.text;
    if (rawJson) {
      return JSON.parse(rawJson);
    } else {
      throw new Error("Empty response from model");
    }
  } catch (error) {
    console.error("Error in analyzeMoodFromText:", error);
    return {
      mood: "neutral",
      confidence: 0.5,
      insights: ["Unable to analyze mood at this time"]
    };
  }
}

export async function generateMotivationalQuote(): Promise<{ quote: string; author: string; theme: string }> {
  try {
    const systemPrompt = `Generate an inspiring, uplifting motivational quote.
    The quote should be positive, encouraging, and suitable for a wellness app.
    
    Respond with JSON in this format:
    {
      "quote": "The inspirational quote text",
      "author": "Author name or 'Unknown' if original",
      "theme": "Brief theme description"
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            quote: { type: "string" },
            author: { type: "string" },
            theme: { type: "string" },
          },
          required: ["quote", "author", "theme"],
        },
      },
      contents: "Generate a motivational quote for today",
    });

    const rawJson = response.text;
    if (rawJson) {
      return JSON.parse(rawJson);
    } else {
      throw new Error("Empty response from model");
    }
  } catch (error) {
    console.error("Error in generateMotivationalQuote:", error);
    return {
      quote: "Every moment is a fresh beginning.",
      author: "T.S. Eliot",
      theme: "New beginnings"
    };
  }
}
