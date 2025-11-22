import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Validate API Key
if (!process.env.GEMINI_API_KEY) {
  console.error("⚠️ GEMINI_API_KEY is not set in environment variables!");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

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

    // Use the user-requested model
    // "đổi model sang models/gemini-flash-latest" (Using gemini-1.5-flash as the standard latest flash model)
    // We will use a single model for the "Agent" workflow to maintain context
    const model = genAI.getGenerativeModel({ 
      model: "models/gemini-flash-latest",
      generationConfig: {
        temperature: 1.0, 
      }
    });

    // We will also keep the image model for the specific image generation task
    // using the model from the docs provided
    const imageModel = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash-image", 
      generationConfig: {
        // Enforce a vertical rectangular aspect ratio for better Bento fit
        // Supported: "1:1", "3:4", "4:5", "16:9", etc.
        // User requested "21:9", so we use "16:9" as the closest API standard and prompt for cinematic width.
        // @ts-expect-error - imageConfig type definition might be missing in current SDK version but valid in API
        imageConfig: {
          aspectRatio: "16:9", 
        },
        responseModalities: ["IMAGE"], // We only need the image
      }
    });

    console.log("🚀 Starting Agentic Workflow...");

    // Step 1: Image Enhancement (Parallel)
    // We start this immediately as it takes time
    const imagePromise = imageModel.generateContent([
      `Using the provided portrait photo, generate a new high-end professional headshot in a Cinematic 21:9 Ultrawide aspect ratio.
      
      CRITICAL FRAMING INSTRUCTIONS:
      - **ZOOM OUT** significantly to fill the wide 21:9 frame.
      - Center the subject horizontally, but allow the environment/background to expand on the sides.
      - Do NOT cut off the top of the head.
      
      STYLIZATION INSTRUCTIONS (Make it look AI-processed):
      - Transform the lighting to "Cinematic Studio Lighting" with a subtle rim light to separate subject from background.
      - Change the background to a "Modern Abstract Tech Gradient" (Dark Grey/Blue tones).
      - Enhance image clarity and texture (Upscale feeling).
      - **KEEP FACIAL IDENTITY 100% PRESERVED.** Only upgrade the style, lighting, and framing.`,
      {
        inlineData: {
          data: imageBase64,
          mimeType: imageMimeType,
        },
      },
    ]);

    // Step 2: Agent Thinking & Content Generation
    // We create a stream to send "thoughts" and then the final JSON
    const textPrompt = `
    Role: You are an elite Senior UI/UX Designer & Content Strategist powered by Gemini 3.
    Task: Create a world-class, highly detailed personal portfolio based on the user's raw input: "${text}".
    
    **LANGUAGE RULE: ENGLISH ONLY**
    - **CRITICAL:** All generated content (Name, Title, Bio, Skills, Custom Nodes) MUST be in **English**.
    - If the input is in another language (e.g., Vietnamese), **TRANSLATE** it to professional, high-impact English.
    - Maintain the original meaning but improve the tone for a global professional audience.

    **DESIGN PHILOSOPHY: "BENTO GRIDS & GLASSMORPHISM"**
    - Create a visually stunning, modern layout.
    - Use **Tailwind CSS** for all styling.
    - **Aesthetics:** Dark mode preferred, high contrast, subtle borders, gradients.
    - **Typography:** Clean sans-serif (Inter/Geist), tight tracking for headings.
    - **Layout:** Variable grid sizes. Mix small (1x1), medium (2x1), and large (2x2, 4x2) cards.

    **CORE INSTRUCTION: FREESTYLE HTML NODES**
    - You are NOT limited to standard fields.
    - You MUST generate **Custom HTML Nodes** to visualize the user's specific data.
    - The "content" of a node is raw HTML. You control the padding, background, and internal layout.
    - **DO NOT** rely on the frontend's default padding. Use \`h-full w-full\` in your root div and define your own structure.
    
    **DESIGN SYSTEM CHEATSHEET & RULES:**
    
    **1. APP THEME COMPATIBILITY:**
    - **Base Colors:** Use **Zinc/Slate** (\`bg-zinc-900\`, \`text-zinc-400\`) for dark elements to match the app's premium feel. Avoid pure black (#000).
    - **Primary Accent:** Use the generated \`colorTheme\` hex as your primary brand color.
    - **Glassmorphism:** Heavy use of \`bg-white/5 backdrop-blur-md border border-white/10\` is encouraged to blend with any background.
    - **Typography:** ALWAYS use \`font-sans\`. Headings should be \`tracking-tight font-bold\`. Body text \`text-sm leading-relaxed\`.

    **2. THE "IMPRESSIVE GRADIENT" RULE:**
    - You MUST use stunning, high-quality gradients for key cards (Hero, Stats, Spotlight).
    - **Do not use plain colors.** Use these specific combinations:
      - *Hyper:* \`bg-gradient-to-br from-fuchsia-600 to-purple-600\`
      - *Ocean:* \`bg-gradient-to-tr from-blue-600 to-cyan-500\`
      - *Sunset:* \`bg-gradient-to-bl from-orange-500 to-rose-500\`
      - *Midnight:* \`bg-gradient-to-b from-slate-900 to-slate-800 border border-slate-700\`
      - *Glass:* \`bg-white/5 backdrop-blur-xl border border-white/10\`
    
    **3. CSS SAFETY & ROBUSTNESS:**
    - **Root Element:** EVERY custom node's root 'div' MUST have: \`h-full w-full flex flex-col relative overflow-hidden rounded-3xl\`.
    - **Overflow:** Always add \`overflow-hidden\` to containers to prevent scrollbars.
    - **Text Safety:** Use \`truncate\` or \`line-clamp-2\` for headings that might be too long. Use \`break-words\` for long bios.
    - **Flex Safety:** Use \`min-h-0\` and \`min-w-0\` on flex children to prevent blowouts.
    - **Contrast:** If using a dark/gradient background, FORCE text to white (\`text-white\`). Do not assume inherited colors.
    - **Spacing:** Use internal padding (\`p-6\` or \`p-8\`) within your root div.

    **REQUIRED CUSTOM NODES (Creative & Complex):**
    1.  **"Hero Hologram"**: A 2x2 or 4x2 card. Use a dark gradient background. Overlay a massive, semi-transparent typography of the user's role (e.g., "FOUNDER") cropped off-screen. Place the Name and Title on top.
    2.  **"Metric Grid"**: A 2x1 card. Split into a grid of 2-3 key metrics. Use a *Glass* background with a subtle glow.
    3.  **"Stack Orbit"**: A visual representation of skills not just as tags, but as a "constellation" or "orbit" layout using absolute positioning (simulated) or a clean flex/grid map.
    4.  **"Award Trophy"**: A card dedicated to a single major achievement, using a gold/yellow radial gradient accent.

    **Process:**
    1.  **ANALYZE**: Identify the Persona. What is the most impressive thing about them?
    2.  **STRATEGIZE**: Plan a grid. What deserves a 2x2 spotlight?
    3.  **GENERATE**:
        - Extract **Name**, **Title**, **Bio** (Detailed), **Skills**, **Socials**.
        - Generate **ColorTheme** (Hex).
        - Create **CustomNodes**: An array of HTML-based cards.
          - "colSpan": 1 to 4.
          - "rowSpan": 1 or 2.
          - "content": The HTML string. **IMPORTANT:** The root element should usually have \`h-full w-full p-6 flex flex-col...\`.

    Output Format:
    First, output your "THOUGHTS" block.
    Then, output the final "JSON" block.
    
    JSON Structure:
    {
      "name": "...",
      "title": "...",
      "bio": "...",
      "skills": [...],
      "socials": [...],
      "colorTheme": "#...",
      "customNodes": [
        {
          "colSpan": 2,
          "rowSpan": 2,
          "type": "html",
          "content": "<div class='h-full w-full bg-neutral-900 p-8 rounded-3xl flex flex-col justify-between relative overflow-hidden'><div class='absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full'></div><h3 class='text-neutral-400 uppercase tracking-widest text-xs font-bold'>Key Achievement</h3><p class='text-3xl font-bold text-white mt-2'>Founded SpaceX</p><p class='text-neutral-400 mt-4'>Revolutionized space technology...</p></div>"
        }
      ]
    }
    `;

    const result = await model.generateContentStream(textPrompt);

    // Create a readable stream for the client
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        try {
          // Stream text generation (Thoughts + Partial JSON)
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            controller.enqueue(encoder.encode(JSON.stringify({ type: 'chunk', content: chunkText }) + "\n"));
          }

          // Wait for image generation
          let processedImage = `data:${imageMimeType};base64,${imageBase64}`;
          try {
            const imageResult = await imagePromise;
            const candidate = imageResult.response.candidates?.[0];
            if (candidate?.content?.parts?.[0]?.inlineData) {
               const imgPart = candidate.content.parts[0].inlineData;
               processedImage = `data:${imgPart.mimeType || 'image/png'};base64,${imgPart.data}`;
            }
          } catch (e) {
            console.error("Image generation failed", e);
          }

          // Send final image event
          controller.enqueue(encoder.encode(JSON.stringify({ type: 'image', content: processedImage }) + "\n"));

          // Close stream
          controller.close();
        } catch (error) {
          console.error("Streaming error", error);
          controller.error(error);
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Transfer-Encoding': 'chunked',
      },
    });

  } catch (error: unknown) {
    console.error("❌ Error generating portfolio:", error);
    
    // Better error messages
    let errorMessage = "Failed to generate portfolio";
    const err = error as Error;

    if (err?.message?.includes("API key")) {
      errorMessage = "Invalid API key. Please check your GEMINI_API_KEY in .env.local";
    } else if (err?.message?.includes("quota")) {
      errorMessage = "API quota exceeded. Please check your Gemini API usage.";
    } else if (err?.message) {
      errorMessage = err.message;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
