import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ExtractedReceiptData {
  storeName: string;
  amount: number;
  category: string;
  date: string;
}

export async function extractReceiptData(base64Image: string, mimeType: string): Promise<ExtractedReceiptData> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          {
            inlineData: {
              data: base64Image.split(',')[1] || base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: "Extract the following information from this receipt: store name, total amount, category (Food, Transport, Shopping, Health, Entertainment, or Other), and date. If you can't find a piece of information, make a best guess based on the context.",
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          storeName: { type: Type.STRING },
          amount: { type: Type.NUMBER },
          category: { type: Type.STRING },
          date: { type: Type.STRING },
        },
        required: ["storeName", "amount", "category", "date"],
      },
    },
  });

  try {
    const data = JSON.parse(response.text);
    return data as ExtractedReceiptData;
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("Failed to extract data from receipt");
  }
}
