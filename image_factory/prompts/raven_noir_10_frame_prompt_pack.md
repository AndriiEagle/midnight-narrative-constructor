# Raven Noir 10-Frame Prompt Pack

Pipeline: Codex built-in image generation only. Do not use OpenAI API, Image API, Responses API, Batch API, SDK wrappers, queue runners, or `OPENAI_API_KEY`.

Contract source: `image_factory/continuity/raven_noir_10_frame_contract.yaml`.

Use this pack sequentially. Generate Frame N only after Frame N-1 passes continuity QA. Do not generate all ten at once.

## Production Objective

Create ten museum-quality, physically continuous, 16:9 widescreen visual novel CG frames in dark Swiss rain-noir. The sequence must feel like one real alley captured by a real camera path, not ten separate pretty images.

Revised production target after Frame 01 self-review: harsher monochrome discipline, sharper contrast, less decorative warmth, less lower-frame clutter. The image should feel cut from wet graphite and silver rain, with color appearing only as tiny evidence marks.

Current accepted working base: `image_factory/finals/raven_noir_10f_01_alley_contract_v2.png`.

Frame 01 v2 self-review decision: accept as continuity base. It has strong monochrome dominance, stable `W1/S1/RAVEN1`, visible `D1/GLASS_D1`, stable `LAMP1/FIG1` axis, and a thinner `CORD1`. Known tolerances to watch in later frames: keep `GLASS_D1` smaller, keep `BR1` from becoming a decorative ring motif, and prevent `CORD1` from taking over the lower VN-safe zone.

Sequential generation protocol: generate or edit only one frame at a time. Use the accepted previous frame as visual context for the next frame. After each generation, run the scene QA before producing the next frame.

The active location is a fictional Elf town with Zurich old-town and Winterthur industrial restraint: wet black stone, narrow Swiss facades, exterior blinds, old drainpipes, reflective cobblestones, heavy rain, cold silver highlights, and tiny story-relevant color accents.

## Fixed Continuity Map

Camera starts at the south mouth of a narrow alley, looking north.

- Right/east wall: `W1` dark rectangular window, `BL1` exterior horizontal blinds, `S1` wet stone ledge directly below `W1`, `BR1` rusted bracket under `S1`, `CORD1` hairline-thin wet red cord tied to `BR1`, `PIPE_R` drainpipe beside `W1`.
- Left/west wall: `D1` recessed old service door, `GLASS_D1` small cold blue wire-glass transom above it, `PIPE_L` vertical drainpipe near the door.
- Deep alley: `LAMP1` restrained yellow Swiss streetlamp, `FIG1` small anonymous human silhouette.
- Ground: continuous wet cobblestones, `GUTTER_R` right-side drainage gutter, `PUDDLE_1` shallow reflective puddle below `W1` extending toward `D1`.
- Living anchor: `RAVEN1` realistic black raven. It may perch only on `S1`, launch from `S1`, or cross directly in front of `W1/BL1`.

Continuity law: any object used in Frame N must be visible, reflected, cropped, or physically implied in Frame N-1. No new ledges, doors, lamps, windows, pipes, figures, perches, stone blocks, or light sources after Frame 01.

## Color Discipline

Use 80-85% monochrome: black stone, graphite masonry, wet charcoal, cold silver rain, hard wet highlights, deep negative space.

Use 15-20% story color only. Every color accent must be small, physically sourced, and high-contrast against the monochrome field:

- Amber: razor-thin practical slits behind `BL1`, not a broad warm window.
- Violet: pinpoint catchlight in `RAVEN1` eye, not a glow.
- Red: hairline `CORD1` only, not a thick rope, cable, or foreground slash.
- Yellow: narrow `LAMP1` reflection streak, not a warm street scene.
- Blue: small `GLASS_D1` glint or later thin door crack, not a neon patch.

No decorative color. No cyberpunk neon.

## Master Prompt Block

Paste this before every frame prompt.

