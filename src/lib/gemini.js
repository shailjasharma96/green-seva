import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export const identifyMaterial = async (imageBase64) => {
  if (!genAI) {
    throw new Error("Gemini API Key is missing. Please add it to your .env file.");
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
      Identify the primary material of the item in this image for recycling purposes.
      Return ONLY a JSON object with the following keys:
      - "type": (One of: Plastic, Paper, Metal, Glass, E-Waste, Organic, or Other)
      - "confidence": (Number between 0 and 1)
      - "recyclable": (Boolean)
      - "short_description": (Max 5 words)
      
      Do not include any Markdown formatting or extra text.
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBase64.split(",")[1],
          mimeType: "image/jpeg",
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();
    
    // Clean potential markdown or extra whitespace
    const cleanedText = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze image. Please try manual entry.");
  }
};
