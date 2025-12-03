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
    你是一位资深的教育专家。请为学生详细讲解知识点：“${topic}”。
    
    要求：
    1. 语言通俗易懂，深入浅出。
    2. 结构清晰，包含定义、原理、应用场景等。
    3. 使用 Markdown 格式进行排版（使用粗体、列表等），但不要使用代码块包裹整个输出。
    4. 篇幅适中，适合网页阅读。
  `;

  try {
    const responseStream = await ai.models.generateContentStream({
      model: model,
      contents: prompt,
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
 * Generates an illustrative image for the topic.
 */
export async function generateIllustration(topic: string): Promise<string> {
  const ai = getAiClient();
  // const model = "gemini-3-pro-image-preview";
  const model = "gemini-2.5-flash-image";
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
    console.error("Error generating image:", error);
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