```text
Codex built-in image generation only. Do not use OpenAI API, Image API, Responses API, Batch API, SDK wrappers, queue runners, or OPENAI_API_KEY.

Create a finished 16:9 widescreen visual novel CG, cinematic hyperreal dark Swiss rain-noir. Fictional Elf town with Zurich old-town and Winterthur industrial restraint: narrow wet alley, black stone, old Swiss facades, exterior horizontal blinds, old drainpipes, reflective cobblestones, heavy rain, cold silver highlights, restrained practical lighting, subtle film grain. The image should be 80-85% monochrome: wet graphite, black stone, cold silver rain, hard contrast, sharp readable silhouettes. Not cute fantasy, not cyberpunk, not generic dark fantasy.

Fixed geometry for the whole sequence: same alley, same right/east wall with W1 dark rectangular window, BL1 exterior horizontal blinds, S1 wet stone ledge directly under W1, BR1 rusted bracket under S1, CORD1 hairline-thin wet red cord tied to BR1 and lying subtly across cobbles toward D1, PIPE_R beside W1. Same left/west wall with D1 recessed old service door, GLASS_D1 small cold blue wire-glass transom, PIPE_L near D1. Same deep LAMP1 yellow streetlamp and FIG1 distant anonymous human silhouette. Same GUTTER_R and PUDDLE_1. RAVEN1 is a realistic black raven, never monster-sized.

Palette rule: 80-85% monochrome black/graphite/silver rain. 15-20% meaningful color only, used as tiny evidence marks: pinpoint violet raven eye, razor-thin amber slits behind blinds, hairline red cord, narrow yellow lamp reflection, small cold blue transom or door crack. Lower 22% quiet, dark, and uncluttered for future visual novel dialogue UI.

Hard avoid: readable text, logos, watermarks, signage, neon city, fantasy cuteness, gore, weapons, extra birds, new ledges, new doors, new windows, new lamps, teleporting figure, impossible reflections, changed alley width, dry pavement, broad colored glow, thick red rope/cable, bright clutter in the lower 22%.
```

## Frame 01 - `raven_noir_10f_01_alley_contract`

Story function: establish the entire physical contract before drama begins.

Carries over from previous frame: none.

Seeds for next frame: `W1`, `BL1`, `S1`, `BR1`, `CORD1`, `PIPE_R`, `D1`, `GLASS_D1`, `PIPE_L`, `LAMP1`, `FIG1`, `GUTTER_R`, `PUDDLE_1`, `RAVEN1`.

Fixed geometry visible: all anchors. This frame must read as a map, not just atmosphere.

Color accents and why they matter:

- Amber behind `BL1`: hidden watcher.
- Violet in `RAVEN1` eye: living witness.
- Red `CORD1`: physical clue, but hairline-thin and not dominant.
- Yellow `LAMP1` reflection: depth ruler.
- Blue `GLASS_D1`: future threshold.

Main visual prompt:

```text
Wide establishing shot from the south alley mouth looking north into depth. Right foreground clearly shows W1 dark rectangular window with BL1 exterior horizontal blinds and S1 wet stone ledge directly below it. BR1 rusted bracket is visible under the ledge. CORD1, a hairline-thin wet red cord, is already tied to BR1 and traces a subtle route across the wet cobbles toward D1 without dominating the lower frame. RAVEN1, a realistic black raven, perches on S1 in shadow, small enough to be physically plausible. PIPE_R runs beside W1. Left midground shows D1 recessed old service door, GLASS_D1 faint cold blue wire-glass transom, and PIPE_L. Deep center-left shows LAMP1 old yellow streetlamp and FIG1 small anonymous silhouette under rain. GUTTER_R and PUDDLE_1 reflect the same layout. Make this harsher and more monochrome than a normal noir illustration: wet graphite, cold silver rain, crisp silhouettes, tiny color accents only.
```

Hard negative constraints: no missing ledge, no hidden or absent door, no unseeded props, no extra windows, no cute storefronts, no readable signs, no giant raven, no thick red rope, no warm color wash, no bright lower dialogue zone.

## Frame 02 - `raven_noir_10f_02_wing_arc`

Story function: convert the static map into believable raven motion.

Carries over from previous frame: same `W1/BL1/S1/BR1/CORD1`, same `D1`, same `LAMP1/FIG1`, same alley axis.

Seeds for next frame: `RAVEN1` will return to the exact `S1` ledge; `CORD1` remains visibly tied to `BR1`.

Fixed geometry visible: `W1`, `BL1`, `S1`, `BR1`, `CORD1`, `D1`, `LAMP1`, `FIG1`.

Color accents and why they matter:

- Silver rain on wings clarifies motion.
- Amber slats prove the same window.
- Red cord twitch proves the same bracket.
- Yellow lamp line keeps depth stable.

Main visual prompt:

