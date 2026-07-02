import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const generateText = async (req: Request, res: Response) => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ message: "Prompt is required" });

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(`Generate a creative, short, and catchy text block suitable for a Canva-style design based on this topic: ${prompt}. Do not include markdown formatting or quotation marks in the output. Keep it under 20 words.`);
    const text = result.response.text();
    
    res.status(200).json({ text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error generating text" });
  }
};

export const generatePalette = async (req: Request, res: Response) => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const { context } = req.body; // e.g., "A modern tech startup"

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(`Generate a highly aesthetic color palette of exactly 4 colors based on this theme: ${context || 'creative dynamic vibe'}. Return ONLY a raw JSON array of 4 valid hex codes (e.g. ["#FFFFFF", "#000000", "#FF0000", "#00FF00"]). Do not return markdown blocks like \`\`\`json.`);
    
    const text = result.response.text().trim();
    const palette = JSON.parse(text);
    
    res.status(200).json({ palette });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error generating palette" });
  }
};

export const generateTemplate = async (req: Request, res: Response) => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const { templateType } = req.body; // e.g., "Resume", "Logo", "Poster"
    if (!templateType) return res.status(400).json({ message: "Template type is required" });

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const systemPrompt = `
      You are an expert graphic designer building layout JSON arrays for a Canva clone.
      Generate a clean layout for a ${templateType}.
      Return ONLY a raw JSON array representing objects. Do NOT use markdown code blocks.
      Each object must match this exact schema:
      {
        "type": "text" | "rect" | "circle",
        "left": number (between 0 and 500),
        "top": number (between 0 and 500),
        "width"?: number,
        "height"?: number,
        "radius"?: number,
        "fill": string (Hex code),
        "text"?: string (If type is text, provide the content),
        "fontSize"?: number,
        "fontWeight"?: string ("normal" or "bold")
      }
      Provide exactly 4-6 objects that form a cohesive design.
    `;

    const result = await model.generateContent(systemPrompt);
    const text = result.response.text().trim();
    const objects = JSON.parse(text);
    
    res.status(200).json({ objects });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error generating template structure" });
  }
};
