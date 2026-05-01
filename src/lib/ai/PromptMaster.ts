import type { StoryBeat } from "@/lib/types/story";
import { localizeSpeakerRole } from "@/lib/studio/localizeLegacyDraft";

async function extractErrorMessage(response: Response): Promise<string> {
  if (response.status === 401) {
    return "Для генерації ШІ потрібна автентифікація.";
  }

  try {
    const payload = await response.json();
    if (typeof payload?.details === "string" && payload.details.trim()) {
      return payload.details;
    }
    if (typeof payload?.error === "string" && payload.error.trim()) {
      return payload.error;
    }
  } catch {
    // Ignore malformed JSON and fall back to the status message below.
  }

  return `Не вдалося виконати генерацію ШІ (${response.status}).`;
}

export class PromptMaster {
  static async generateBeatsFromTranscript(transcript: string): Promise<StoryBeat[]> {
    if (!transcript.trim()) {
      return [];
    }

    const resp = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ transcript }),
    });

    if (!resp.ok) {
      throw new Error(await extractErrorMessage(resp));
    }

    const data = await resp.json();

    if (!data.beats || !Array.isArray(data.beats)) {
      throw new Error("ШІ повернув некоректний формат даних.");
    }

    // Map the returned beats to ensure they have the proper structure and a UUID
    return data.beats.map((beat: any) => ({
      id: beat.id || `ai-beat-${crypto.randomUUID()}`,
      text: beat.text || "",
      speaker: localizeSpeakerRole(typeof beat.speaker === "string" ? beat.speaker : "Оповідач"),
      resonanceWeights: beat.resonanceWeights || {
        neutral: 1,
        depression: 0,
        panic: 0,
        isolation: 0,
        obsession: 0,
        tenderness: 0,
      },
      musicCueTrigger: beat.musicCueTrigger || "drone",
      imagePrompt: beat.imagePrompt || "",
      audioPrompt: beat.audioPrompt || "",
    })) as StoryBeat[];
  }
}