```text
Slight pan and push toward the right wall from Frame 01. RAVEN1 launches from the exact S1 wet stone ledge, wings extended across the amber-lit BL1 blind zone. Its feet have just left S1; the launch point is unmistakable. CORD1 remains tied to BR1 under the ledge and lies wet across the cobblestones. D1 and GLASS_D1 remain visible on the left midground. LAMP1 and FIG1 stay aligned in rainy depth on the same alley axis.
```

Hard negative constraints: no raven flying from empty air, no new perch, no scale jump, no second bird, no moved lamp, no missing red cord.

## Frame 03 - `raven_noir_10f_03_same_ledge_return`

Story function: prove the motion completes on the same physical ledge.

Carries over from previous frame: the launch arc from `S1`, same right wall, same red cord.

Seeds for next frame: close relationship between raven, blinds, ledge, and reflection.

Fixed geometry visible: `W1`, `BL1`, `S1`, `BR1`, `CORD1`, `PIPE_R`, `LAMP1`, `FIG1`.

Color accents and why they matter:

- Violet raven eye marks attention.
- Red cord under or near claw marks clue.
- Amber slits mark hidden watcher.

Main visual prompt:

```text
Closer right-wall view. RAVEN1 has landed back on the exact S1 wet stone ledge below W1, the same ledge visible in Frame 01 and launch point in Frame 02. One claw touches or lightly pins CORD1 near BR1. BL1 exterior blinds remain fixed behind the bird with narrow amber slits. PIPE_R is beside W1. In the rainy background, LAMP1 and FIG1 remain small and aligned down the alley.
```

Hard negative constraints: no pedestal, no new stone block, no different window, no monster raven, no full interior reveal, no readable details.

## Frame 04 - `raven_noir_10f_04_blind_reflection`

Story function: make the hidden watcher and raven witness share one reflective surface.

Carries over from previous frame: `RAVEN1` perched on `S1`, `CORD1` under `S1`, amber blinds.

Seeds for next frame: `PUDDLE_1` and ground reflection become the next camera target.

Fixed geometry visible: `W1`, `BL1`, `S1`, `RAVEN1`, `CORD1`, `PUDDLE_1`, `LAMP1`, `FIG1`.

Color accents and why they matter:

- Amber slits: hidden watcher.
- Violet eye: witness.
- Red cord: clue descending to ground.
- Yellow reflection: continuity ruler.

Main visual prompt:

```text
Tight exterior composition on W1, BL1, S1, and RAVEN1. The raven remains perched on S1. Wet window glass and PUDDLE_1 catch distorted but physically consistent reflections of LAMP1 and FIG1 along the same alley axis. CORD1 trails from BR1 down toward GUTTER_R. Amber behind BL1 is narrow practical interior light, not magic. Lower 22 percent stays quiet and dark for visual novel UI.
```

Hard negative constraints: no readable interior, no face behind blinds, no impossible reflection, no second raven, no new light source.

## Frame 05 - `raven_noir_10f_05_ground_clue`

Story function: turn `CORD1` and `PUDDLE_1` into a physical route through the scene.

Carries over from previous frame: puddle reflection and cord descending from the ledge.

Seeds for next frame: `FIG1` can advance along the same alley axis toward `D1`.

Fixed geometry visible: `CORD1`, `GUTTER_R`, `PUDDLE_1`, `D1`, `GLASS_D1`, `W1`, `S1`, `RAVEN1`, `LAMP1`, `FIG1`.

Color accents and why they matter:

- Red cord leads the eye.
- Blue transom marks destination.
- Yellow lamp reflection keeps depth stable.
- Amber/violet remain reflected as continuity anchors.

Main visual prompt:

```text
Low wet-cobblestone camera near GUTTER_R under the W1 zone. CORD1 is clearly continuous from BR1 under S1 toward the base of D1, partly submerged and glossy with rain. PUDDLE_1 reflects W1, S1, RAVEN1, LAMP1, and FIG1 without inventing new objects. D1 and GLASS_D1 are more legible on the left wall but still closed. FIG1 remains distant, only fractionally closer than before.
```

Hard negative constraints: no cord appearing from nowhere, no dry ground, no new doorway, no abstract reflection geometry, no changed alley width.

## Frame 06 - `raven_noir_10f_06_figure_advances`

Story function: activate `FIG1` without teleportation.

Carries over from previous frame: `FIG1` was distant and fractionally closer; `D1` is the seeded destination.

