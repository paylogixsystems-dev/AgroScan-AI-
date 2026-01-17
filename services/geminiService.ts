
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY});

export const analyzeDroneImage = async (base64Image: string) => {
  const model = "gemini-3-flash-preview";
  
  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image
          }
        },
        {
          text: `Identify the plant or tree types in this drone/aerial agricultural image. 
          Provide the results in both English and Tamil. 
          The health status should be one of: Healthy, Stressed, Diseased.`
        }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          plantType: { type: Type.STRING, description: "Common name in English" },
          plantTypeTamil: { type: Type.STRING, description: "Common name in Tamil (தமிழ்)" },
          healthStatus: { type: Type.STRING, description: "Status: Healthy, Stressed, or Diseased" },
          confidenceScore: { type: Type.NUMBER, description: "Numerical confidence 0 to 100" },
          description: { type: Type.STRING, description: "Visual summary in English" },
          descriptionTamil: { type: Type.STRING, description: "Visual summary in Tamil (தமிழ்)" },
          recommendations: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Actionable steps in English"
          },
          recommendationsTamil: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Actionable steps in Tamil (தமிழ்)"
          }
        },
        required: ["plantType", "plantTypeTamil", "healthStatus", "confidenceScore", "description", "descriptionTamil", "recommendations", "recommendationsTamil"]
      }
    }
  });

  const jsonStr = response.text?.trim() || "{}";
  return JSON.parse(jsonStr);
};
