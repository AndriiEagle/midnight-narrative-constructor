import { NextResponse } from "next/server";
import OpenAI from "openai";

import type { AuthorialOverride, EmotionVector } from "@/lib/emotion/types";
import { createEmotionVector } from "@/lib/emotion/profiles";
import {
  type MemoryResonanceRequest,
  type MemoryResonanceResponse,
  type MemoryResonanceResponseBeat,
  type MemoryResonanceResponseScene,
} from "@/lib/memory-resonance/types";
import { requireAuthenticatedUser } from "@/lib/supabase/require-auth";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

const MEMORY_RESONANCE_SYSTEM_PROMPT = `
You are the hidden memory director for a psychological thriller visual novel.
Your job is to do two things at once:
1. Distill a player's captured signal into a lasting emotional memory.
2. Quietly rewrite selected future scenes so they feel personally contaminated by that memory while still preserving their authored structure.

OUTPUT FORMAT: return ONLY valid JSON with this exact shape:
{
  "memoryEntry": {
    "summary": "One short sentence describing what the story now remembers about the player.",
    "gateWhisper": "A short atmospheric line, 4-10 words, like a private threshold message.",
    "resonanceShift": {
      "neutral": 0.0-0.65,
      "depression": 0.0-0.65,
      "panic": 0.0-0.65,
      "isolation": 0.0-0.65,
      "obsession": 0.0-0.65,
      "tenderness": 0.0-0.65
    },
    "authorOverrides": {
      "contrast": 0.8-1.35,
      "blurPx": 0.0-6.0,
      "vignette": 0.0-0.75,
      "glow": 0.0-0.45,
      "audioLowpassHz": 1200-18000,
      "reverbMix": 0.0-1.0,
      "transitionMs": 250-4500
    }
  },
  "scenes": [
    {
      "sceneId": "target-scene-id",
      "beats": [
        {
          "text": "Personalized beat text.",
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
          "imagePrompt": "Cinematic image direction",
          "audioPrompt": "Ambient sound direction",
          "requiresEmpathyCam": true
        }
      ]
    }
  ]
}

RULES:
- Preserve the number of beats for every target scene. One output beat per input beat.
- Personalize phrasing, resonance, image, audio, and pacing around the captured player signal.
- Use previous memory summaries to deepen continuity when they matter.
- Keep it cinematic, eerie, and precise. No exposition about systems, prompts, or AI.
- Do not add or remove scenes. Do not mention pre-generation.
- If a scene is gentle, keep it gentle; if it is severe, sharpen it through the remembered player signal instead of flattening it.
`;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function asString(value: unknown, fallback: string, maxLength = 400): string {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return fallback;
  }

  return trimmed.slice(0, maxLength);
}

function asEmotionVector(value: unknown, fallback?: EmotionVector, max = 1): EmotionVector {
  const candidate = (value ?? {}) as Partial<EmotionVector>;

  return {
    neutral: clamp(typeof candidate.neutral === "number" ? candidate.neutral : fallback?.neutral ?? 0, 0, max),
    depression: clamp(typeof candidate.depression === "number" ? candidate.depression : fallback?.depression ?? 0, 0, max),
    panic: clamp(typeof candidate.panic === "number" ? candidate.panic : fallback?.panic ?? 0, 0, max),
    isolation: clamp(typeof candidate.isolation === "number" ? candidate.isolation : fallback?.isolation ?? 0, 0, max),
    obsession: clamp(typeof candidate.obsession === "number" ? candidate.obsession : fallback?.obsession ?? 0, 0, max),
    tenderness: clamp(typeof candidate.tenderness === "number" ? candidate.tenderness : fallback?.tenderness ?? 0, 0, max),
  };
}

function asAuthorOverrides(value: unknown): Partial<AuthorialOverride> {
  if (!value || typeof value !== "object") {
    return {};
  }

  const candidate = value as Partial<Record<keyof AuthorialOverride, unknown>>;
  const next: Partial<AuthorialOverride> = {};

  if (typeof candidate.contrast === "number") {
    next.contrast = clamp(candidate.contrast, 0.8, 1.35);
  }
  if (typeof candidate.blurPx === "number") {
    next.blurPx = clamp(candidate.blurPx, 0, 6);
  }
  if (typeof candidate.vignette === "number") {
    next.vignette = clamp(candidate.vignette, 0, 0.75);
  }
  if (typeof candidate.glow === "number") {
    next.glow = clamp(candidate.glow, 0, 0.45);
  }
  if (typeof candidate.audioLowpassHz === "number") {
    next.audioLowpassHz = clamp(candidate.audioLowpassHz, 1200, 18000);
  }
  if (typeof candidate.reverbMix === "number") {
    next.reverbMix = clamp(candidate.reverbMix, 0, 1);
  }
  if (typeof candidate.transitionMs === "number") {
    next.transitionMs = Math.round(clamp(candidate.transitionMs, 250, 4500));
  }

  return next;
}

