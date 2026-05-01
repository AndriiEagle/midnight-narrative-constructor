import { NextResponse } from "next/server";
import OpenAI from "openai";

import { requireAuthenticatedUser } from "@/lib/supabase/require-auth";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "",
});

export async function POST(req: Request) {
    try {
        const auth = await requireAuthenticatedUser();
        if ("response" in auth) {
            return auth.response;
        }

        const formData = await req.formData();
        const audioFile = formData.get("audio") as File | null;

        if (!audioFile) {
            return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
        }

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                { error: "OPENAI_API_KEY is not configured" },
                { status: 500 }
            );
        }

        // Validate file size (10 minutes of audio ~ 25MB max for Whisper)
        const MAX_SIZE = 25 * 1024 * 1024; // 25MB
        if (audioFile.size > MAX_SIZE) {
            return NextResponse.json(
                { error: "Audio file too large. Maximum 25MB." },
                { status: 400 }
            );
        }

        const transcription = await openai.audio.transcriptions.create({
            file: audioFile,
            model: "whisper-1",
            response_format: "text",
        });

        return NextResponse.json({ text: transcription });
    } catch (error: any) {
        console.error("Transcription Error:", error);
        return NextResponse.json(
            { error: "Transcription failed", details: error.message },
            { status: 500 }
        );
    }
}
