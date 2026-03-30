import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const client = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const identifyMaterial = async (imageBase64) => {
  if (!client) {
    throw new Error("Gemini API Key is missing. Please add it to your .env file.");
  }

  try {
    const prompt = `
      Identify the primary material of the item in this image for recycling purposes.
      Return ONLY a JSON object with the following keys:
      - "type": (One of: Plastic, Paper, Metal, Glass, E-Waste, Organic, or Other)
      - "confidence": (Number between 0 and 1)
      - "recyclable": (Boolean)
      - "short_description": (Max 5 words)
      - "estimated_weight_kg": (Number, estimate the weight of the visible item in kg, e.g., 0.5)
      
      Do not include any Markdown formatting or extra text.
    `;

    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                data: imageBase64.split(",")[1],
                mimeType: "image/jpeg",
              },
            },
          ],
        },
      ],
    });

    const text = response.text;
    
    // Clean potential markdown or extra whitespace
    const cleanedText = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    
    // Check for quota error or other issues
    if (error.message?.includes("429") || error.status === 429) {
      throw new Error("AI Quota Exceeded. Please try again in a minute.");
    }
    
    throw new Error("Failed to analyze image. Please try manual entry.");
  }
};