function sanitizeResponseBeat(
  value: unknown,
  fallback: MemoryResonanceRequest["targetScenes"][number]["beats"][number],
): MemoryResonanceResponseBeat {
  const candidate = (value ?? {}) as Partial<MemoryResonanceResponseBeat>;

  return {
    text: asString(candidate.text, fallback.text, 900),
    speaker: asString(candidate.speaker, fallback.speaker, 60),
    resonanceWeights: asEmotionVector(candidate.resonanceWeights, fallback.resonanceWeights),
    musicCueTrigger: asString(candidate.musicCueTrigger, fallback.musicCueTrigger, 48),
    imagePrompt: asString(candidate.imagePrompt, fallback.imagePrompt, 320),
    audioPrompt: asString(candidate.audioPrompt, fallback.audioPrompt, 320),
    requiresEmpathyCam:
      typeof candidate.requiresEmpathyCam === "boolean" ? candidate.requiresEmpathyCam : fallback.requiresEmpathyCam,
  };
}

function sanitizeResponseScene(
  value: unknown,
  fallback: MemoryResonanceRequest["targetScenes"][number],
): MemoryResonanceResponseScene {
  const candidate = (value ?? {}) as Partial<MemoryResonanceResponseScene>;
  const rawBeats = Array.isArray(candidate.beats) ? candidate.beats : [];

  return {
    sceneId: fallback.id,
    beats: fallback.beats.map((beat, index) => sanitizeResponseBeat(rawBeats[index], beat)),
  };
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuthenticatedUser();
    if ("response" in auth) {
      return auth.response;
    }

    const payload = (await req.json()) as MemoryResonanceRequest;
    const targetScenes = Array.isArray(payload.targetScenes) ? payload.targetScenes : [];

    if (!payload.capturedText?.trim()) {
      return NextResponse.json({ error: "Missing captured text" }, { status: 400 });
    }

    if (!payload.config?.enabled || targetScenes.length === 0) {
      const emptyResponse: MemoryResonanceResponse = {
        memoryEntry: {
          summary: "",
          gateWhisper: "",
          resonanceShift: createEmotionVector(),
          authorOverrides: {},
        },
        scenes: [],
      };

      return NextResponse.json(emptyResponse);
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OPENAI_API_KEY is not configured" }, { status: 500 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-5-nano",
      messages: [
        { role: "system", content: MEMORY_RESONANCE_SYSTEM_PROMPT },
        {
          role: "user",
          content: JSON.stringify(
            {
              storyTitle: payload.storyTitle,
              sceneTitle: payload.sceneTitle,
              currentBeatText: payload.currentBeatText,
              capturedText: payload.capturedText,
              source: payload.source,
              memoryKey: payload.config.memoryKey,
              authorDirective: payload.config.instructions,
              previousMemories: payload.previousMemories,
              targetScenes,
            },
            null,
            2,
          ),
        },
      ],
      response_format: { type: "json_object" },
    });

    const body = response.choices[0]?.message?.content;
    if (!body) {
      throw new Error("No content generated from OpenAI");
    }

    const parsed = JSON.parse(body) as Partial<MemoryResonanceResponse>;
    const rawEntry = (parsed.memoryEntry ?? {}) as Partial<MemoryResonanceResponse["memoryEntry"]>;
    const rawScenes = Array.isArray(parsed.scenes) ? parsed.scenes : [];

    const safeResponse: MemoryResonanceResponse = {
      memoryEntry: {
        summary: asString(
          rawEntry.summary,
          `${payload.config.memoryKey || "memory"} now bends the room around the player.`,
          220,
        ),
        gateWhisper: asString(rawEntry.gateWhisper, "the room keeps your answer", 80),
        resonanceShift: asEmotionVector(rawEntry.resonanceShift, createEmotionVector(), 0.65),
        authorOverrides: asAuthorOverrides(rawEntry.authorOverrides),
      },
      scenes: targetScenes.map((scene) => {
        const rawScene = rawScenes.find((candidate) => candidate && typeof candidate === "object" && candidate.sceneId === scene.id);
        return sanitizeResponseScene(rawScene, scene);
      }),
    };

    return NextResponse.json(safeResponse);
  } catch (error: any) {
    console.error("Memory resonance API error:", error);
    return NextResponse.json(
      { error: "Memory resonance failed", details: error.message },
      { status: 500 },
    );
  }
}
