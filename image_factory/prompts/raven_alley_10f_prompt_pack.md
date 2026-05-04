# Raven Alley 10F Prompt Pack

Pipeline: Codex built-in image generation only. Do not use OpenAI API, Image API, Responses API, Batch API, SDK wrappers, automatic queue runners, or `OPENAI_API_KEY`.

Continuity source: `image_factory/continuity/raven_alley_10f_contract.yaml`
Scene QA: `image_factory/qa/raven_alley_10f_qa_checklist.md`

## Production Intent

Create ten museum-quality, cinematic, physically sequential widescreen visual novel CG frames. This is not a set of pretty noir images. It is one locked location, one coherent camera path, one raven motion arc, and one physical clue route.

Active style: dark Swiss rain-noir in fictional Elf town with Zurich old-town and Winterthur industrial restraint.

## Master Prompt Block

Paste this block before every frame prompt.

```text
Finished widescreen visual novel CG, 16:9 landscape. Cinematic hyperreal dark Swiss rain-noir in fictional Elf town with Zurich old-town and Winterthur industrial visual DNA: narrow wet masonry alley, old Swiss facades, reflective cobblestones, heavy rain, cold silver highlights, restrained practical light, museum-quality production design.

Fixed continuity map: one single alley only. East/right facade contains W1 dark rectangular window with exterior horizontal blinds B1, wet stone ledge L1 directly below it, and old drainpipe P1 beside it. Farther down the same east/right facade is D1 dark arched service door with low iron ring H1. T1 thin red thread is tied to nail N1 under L1, drops down the right wall seam, runs along the wet right curb, then rises along D1 door crack and loops around H1. C1 small cold-blue glass shard lies in the center gutter near D1. West/left wall deep in the alley has S1 wall-mounted iron streetlamp on a bracket. F1 small distant human silhouette stands under or near S1. R1 is a realistic black raven, normal scale, glossy wet feathers, tiny violet eye accent.

Palette: 65-70% monochrome graphite / wet charcoal / black stone / cold silver rain; 30-35% controlled narrative color only: violet raven eye, amber blinds or door slit, red thread, yellow lamp reflection, blue glass shard.

Continuity law: do not move W1, B1, L1, P1, D1, H1, T1, C1, S1, F1, or the alley axis. No object may appear unless seeded earlier. Camera may dolly, push in, track, or reverse only if those anchors remain physically coherent.

Hard negatives: no readable text, no signage, no logos, no watermark, no cyberpunk neon, no fantasy village cuteness, no gore, no weapons, no monster raven, no random new windows, no random new ledges, no teleporting figure, no impossible architecture, no decorative colored glow.
```

## Frame 01 - Establish The Contract

Asset name: `raven_alley_10f_frame_01_establish_the_contract`

Story function: lock every future object into the same physical map.

Carry-over from previous: none.

Seeds next: `W1`, `B1`, `L1`, `P1`, `N1`, `T1`, `D1`, `H1`, `C1`, `S1`, `F1`, `R1`.

Fixed geometry visible: wide alley axis from south mouth; W1/B1/L1/P1 on east/right foreground; D1/H1 farther down the same facade; S1/F1 deep left; C1 near D1; T1 route begins under L1.

Color accents and why they matter: violet R1 eye marks witness; amber blinds mark hidden presence; red T1 marks causal route; yellow S1 marks depth; blue C1 marks cold evidence.

Main visual prompt:

```text
Wide 24mm establishing shot from the south alley mouth, looking north into one narrow rain-soaked Swiss stone alley. On the east/right foreground facade: W1 dark rectangular window with exterior horizontal blinds B1, wet stone ledge L1 directly below it, old drainpipe P1 beside it. A realistic black raven R1 perches partly in shadow on L1, tiny violet eye visible. T1 thin red thread is tied to nail N1 under L1, drops down the right wall seam, runs along the wet right curb, then continues toward D1, a dark arched service door farther down the same right facade with low iron ring H1. C1 small cold-blue glass shard lies in the center gutter near D1. Far down the alley, S1 wall-mounted streetlamp glows on the west/left wall with F1 small human silhouette beneath or near it. Wet cobblestones, heavy rain, cold silver reflections, restrained amber slits behind blinds.
```

