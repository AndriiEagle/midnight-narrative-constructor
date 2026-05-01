import { NextResponse } from "next/server";
import OpenAI from "openai";

import { requireAuthenticatedUser } from "@/lib/supabase/require-auth";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "",
});

const CONVERSE_SYSTEM_PROMPT = `
You are the narrative consciousness of a psychological thriller visual novel called "Midnight Narrative Engine".
You are continuing the story in real-time based on a player's free-form text input.

CONTEXT:
- You will receive the current story beat (what the narrator/character just said) and the player's response.
- You must generate the NEXT narrative beat that reacts to the player's input while maintaining deep psychological tension.
- Stay in character. You are NOT a chatbot. You are a narrator weaving a dark, intimate story.
- The tone is: liminal, psychological horror, poetic suspense, emotional vulnerability.

OUTPUT FORMAT - return ONLY valid JSON:
{
  "text": "The next narrative sentence or paragraph (1-3 sentences max, poetic and tense).",
  "speaker": "Narrator" | "Voice" | "Protagonist",
  "resonanceWeights": {
    "neutral": 0.0-1.0,
    "depression": 0.0-1.0,
    "panic": 0.0-1.0,
    "isolation": 0.0-1.0,
    "obsession": 0.0-1.0,
    "tenderness": 0.0-1.0
  },
  "musicCueTrigger": "short-slug-max-48-chars",
  "imagePrompt": "Cinematic description of the visual scene, 8k, film grain, psychological...",
  "audioPrompt": "Ambient sound design description: drones, textures, spatial audio..."
}

RULES:
1. React meaningfully to what the player said. Don't ignore their input.
2. Escalate or shift the emotional tension based on their words.
3. Keep responses hauntingly beautiful - never generic.
4. Return ONLY the JSON object, no markdown, no commentary.
`;

export async function POST(req: Request) {
    try {
        const auth = await requireAuthenticatedUser();
        if ("response" in auth) {
            return auth.response;
        }

        const { currentBeatText, playerInput, history } = await req.json();
        const normalizedPlayerInput = typeof playerInput === "string" ? playerInput.trim() : "";

        if (!normalizedPlayerInput) {
            return NextResponse.json({ error: "Empty player input" }, { status: 400 });
        }

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                { error: "OPENAI_API_KEY is not configured" },
                { status: 500 }
            );
        }

        const messages: OpenAI.ChatCompletionMessageParam[] = [
            { role: "system", content: CONVERSE_SYSTEM_PROMPT },
        ];

        const recentHistory = (history || []).slice(-10);
        for (const entry of recentHistory) {
            messages.push({
                role: entry.role as "user" | "assistant",
                content: entry.content,
            });
        }

        messages.push({
            role: "user",
            content: `[CURRENT NARRATIVE BEAT]: "${currentBeatText}"\n\n[PLAYER'S RESPONSE]: "${normalizedPlayerInput}"`,
        });

        const response = await openai.chat.completions.create({
            model: "gpt-5-nano",
            messages,
            response_format: { type: "json_object" },
        });

        const body = response.choices[0].message.content;

        if (!body) {
            throw new Error("No content generated from OpenAI");
        }

        const beat = JSON.parse(body);

        const safeBeat = {
            text: beat.text || "The silence absorbs your words.",
            speaker: beat.speaker || "Narrator",
            resonanceWeights: {
                neutral: beat.resonanceWeights?.neutral ?? 0.3,
                depression: beat.resonanceWeights?.depression ?? 0.1,
                panic: beat.resonanceWeights?.panic ?? 0.1,
                isolation: beat.resonanceWeights?.isolation ?? 0.1,
                obsession: beat.resonanceWeights?.obsession ?? 0.1,
                tenderness: beat.resonanceWeights?.tenderness ?? 0.1,
            },
            musicCueTrigger: beat.musicCueTrigger || "conversational-drift",
            imagePrompt: beat.imagePrompt || "dark corridor, single light source, psychological tension",
            audioPrompt: beat.audioPrompt || "low drone, distant hum, breathing",
            _playerInput: normalizedPlayerInput,
        };

        return NextResponse.json(safeBeat);
    } catch (error: any) {
        console.error("Converse API Error:", error);
        return NextResponse.json(
            { error: "Conversation failed", details: error.message },
            { status: 500 }
        );
    }
}