Seeds for next frame: `FIG1` reaches `D1` latch.

Fixed geometry visible: `FIG1`, `LAMP1`, `D1`, `GLASS_D1`, `CORD1`, `W1`, `S1`, `RAVEN1`.

Color accents and why they matter:

- Yellow backlight outlines the figure.
- Red cord points toward the door.
- Blue transom waits as threshold.
- Amber/violet keep the opposite wall alive.

Main visual prompt:

```text
Medium-long view down the same alley, re-centered from the ground view. FIG1 has moved only a few meters forward from LAMP1, still anonymous and small, walking along the wet cobblestone axis toward D1. W1, S1, and RAVEN1 remain locatable at the right edge or in PUDDLE_1 reflection. CORD1 runs visibly along the wet ground toward D1. GLASS_D1 gives a faint cold blue glint.
```

Hard negative constraints: no close teleport, no face reveal, no umbrella or new prop, no weapon, no new alley branch.

## Frame 07 - `raven_noir_10f_07_door_threshold`

Story function: bring the seeded service door into narrative focus.

Carries over from previous frame: `FIG1` advancing toward `D1`; `D1/GLASS_D1` visible since Frame 01.

Seeds for next frame: `D1` can open into a narrow blue crack.

Fixed geometry visible: `D1`, `GLASS_D1`, `FIG1`, `CORD1`, `W1`, `S1`, `RAVEN1`.

Color accents and why they matter:

- Blue glass marks the threshold.
- Red cord reaches the door base.
- Amber and violet remain across the alley as watcher/witness.

Main visual prompt:

```text
Pan left to D1 while preserving the alley width and spatial relationship to W1. FIG1 stands beside the recessed service door, one hand near the old latch, face hidden and identity unreadable. GLASS_D1 gives a muted cold blue wire-glass glint. Across the alley, W1, BL1, S1, and RAVEN1 remain visible through rain or in wet reflection. CORD1 reaches the wet base of D1.
```

Hard negative constraints: no ornate fantasy door, no readable plaque, no face reveal, no weapon, no new character, no new window.

## Frame 08 - `raven_noir_10f_08_blue_crack`

Story function: justify the later reverse angle by physically opening the door.

Carries over from previous frame: hand at `D1` latch, `CORD1` at threshold, opposite `W1/S1/RAVEN1`.

Seeds for next frame: camera may step just inside `D1`.

Fixed geometry visible: `D1`, `GLASS_D1`, `FIG1`, `CORD1`, `W1`, `BL1`, `S1`, `RAVEN1`, `LAMP1`.

Color accents and why they matter:

- Thin blue door crack: legal interior light source.
- Red cord: physical connection across threshold.
- Amber blinds and violet raven eye remain across the alley.

Main visual prompt:

```text
D1 is open only a narrow crack. Cold blue interior light spills onto wet cobblestones and CORD1 at the threshold. FIG1 is partly behind or beside the door, still anonymous. Across the alley, the same W1, BL1, S1, and RAVEN1 remain visible in rain or puddle reflection. LAMP1 stays deep behind on the same axis. The blue light is restrained and practical, not neon.
```

Hard negative constraints: no portal effect, no cyberpunk blue glow, no full interior reveal, no extra figures, no readable labels.

## Frame 09 - `raven_noir_10f_09_inside_reverse`

Story function: use a physically valid reverse angle from inside the opened door.

Carries over from previous frame: `D1` opened narrowly, blue edge light, cord crossing threshold.

Seeds for next frame: final threshold tableau can combine all anchors.

Fixed geometry visible: `D1` frame foreground, alley beyond, `CORD1`, `W1`, `BL1`, `S1`, `RAVEN1`, `LAMP1`, `FIG1`, `PUDDLE_1`.

Color accents and why they matter:

- Blue interior edge opposes amber blinds.
- Red cord links interior and exterior.
- Violet raven eye holds the far target.
- Yellow lamp keeps the original depth axis.

Main visual prompt:

```text
Camera has stepped just inside D1, looking back out through the partially open service door. The dark D1 doorframe borders the foreground. Outside, wet cobblestones, GUTTER_R, PUDDLE_1, LAMP1, and FIG1 align with previous frames. Across the alley, W1, BL1, S1, and RAVEN1 are visible through rain. CORD1 crosses the threshold continuously from outside toward the interior edge. The view is possible only because D1 opened in Frame 08.
```