Hard negative constraints: no second hero window, no new perch, no freestanding streetlamp, no cute fantasy facade, no readable signage, no neon.

## Frame 02 - Sill Proof

Asset name: `raven_alley_10f_frame_02_sill_proof`

Story function: prove L1 is a real physical ledge and the raven can stand on it.

What carries over: same W1/B1/L1/P1/R1 from frame 01; D1/S1/F1 remain in depth.

What it seeds: clear T1 origin and wall-seam route for later tracking shots.

Fixed geometry visible: W1 above L1, P1 beside it, T1 tied under L1 and descending; D1 and S1 are still locatable.

Color accents and why they matter: violet eye signals intent; amber slats keep hidden interior alive; red thread becomes readable evidence.

Main visual prompt:

```text
Controlled medium push-in toward W1 on the same east/right facade. R1 stands on the exact wet stone ledge L1 under W1 and B1, claws physically gripping the slick stone, glossy black feathers beaded with rain. P1 drainpipe stays beside the window. Under L1, nail N1 and the tied red thread T1 are visible; T1 drops straight down the wall seam before running along the right curb toward D1. D1/H1, S1, and F1 remain smaller in the same alley depth, not relocated. Mostly monochrome graphite and silver rain, with restrained amber blinds, violet raven eye, and red thread.
```

Hard negative constraints: do not crop away L1; do not invent a different ledge; do not move D1 to the left wall; no extra bird.

## Frame 03 - Launch Vector

Asset name: `raven_alley_10f_frame_03_launch_vector`

Story function: create a physically plausible motion bridge from L1 toward S1.

What carries over: R1 launches from the exact L1 shown in frames 01-02.

What it seeds: S1 bracket as the later temporary perch.

Fixed geometry visible: W1/B1/L1/P1 behind takeoff point; D1/H1 mid-depth; S1/F1 deep left.

Color accents and why they matter: violet eye and cold wing highlights show direction; red T1 vibrates but remains tied; amber/yellow lights lock origin/destination.

Main visual prompt:

```text
Dynamic but physically plausible rain-noir shot: R1 launches from the exact L1 ledge below W1, wings extended across the alley, moving from the east/right facade toward the deep S1 wall-mounted lamp bracket on the west/left wall. W1, B1, L1, and P1 remain visible behind the takeoff point. T1 red thread trembles slightly from N1 under L1 but stays physically tied, descending the wall seam and continuing along the right curb toward D1/H1. F1 remains small under or near S1. Heavy rain streaks, wet cobblestone reflections, cold silver lighting.
```

Hard negative constraints: no random midair perch, no raven scale jump, no new lamp, no teleporting figure.

## Frame 04 - Mid-Alley Bridge

Asset name: `raven_alley_10f_frame_04_mid_alley_bridge`

Story function: move the camera down the alley while preserving origin and destination anchors.

What carries over: raven flight from frame 03; W1/L1 behind; S1 ahead.

What it seeds: H1 as the physical endpoint of T1.

Fixed geometry visible: camera near D1; W1/L1 recede behind on the same right facade; S1/F1 ahead left.

Color accents and why they matter: red T1 follows curb and starts rising at D1; yellow lamp is destination; amber W1 recedes as origin.

Main visual prompt:

```text
Mid-alley tracking shot near D1. The camera has moved north along the same alley; W1 and L1 are still visible behind on the east/right facade, smaller but locatable. R1 crosses overhead in a clean flight path toward S1 on the west/left wall. D1 arched service door and H1 iron ring are clear in the midground on the same right facade as W1. T1 red thread runs along the wet right curb, then begins to rise along D1 door crack toward H1. S1 and F1 remain ahead on the same depth axis. Dark wet stone, heavy rain, cold silver, restrained amber and yellow.
```

