"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

const MAX_RECORDING_SECONDS = 600; // 10 minutes
const ANONYMOUS_OPERATOR_LOCKOUT_TEXT =
    "Система глуха до анонімних голосів. Говорити можуть лише авторизовані оператори.";

type ApiRequestError = Error & {
    status?: number;
};

function formatTime(totalSeconds: number): string {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

async function buildRequestError(response: Response, fallbackMessage: string): Promise<ApiRequestError> {
    let message = fallbackMessage;

    try {
        const payload = await response.json();
        if (typeof payload?.error === "string" && payload.error.trim()) {
            message = payload.error;
        } else if (typeof payload?.details === "string" && payload.details.trim()) {
            message = payload.details;
        }
    } catch {
        // Ignore malformed error bodies and fall back to the default message.
    }

    const error = new Error(message) as ApiRequestError;
    error.status = response.status;
    return error;
}

type ConversationInputProps = {
    currentBeatText: string;
    onNarrativeResponse: (beat: any) => void;
    conversationHistory: { role: string; content: string }[];
};

export function ConversationInput({
    currentBeatText,
    onNarrativeResponse,
    conversationHistory,
}: ConversationInputProps) {
    const [textInput, setTextInput] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [remainingSeconds, setRemainingSeconds] = useState(MAX_RECORDING_SECONDS);
    const [error, setError] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const injectUnauthorizedFallback = useCallback(
        (playerInput = "") => {
            setError(null);
            setTextInput("");
            onNarrativeResponse({
                text: ANONYMOUS_OPERATOR_LOCKOUT_TEXT,
                speaker: "Система",
                resonanceWeights: {
                    neutral: 0.16,
                    depression: 0.22,
                    panic: 0.14,
                    isolation: 0.32,
                    obsession: 0.1,
                    tenderness: 0.0,
                },
                musicCueTrigger: "operator-lockout",
                imagePrompt: "sealed operator terminal, inaccessible interface glow, institutional darkness",
                audioPrompt: "dead carrier tone, severed intercom, refrigerated ventilation, restrained static",
                _playerInput: playerInput,
            });
        },
        [onNarrativeResponse],
    );

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
                mediaRecorderRef.current.stop();
            }
        };
    }, []);

    // Auto-stop recording when time runs out
    useEffect(() => {
        if (isRecording && remainingSeconds <= 0) {
            stopRecording();
        }
    }, [remainingSeconds, isRecording]);

    const submitText = useCallback(
        async (text: string) => {
            if (!text.trim() || isSubmitting) return;

            setIsSubmitting(true);
            setError(null);

            try {
                const res = await fetch("/api/converse", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        currentBeatText,
                        playerInput: text.trim(),
                        history: conversationHistory,
                    }),
                });

                if (!res.ok) {
                    throw await buildRequestError(res, "Не вдалося продовжити розмову");
                }

                const beat = await res.json();
                setTextInput("");
                onNarrativeResponse(beat);
            } catch (err: any) {
                if (err?.status === 401) {
                    injectUnauthorizedFallback(text.trim());
                    return;
                }

                setError(err.message || "Щось пішло не так");
            } finally {
                setIsSubmitting(false);
            }
        },
        [conversationHistory, currentBeatText, injectUnauthorizedFallback, isSubmitting, onNarrativeResponse],
    );

    const startRecording = useCallback(async () => {
        try {
            setError(null);
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                // Stop all tracks
                stream.getTracks().forEach((track) => track.stop());

                if (timerRef.current) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                }

                const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
                if (audioBlob.size === 0) return;

                // Transcribe
                setIsTranscribing(true);
                try {
                    const formData = new FormData();
                    formData.append("audio", audioBlob, "recording.webm");

                    const res = await fetch("/api/transcribe", {
                        method: "POST",
                        body: formData,
                    });

                    if (!res.ok) {
                        throw await buildRequestError(res, "Не вдалося розпізнати голос");
                    }

                    const { text } = await res.json();
                    if (text && text.trim()) {
                        setTextInput(text.trim());
                        // Auto-submit after transcription
                        await submitText(text.trim());
                    }
                } catch (err: any) {
                    if (err?.status === 401) {
                        injectUnauthorizedFallback();
                        return;
                    }

                    setError(err.message || "Не вдалося розпізнати голос");
                } finally {
                    setIsTranscribing(false);
                    setRemainingSeconds(MAX_RECORDING_SECONDS);
                }
            };

            mediaRecorder.start(1000); // collect data every second
            setIsRecording(true);
            setRemainingSeconds(MAX_RECORDING_SECONDS);

            // Start countdown timer
            timerRef.current = setInterval(() => {
                setRemainingSeconds((prev) => {
                    if (prev <= 1) return 0;
                    return prev - 1;
                });
            }, 1000);
        } catch (err: any) {
            setError("Немає доступу до мікрофона. Дозволь мікрофон у браузері.");
        }
    }, [injectUnauthorizedFallback, submitText]);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            e.stopPropagation();
            submitText(textInput);
        }
    };

    const isBusy = isSubmitting || isTranscribing;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 flex w-full max-w-lg flex-col items-center gap-3"
            onClick={(e) => e.stopPropagation()}
        >
            {/* Label */}
            <p className="text-[10px] uppercase tracking-[0.3em] text-accent/70">
                {isRecording
                    ? "слухаю..."
                    : isTranscribing
                        ? "розшифровую голос..."
                        : isBusy
                            ? "історія змінюється..."
                            : "скажи або впиши свою відповідь"}
            </p>

            {/* Recording Timer */}
            <AnimatePresence>
                {isRecording && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex items-center gap-3"
                    >
                        <span className="relative flex h-3 w-3">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
                            <span className="relative inline-flex h-3 w-3 rounded-full bg-rose-500" />
                        </span>
                        <span className="font-mono text-lg tracking-widest text-rose-300">
                            {formatTime(remainingSeconds)}
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Input Row */}
            <div className="flex w-full items-center gap-2">
                <input
                    ref={inputRef}
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isRecording ? "Йде запис..." : "Впиши свою відповідь..."}
                    disabled={isBusy || isRecording}
                    className="flex-1 rounded-xl border border-border/40 bg-black/50 px-4 py-3 text-sm text-foreground placeholder-[#555] backdrop-blur-md outline-none transition-all duration-300 focus:border-accent/60 focus:ring-1 focus:ring-accent/30 disabled:opacity-40"
                />

                {/* Mic Button */}
                <button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isBusy && !isRecording}
                    className={`flex h-11 w-11 items-center justify-center rounded-full border transition-all duration-300 ${isRecording
                            ? "border-rose-500/60 bg-rose-500/20 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:bg-rose-500/30"
                            : "border-border/40 bg-black/50 text-accent/70 hover:border-accent/60 hover:text-accent"
                        } disabled:opacity-40 disabled:pointer-events-none`}
                    title={isRecording ? "Зупинити запис" : "Почати голосове введення (до 10 хв)"}
                >
                    {isRecording ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                            <rect x="6" y="6" width="12" height="12" rx="2" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                        </svg>
                    )}
                </button>

                {/* Send Button */}
                <button
                    type="button"
                    onClick={() => submitText(textInput)}
                    disabled={isBusy || !textInput.trim() || isRecording}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-border/40 bg-black/50 text-accent/70 transition-all duration-300 hover:border-accent/60 hover:text-accent disabled:opacity-40 disabled:pointer-events-none"
                    title="Надіслати"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                </button>
            </div>

            {/* Error Display */}
            <AnimatePresence>
                {error && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-xs text-rose-300/80"
                    >
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
