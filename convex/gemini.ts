import { action } from "./_generated/server";
import { v } from "convex/values";

/**
 * Server-side Claude Sonnet 4.5 API integration
 * This keeps the API key secure on the server
 */

interface ClaudeMessageContent {
  type: "text" | "image";
  text?: string;
  source?: {
    type: "base64";
    media_type: string;
    data: string;
  };
}

interface ClaudeRequest {
  model: string;
  max_tokens: number;
  messages: Array<{
    role: "user";
    content: Array<ClaudeMessageContent>;
  }>;
}

interface ClaudeResponse {
  content: Array<{
    type: "text";
    text: string;
  }>;
}

/**
 * Call Claude API with text prompt
 */
export const generateText = action({
  args: {
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey) {
      throw new Error("CLAUDE_API_KEY ei ole määritelty Convex-ympäristössä. Aseta se Convex Dashboardissa.");
    }

    const apiUrl = "https://api.anthropic.com/v1/messages";
    
    const requestBody: ClaudeRequest = {
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: args.prompt }
          ]
        }
      ]
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Claude API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data: ClaudeResponse = await response.json();
    
    if (data.content?.[0]?.text) {
      return {
        text: data.content[0].text,
        fullResponse: data,
      };
    }

    throw new Error("Claude API ei palauttanut tekstiä");
  },
});

/**
 * Call Claude API with images and text prompt
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
    const apiKey = process.env.CLAUDE_API_KEY;
    if (!apiKey) {
      throw new Error("CLAUDE_API_KEY ei ole määritelty Convex-ympäristössä. Aseta se Convex Dashboardissa.");
    }

    // Claude supports multiple images per request
    const imagesToUse = args.images.slice(0, 3);

    const apiUrl = "https://api.anthropic.com/v1/messages";
    
    const content: Array<ClaudeMessageContent> = [
      { type: "text", text: args.prompt },
      ...imagesToUse.map(img => ({
        type: "image" as const,
        source: {
          type: "base64" as const,
          media_type: img.mimeType,
          data: img.base64Data,
        }
      }))
    ];

    const requestBody: ClaudeRequest = {
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: content
        }
      ]
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Claude API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data: ClaudeResponse = await response.json();
    
    if (data.content?.[0]?.text) {
      return {
        text: data.content[0].text,
        fullResponse: data,
      };
    }

    throw new Error("Claude API ei palauttanut tekstiä");
  },
});