Hard negative constraints: do not mirror the alley; do not add a new side passage as the main route; no new door or window.

## Frame 05 - Lamp Bracket Perch

Asset name: `raven_alley_10f_frame_05_lamp_bracket_perch`

Story function: use the already visible S1 bracket as the second legal perch.

What carries over: R1 reaches S1 from frame 04.

What it seeds: puddle/reflection map for frame 06.

Fixed geometry visible: R1 on S1 bracket; F1 below; D1/H1 mid-depth; W1/L1 far behind.

Color accents and why they matter: yellow lamp becomes depth ruler; violet eye is surveillance; red thread trails back to the right-facade clue path.

Main visual prompt:

```text
Low-angle shot under S1 on the west/left wall. R1 has landed on the wall-mounted iron streetlamp bracket, normal raven size, wet feathers catching cold silver rain, tiny violet eye visible. F1 stands below or slightly beyond the lamp, still small and faceless. Looking back down the alley, D1/H1 sits on the east/right facade and W1/B1/L1 is visible farther back as a small amber-slatted rectangle. T1 red thread traces back along the wet right curb toward D1 and W1. Strong monochrome rain-noir with restrained yellow lamp glow.
```

Hard negative constraints: no freestanding lamp, no human face reveal, no monster raven, no decorative colored fog.

## Frame 06 - Puddle Map

Asset name: `raven_alley_10f_frame_06_puddle_map`

Story function: convert the map into physical evidence through water and reflections.

What carries over: S1/R1/F1/T1 from frame 05.

What it seeds: close attention to C1 and T1 route into D1/H1.

Fixed geometry visible: ground-level gutter under S1; reflected R1/F1; distant reflected D1/W1 if visible.

Color accents and why they matter: red thread leads navigation; yellow reflection locks lamp axis; blue C1 becomes the cold clue.

Main visual prompt:

```text
Ground-level macro-wide VN CG on wet cobblestones and the center gutter beneath S1. The yellow lamp reflection forms a stable line through rainwater. T1 red thread lies wet along the right curb and leads back toward D1/H1. R1 is visible as a dark reflection above on the lamp bracket; F1 appears as a small broken silhouette reflection, not a face. In the distance or puddle distortion, the same W1 amber blinds and D1 shape are faintly readable. C1 small cold-blue glass shard near the door direction catches a precise blue glint.
```

Hard negative constraints: no symbolic note, no readable reflected text, no magic glow, no unseeded reflected architecture.

## Frame 07 - Door Ring Reveal

Asset name: `raven_alley_10f_frame_07_door_ring_reveal`

Story function: reveal H1 as the physical endpoint of the red thread.

What carries over: T1 and C1 from frame 06.

What it seeds: amber keyhole/under-door slit for frame 08.

Fixed geometry visible: D1/H1 foreground right; W1/L1 behind along same facade; S1/R1/F1 deep left.

Color accents and why they matter: red loop around H1 proves causal path; amber under-door slit suggests hidden presence; blue shard remains cold witness.

Main visual prompt:

```text
Tracking shot along T1 from the wet gutter to D1, the dark arched service door on the same east/right facade established earlier. H1 iron door ring is foreground; T1 rises from the right curb along the door crack and loops around H1. A very narrow amber line leaks from beneath D1, subtle and realistic. C1 blue glass shard lies in the gutter near the threshold. In depth, S1 lamp, R1 on its bracket, and F1 silhouette remain aligned; W1/B1/L1 is still visible behind along the same facade.
```

Hard negative constraints: no readable inscription on D1, no new window beside D1, no bright interior reveal, no weapon silhouette.

## Frame 08 - Keyhole Resonance

