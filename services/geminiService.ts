import { GoogleGenAI, Type } from "@google/genai";
import { QuizData } from "../types";

// Helper to get a client instance with the most current API key
function getAiClient() {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
}

/**
 * Streams the explanation for the given topic.
 */
export async function streamExplanation(
  topic: string,
  onChunk: (text: string) => void
): Promise<void> {
  const ai = getAiClient();
  const model = "gemini-2.5-flash";
  const prompt = `
  Please provide a comprehensive and structured explanation of the topic: "${topic}".
  Requirements:
  1. Ensure a clear structure, covering definition, principles, application scenarios, and other relevant aspects.
  2. Use Markdown formatting for readability (e.g., bold, lists, headings), but do not wrap the entire output in a code block.
  3. Keep the length moderate, suitable for comfortable web reading.
  4. The content is suitable for students.
  `;

  try {
    const responseStream = await ai.models.generateContentStream({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: "You are an expert educator. Your goal is to explain complex topics clearly and engagingly."
    }
    });

    for await (const chunk of responseStream) {
      if (chunk.text) {
        onChunk(chunk.text);
      }
    }
  } catch (error) {
    console.error("Error streaming explanation:", error);
    throw error;
  }
}

/**
 * Generates an illustrative image (storyboard) for the topic.
 */
export async function generateIllustration(topic: string): Promise<string> {
  const ai = getAiClient();
  const model = "gemini-3-pro-image-preview";
  // Creating a vivid prompt for a storyboard style image
  const prompt = `
    Draw a dynamic storyboard illustration (comic style/line art style) composed of 3 to 4 panels.
    
    Subject: Real-life examples of the concept "${topic}".
    
    Style Details:
    - Clean lines, vibrant but educational colors.
    - Split the image into 3 or 4 distinct sections (panels) showing different scenarios where "${topic}" applies in daily life.
    - Add small visual cues or icons to emphasize the concept.
    - High quality, detailed.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        imageConfig: {
          aspectRatio: "16:9", 
          imageSize: "1K" 
        }
      }
    });

    // Extract the image from the parts
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData && part.inlineData.data) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Error generating illustration:", error);
    throw error;
  }
}

/**
 * Generates a concept diagram for the topic.
 */
export async function generateDiagram(topic: string): Promise<string> {
  const ai = getAiClient();
  const model = "gemini-3-pro-image-preview";
  
  const prompt = `
    Draw an illustration to explain **"${topic}"**, including necessary formulas and graphical representations.
    
    Requirements:
    - Background: White (pure white background).
    - Format: 16:9 landscape.
    - Style: Clean, educational diagram/infographic style.
    - Text: If any text appears in the image, it MUST be in Simplified Chinese (中文).
    - Content: Visual representation of formulas, relationships, or structural diagrams explaining the concept clearly.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        imageConfig: {
          aspectRatio: "16:9", 
          imageSize: "1K" 
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData && part.inlineData.data) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Error generating diagram:", error);
    throw error;
  }
}

/**
 * Generates a quiz for the topic in JSON format.
 */
export async function generateQuiz(topic: string): Promise<QuizData> {
  const ai = getAiClient();
  const model = "gemini-2.5-flash";
  const prompt = `Generate a quiz about "${topic}". Include 5 to 10 questions. Ensure all text (questions, options, explanations) is in Simplified Chinese (简体中文).`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "Title of the quiz" },
            questions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.INTEGER },
                  question: { type: Type.STRING },
                  options: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "Array of 4 possible answers"
                  },
                  correctAnswerIndex: { 
                    type: Type.INTEGER, 
                    description: "Index of the correct answer (0-3)" 
                  },
                  explanation: { type: Type.STRING, description: "Why this answer is correct" }
                },
                required: ["id", "question", "options", "correctAnswerIndex", "explanation"]
              }
            }
          },
          required: ["title", "questions"]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("Empty response for quiz");
    
    return JSON.parse(jsonText) as QuizData;
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw error;
  }
}