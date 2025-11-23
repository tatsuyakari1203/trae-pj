import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, FunctionCallingConfigMode } from "@google/genai";

// Validate API Key
if (!process.env.GEMINI_API_KEY) {
  console.error("⚠️ GEMINI_API_KEY is not set in environment variables!");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Define the Function Schema for Portfolio Generation
const generatePortfolioTool = {
  name: "generate_portfolio",
  description: "Generates the final portfolio data structure with layout and content.",
  parametersJsonSchema: {
    type: "object",
    properties: {
      name: { type: "string", description: "The user's full name" },
      title: { type: "string", description: "Professional title (e.g., Senior Designer)" },
      bio: { type: "string", description: "A compelling professional biography" },
      skills: {
        type: "array",
        items: { type: "string" },
        description: "List of key skills"
      },
      socials: {
        type: "array",
        items: {
          type: "object",
          properties: {
            platform: { type: "string" },
            url: { type: "string" }
          },
          required: ["platform", "url"]
        }
      },
      stats: {
        type: "array",
        items: {
          type: "object",
          properties: {
            label: { type: "string" },
            value: { type: "string" }
          },
          required: ["label", "value"]
        }
      },
      colorTheme: { type: "string", description: "Hex color code for the theme" },
      customNodes: {
        type: "array",
        description: "Grid items for the bento layout",
        items: {
          type: "object",
          properties: {
            colSpan: { type: "number" },
            rowSpan: { type: "number" },
            type: {
              type: "string",
              enum: ["html", "text", "stat", "react-component"]
            },
            content: { type: "string", description: "Content for html/text nodes" },
            component: { type: "string", description: "Name of the React component" },
            props: {
              type: "object",
              description: "Props for the React component (as a JSON object)",
              properties: {}, // Allow arbitrary properties
            },
            children: { type: "string", description: "Children text for the component" }
          },
          required: ["colSpan", "rowSpan", "type"]
        }
      }
    },
    required: ["name", "title", "bio", "skills", "colorTheme", "customNodes"]
  }
};

export async function POST(request: NextRequest) {
  try {
    // Check API Key first
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured. Please add it to .env.local file." },
        { status: 500 }
      );
    }

    const data = await request.json();
    const { image, text } = data;

    if (!image || !text) {
      return NextResponse.json(
        { error: "Missing image or text" },
        { status: 400 }
      );
    }

    // Extract base64 image data
    const imageParts = image.split(',');
    const imageBase64 = imageParts[1] || image;
    const imageMimeType = imageParts[0]?.includes('data:') ?
      imageParts[0].split(':')[1].split(';')[0] : 'image/jpeg';

    console.log("🚀 Starting Agentic Workflow with Function Calling (GenAI SDK)...");

    const textPrompt = `
    Role: You are an elite Senior UI/UX Designer & Content Strategist with a focus on Awwwards-winning portfolios.
    Task: Analyze the user's input and image to generate a highly detailed, content-rich, and visually stunning portfolio structure using the 'generate_portfolio' tool.

    **User Input:** "${text}"

    **Workflow (Strict Order):**
    1.  **Deep Analysis (Thinking Process)**:
        - Analyze the user's potential persona based on the input.
        - Determine the best color psychology and typography style.
        - Plan the layout structure (Bento Grid) to maximize engagement.
        - *Output this analysis as plain text BEFORE calling the function.*

    2.  **Content Generation**:
        - Write a compelling, professional bio (not generic).
        - List 6-8 relevant hard and soft skills.
        - Create 4-6 impressive stats (e.g., "Years Exp", "Projects", "Clients").
        - Define a sophisticated color theme.

    3.  **Layout Design (Bento Grid - Custom Nodes)**:
        - The system ALREADY generates the Main Hero (Image), Bio, Stats, and Skills sections. **DO NOT duplicate these.**
        - Use 'customNodes' to add **EXTRA** creative blocks that make the portfolio unique. Examples:
            - "Design Philosophy" or "My Approach"
            - "Favorite Tech Stack" (detailed)
            - "Recent Awards" or "Recognition"
            - "Client Testimonials"
            - "Call to Action" (e.g., "Let's work together")
        - **Component Usage Rules**:
            - Use 'GradientText' for catchy headlines (e.g., "Creative Vision").
            - Use 'ShinyText' for special highlights or CTAs.
            - Use 'DecryptedText' for technical keywords.
            - Use 'SplitText' for short, impactful statements.
            - **CRITICAL**: Put the main text to display in the 'content' field of the node object.
        - **Grid Rules**:
            - Use 'colSpan' 2 or 3 for text-heavy blocks to ensure readability.
            - Use 'rowSpan' 1 for headers/titles.

    4.  **Execution**:
        - Call the 'generate_portfolio' function with the fully populated data.

    **Constraints**:
    - **Language**: English Only.
    - **Style**: Dark mode, glassmorphism, high-end aesthetic.
    - **Image**: The main image source is the literal string "processedImage".
    `;

    const response = await ai.models.generateContentStream({
      model: "gemini-flash-latest",
      contents: [
        {
          role: 'user',
          parts: [
            { text: textPrompt },
            {
              inlineData: {
                mimeType: imageMimeType,
                data: imageBase64
              }
            }
          ]
        }
      ],
      config: {
        tools: [{ functionDeclarations: [generatePortfolioTool] }],
        toolConfig: {
          functionCallingConfig: {
            mode: FunctionCallingConfigMode.AUTO,
          }
        }
      }
    });

    // Create a ReadableStream to send updates to the client
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          for await (const chunk of response) {
            // 1. Handle Text (Thinking/Reasoning)
            const chunkText = chunk.text;
            if (chunkText) {
              controller.enqueue(encoder.encode(JSON.stringify({ type: 'chunk', content: chunkText }) + "\n"));
            }

            // 2. Handle Function Calls
            const functionCalls = chunk.functionCalls;
            if (functionCalls && functionCalls.length > 0) {
              for (const call of functionCalls) {
                if (call.name === "generate_portfolio") {
                  console.log("✅ Function Call Received: generate_portfolio");
                  const args = call.args;
                  // Send the structured data to the client
                  controller.enqueue(encoder.encode(JSON.stringify({ type: 'data', content: args }) + "\n"));
                }
              }
            }
          }

        } catch (error) {
          console.error("Stream error:", error);
          controller.enqueue(encoder.encode(JSON.stringify({ type: 'chunk', content: "\n❌ Error during generation." }) + "\n"));
        } finally {
          controller.close();
        }
      }
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: (error as Error).message },
      { status: 500 }
    );
  }
}
