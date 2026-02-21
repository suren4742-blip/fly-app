
import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getCreativeExplanation = async (prompt: string, history: ChatMessage[], audioData?: { data: string, mimeType: string }) => {
  try {
    const model = 'gemini-3-flash-preview';
    const config = {
      systemInstruction: `You are the Universal Creator Guru. 
      Your goal is to explain musical, video, textual, and visual creation concepts simply and engagingly. 
      Focus on:
      - Content Creation: Music, Video, Writing, and Photography/Graphic Design.
      - Technical Formats: From MP3 and MP4 to JPG, PNG, WebP, PDF, HTML, etc.
      - Visuals: Composition, transparency, resolution, and color theory.
      - Creativity: Theory, editing, formatting, and storytelling.
      - Practical Advice: Best apps for editing, how to convert files, and best formats for mobile.
      Use markdown for formatting. Keep responses concise but educational. 
      Always include a relevant emoji and a "Creative Pro Tip" at the end of every response.`,
    };

    let contents: any;

    if (audioData) {
      contents = {
        parts: [
          { inlineData: audioData },
          { text: prompt || "Please analyze this audio or respond to my voice message." }
        ]
      };
    } else {
      contents = prompt;
    }

    const response = await ai.models.generateContent({
      model,
      contents,
      config
    });

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, my creative archives are temporarily locked. Please try again in a moment! 🎶📹📝🖼️";
  }
};