Asset name: `raven_alley_10f_frame_08_keyhole_resonance`

Story function: compress tension without introducing new props or characters.

What carries over: D1/H1/T1/C1 and amber slit from frame 07.

What it seeds: reverse angle back to W1/L1 through reflected blind pattern.

Fixed geometry visible: close D1 surface, H1, T1, C1; any B1 slats appear only as reflection/echo from known W1.

Color accents and why they matter: amber keyhole/door slit is hidden presence; red thread is connection; blue shard is cold mirror.

Main visual prompt:

```text
Tight cinematic close-up on D1: wet dark wood, H1 iron ring, T1 red thread crossing and looping around the ring, C1 blue glass shard at the lower edge of frame. A tiny amber glow leaks through the keyhole and under-door slit, not bright, just enough to imply presence behind the door. On the wet door surface or shard reflection, echo the horizontal slat pattern of W1/B1 from the known window direction. Rain streaks, black stone, restrained color, high physical detail.
```

Hard negative constraints: no visible face in keyhole, no gore, no weapons, no readable markings, no new prop.

## Frame 09 - Reverse To Origin

Asset name: `raven_alley_10f_frame_09_reverse_to_origin`

Story function: prove the reverse angle without moving the map.

What carries over: D1/H1/T1 close-up and S1/R1 from prior frames.

What it seeds: R1 returning to L1 for the final tableau.

Fixed geometry visible: camera beside D1, looking diagonally back along the same right facade to W1/L1; S1/F1 remain deep left.

Color accents and why they matter: red thread leads back to L1; amber blinds reappear as origin; violet raven eye marks return motion.

Main visual prompt:

```text
Anchored reverse angle from beside D1, looking diagonally back along the same east/right facade toward W1. The camera has not crossed or mirrored the map: W1, B1, and L1 are on the same continuous facade closer to the alley mouth, not on the opposite wall. T1 red thread runs from H1 down the door crack, along the wet right curb, up the wall seam, and back to N1 under L1. In the deep background, S1 lamp and F1 silhouette remain fixed on the west/left wall axis. R1 leaves or turns from the S1 bracket, flying back toward the original W1/L1 zone. Heavy rain, wet masonry, cold silver, restrained amber and violet.
```

Hard negative constraints: do not relocate W1, do not put D1 on the opposite wall, do not bring F1 too close, no new alley branch.

## Frame 10 - Final Witness Tableau

Asset name: `raven_alley_10f_frame_10_final_witness_tableau`

Story function: close with every continuity anchor resolved in one physically believable composition.

What carries over: R1 return path from frame 09.

What it seeds: none.

Fixed geometry visible: R1 on original L1; W1/B1/P1; T1 route to D1/H1; C1 near D1; S1/F1 in depth.

Color accents and why they matter: violet eye is final witness; amber blinds/door slit are hidden interior; red thread is causal path; yellow lamp is distance; blue shard is final cold note.

Main visual prompt:

```text
Final composed widescreen VN CG from the original W1/L1 zone, slightly lower and closer than frame 01. R1 is perched again on the exact same wet stone ledge L1 below W1 with B1 exterior blinds, proving the perch existed from the start. P1 drainpipe remains beside W1. T1 red thread runs from nail N1 under L1 down the wall seam, along the wet right curb, then to D1/H1 farther down the same right facade. C1 blue shard remains in the gutter near D1. S1 wall lamp glows deep center-left on the west/left wall, and F1 stands small beneath or near it. Heavy rain, wet black stone, cold silver reflections, 65-70% monochrome, tiny narrative color accents only.
```

Hard negative constraints: no new final clue, no new architecture, no color bloom, no readable text, no logo, no watermark.

## Generation Order

Generate strictly in order from frame 01 to frame 10.

After each frame, compare it against the previous accepted frame and the continuity contract before generating the next one. Reject early rather than trying to repair a broken sequence downstream.