Hard negative constraints: no impossible view through walls, no changed alley layout, no new right-side window, no full interior clutter, no readable text.

## Frame 10 - `raven_noir_10f_10_continuity_tableau`

Story function: final resonant lock of all physical anchors.

Carries over from previous frame: inside/outside threshold view, all established objects.

Seeds for next frame: optional next scene may enter `D1` interior; this sequence itself is complete.

Fixed geometry visible: `D1`, `GLASS_D1`, `CORD1`, `BR1`, `W1`, `BL1`, `S1`, `PIPE_R`, `RAVEN1`, `LAMP1`, `FIG1`, `PUDDLE_1`.

Color accents and why they matter:

- Red cord: final traceable clue path.
- Violet raven eye: witness.
- Amber blinds: hidden watcher.
- Blue threshold: interior boundary.
- Yellow lamp: original alley axis.

Main visual prompt:

```text
Final museum-quality oblique threshold tableau, half inside D1 and looking out into the same alley. Foreground: dark D1 frame with subtle cold blue GLASS_D1 or interior edge light. Ground: CORD1 crosses the wet threshold and leads back across cobblestones to BR1 under S1; the path is physically traceable. Right wall: W1, BL1, S1, PIPE_R, and RAVEN1 perched exactly on the same ledge. Depth: LAMP1 and FIG1 remain on the same alley axis. PUDDLE_1 reflects the anchors without inventing new ones. The frame is coherent, quiet, tragic, and physically real.
```

Hard negative constraints: no collage logic, no new symbolic props, no moved ledge, no fantasy glow, no cyberpunk neon, no readable signs, no gore, no weapons.

## Scene QA Checklist

Hard gates:

- Frame 01 must visibly seed every later object: `W1`, `BL1`, `S1`, `BR1`, `CORD1`, `PIPE_R`, `D1`, `GLASS_D1`, `PIPE_L`, `LAMP1`, `FIG1`, `GUTTER_R`, `PUDDLE_1`, `RAVEN1`.
- Frame 03 fails if `RAVEN1` is not on the exact Frame 01 `S1` ledge.
- Frame 07 fails if `D1` was not visible before.
- Frame 09 fails if `D1` was not opened in Frame 08.
- `CORD1` fails if it cannot be traced continuously from `BR1` to `D1`.
- `FIG1` fails if the scale jump exceeds a slow walk along alley depth.
- Color fails if any accent lacks a physical source.
- Color fails if the image is less than roughly 80% monochrome.
- Color fails if amber, blue, yellow, red, or violet become broad decorative areas rather than tiny story marks.
- UI fails if `CORD1` or bright puddle reflections dominate the lower 22%.
- Reflection fails if it introduces unseeded objects.
- Any readable text, logo, neon cyberpunk, cute fantasy styling, gore, weapon, extra raven, or new architecture is automatic reject.

Per-frame acceptance:

- Frame 01 passes only if it functions as a map.
- Frame 02 passes only if raven motion starts from `S1`.
- Frame 03 passes only if the perch is visibly the same `S1`.
- Frame 04 passes only if reflection links `W1/RAVEN1` to `LAMP1/FIG1`.
- Frame 05 passes only if the cord path respects real ground geometry.
- Frame 06 passes only if `FIG1` advances plausibly from `LAMP1`.
- Frame 07 passes only if the door focus preserves opposite-wall continuity.
- Frame 08 passes only if blue light comes from the narrow door crack.
- Frame 09 passes only if the reverse angle is possible from the opened `D1`.
- Frame 10 passes only if all anchors coexist without collage logic.

## Revision Prompt Template

Use this only with Codex built-in image editing.

```text
Edit the provided image using Codex built-in image editing only.
Apply only these changes: {requested_changes}.
Preserve the exact fixed geometry from image_factory/continuity/raven_noir_10_frame_contract.yaml: W1, BL1, S1, BR1, CORD1, PIPE_R, D1, GLASS_D1, PIPE_L, LAMP1, FIG1, GUTTER_R, PUDDLE_1, RAVEN1.
Preserve the camera family, alley width, rain direction, lower 22% VN-safe zone, and color-source discipline.
Do not add readable text, logos, watermark, extra characters, extra birds, weapons, gore, cyberpunk neon, cute fantasy styling, new ledges, new windows, new doors, new lamps, new pipes, new perches, or unrelated background changes.
```
