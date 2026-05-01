import { NextResponse } from "next/server";
import OpenAI from "openai";
import type { ResonanceWeights } from "@/lib/types/story";

import { requireAuthenticatedUser } from "@/lib/supabase/require-auth";

// Initialize OpenAI client
// Note: NEXT_PUBLIC_SUPABASE_URL and ANON_KEY already exist in the environment,
// but for OpenAI we just need OPENAI_API_KEY mapped in the .env file.
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "mock-api-key-if-missing",
});

const SYSTEM_PROMPT = `
You are a profound, avant-garde psychological thriller narrative engine.
Your task is to analyze an incoming transcript and generate a structured JSON array of "StoryBeat" items mapping strictly to this schema:

{
  "beats": [
    {
      "text": "The exact sentence or phrase spoken.",
      "speaker": "Voice" | "Protagonist" | "Narrator",
      "resonanceWeights": {
        "neutral": 0.0 to 1.0,
        "depression": 0.0 to 1.0,
        "panic": 0.0 to 1.0,
        "isolation": 0.0 to 1.0,
        "obsession": 0.0 to 1.0,
        "tenderness": 0.0 to 1.0
      },
      "musicCueTrigger": "short-slug-for-audio-pulse",
      "imagePrompt": "Cinematic visual description, 8k, photorealistic...",
      "audioPrompt": "Binaural ambience, drone, muffled footsteps..."
    }
  ]
}

Instructions:
1. Split the user's transcript into logical, suspenseful sentences. Often 1 sentence per beat.
2. For each sentence, deeply analyze the precise emotional tone across the 6 axes (neutral, depression, panic, isolation, obsession, tenderness). The sum of these 6 numbers does not technically need to be exactly 1.0, but try to keep them balanced between 0.0 and 1.0. Emphasize axes logically!
3. Craft a stunning 'imagePrompt' reflecting profound psychological horror or liminal space composition matching the emotion.
4. Craft an 'audioPrompt' reflecting binaural, dark, and tense auditory environments.
5. Provide a 'musicCueTrigger' slug (max 48 chars).
6. Return purely the valid JSON.
`;

export async function POST(req: Request) {
    try {
        const auth = await requireAuthenticatedUser();
        if ("response" in auth) {
            return auth.response;
        }

        const { transcript } = await req.json();

        if (!transcript) {
            return NextResponse.json({ error: "Відсутній транскрипт" }, { status: 400 });
        }

        if (!process.env.OPENAI_API_KEY) {
            console.warn("OPENAI_API_KEY is missing, falling back to an error or mock mode. Add it to .env.local!");
        }

        // Force call against the API
        const response = await openai.chat.completions.create({
            model: "gpt-5-nano",
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: `Transcript to process: ${transcript}` }
            ],
            response_format: { type: "json_object" },
        });

        const body = response.choices[0].message.content;

        if (!body) {
            throw new Error("OpenAI не повернув жодного контенту");
        }

        const data = JSON.parse(body);

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("OpenAI Generation Error:", error);
        return NextResponse.json(
            { error: "Генерація не вдалася", details: error.message },
            { status: 500 }
        );
    }
}
