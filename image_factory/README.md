# Codex-only Visual Novel Image Factory

This folder is a sidecar production surface for visual novel image assets. It is intentionally not an OpenAI API pipeline.

## Hard rule

- Do not add `OPENAI_API_KEY` usage here.
- Do not call OpenAI Image API, Responses API, Batch API, or any API wrapper for image generation.
- Do not add queue runners that generate images through SDK calls.
- Generate and edit images through Codex built-in image generation in the Codex app thread.

## Source of truth

- Current narrative source: `src/lib/data/injectVerticalSlice.ts`.
- Runtime integration points: `StoryScene.imageUrl` and `StoryBeat.imageUrl`.
- Art-direction source: `style_bible/master_style.yaml`.
- Protagonist continuity source: `characters/anonymous_operator/character_bible.yaml`.
- First pilot shotlist: `shotlists/ghost_shift_pilot.yaml`.
- Reusable prompts: `prompts/ghost_shift_prompt_pack.md`.
- QA and revision control: `qa/qa_checklist.md` and `qa/revision_queue.json`.
- Asset ledger: `metadata/assets.jsonl`.

## Manual pipeline

1. Read the target beats from the current story file.
2. Select 1-5 shots from `shotlists/*.yaml`.
3. Use the matching prompt block from `prompts/*.md` in Codex built-in image generation.
4. Keep the original Codex output in Codex home.
5. Copy selected finals into `image_factory/finals`.
6. Add or update one JSON line in `metadata/assets.jsonl`.
7. Run QA using `qa/qa_checklist.md`.
8. Add requested fixes to `qa/revision_queue.json`.
9. Only after human art approval should a final asset path be connected to `imageUrl`.

## Current direction

The first five-frame apartment pilot is rejected as a style mismatch. The active direction is now the `raven_sequence_v2` reference lane:

1. Rain-noir Zurich / Winterthur / Elf town alley.
2. Widescreen visual novel CG, not vertical TikTok framing.
3. Raven, wet masonry, dark window blinds, amber eye/light accent.
4. Strict continuity: every later object must be physically seeded in earlier frames.
5. The continuity source is `continuity/raven_sequence_contract.yaml`.

These are project assets, not generated code. The current app should keep working even if this folder is ignored by the runtime.
