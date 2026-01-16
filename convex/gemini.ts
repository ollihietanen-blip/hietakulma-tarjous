import { action } from "./_generated/server";
import { v } from "convex/values";

/**
 * Server-side Gemini 3.0 Pro API integration
 * This keeps the API key secure on the server
 */

interface GeminiPart {
  text?: string;
  inline_data?: {
    mime_type: string;
    data: string;
  };
}

interface GeminiRequest {
  contents: Array<{
    parts: Array<GeminiPart>;
  }>;
}

interface GeminiResponse {
  candidates?: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

/**
 * Call Gemini 3.0 Pro API with text prompt
 */
export const generateText = action({
  args: {
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY ei ole määritelty Convex-ympäristössä. Aseta se Convex Dashboardissa.");
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.0-pro:generateContent?key=${apiKey}`;
    
    const requestBody: GeminiRequest = {
      contents: [
        {
          parts: [
            { text: args.prompt }
          ]
        }
      ]
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.text().catch(() => '');
      throw new Error(`Gemini API error: ${response.status} - ${errorData}`);
    }

    const data: GeminiResponse = await response.json();
    
    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return {
        text: data.candidates[0].content.parts[0].text,
        fullResponse: data,
      };
    }

    throw new Error("Gemini API ei palauttanut tekstiä");
  },
});

/**
 * Call Gemini 3.0 Pro API with images and text prompt
 */
export const generateWithImages = action({
  args: {
    prompt: v.string(),
    images: v.array(v.object({
      mimeType: v.string(),
      base64Data: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY ei ole määritelty Convex-ympäristössä. Aseta se Convex Dashboardissa.");
    }

    // Gemini 3.0 Pro supports multiple images per request (up to 16)
    // Supported formats: PNG, JPG, GIF, WebP, HEIC, HEIF
    const imagesToUse = args.images.slice(0, 16);

    // Validate MIME types are supported
    const supportedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif'];
    for (const img of imagesToUse) {
      if (!supportedTypes.includes(img.mimeType)) {
        throw new Error(`Gemini API ei tue media-tyyppiä: ${img.mimeType}. Tuetut tyypit: ${supportedTypes.join(', ')}`);
      }
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.0-pro:generateContent?key=${apiKey}`;
    
    const parts: Array<GeminiPart> = [
      { text: args.prompt },
      ...imagesToUse.map(img => ({
        inline_data: {
          mime_type: img.mimeType,
          data: img.base64Data,
        }
      }))
    ];

    const requestBody: GeminiRequest = {
      contents: [
        {
          parts: parts
        }
      ]
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.text().catch(() => '');
      throw new Error(`Gemini API error: ${response.status} - ${errorData}`);
    }

    const data: GeminiResponse = await response.json();
    
    if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
      return {
        text: data.candidates[0].content.parts[0].text,
        fullResponse: data,
      };
    }

    throw new Error("Gemini API ei palauttanut tekstiä");
  },
});
