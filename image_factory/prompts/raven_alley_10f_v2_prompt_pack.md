# Raven Alley 10F V2 Prompt Pack

Pipeline: Codex built-in image generation only. No OpenAI API, Image API, Responses API, Batch API, SDK wrappers, queue runners, or `OPENAI_API_KEY`.

Continuity source: `image_factory/continuity/raven_alley_10f_v2_contract.yaml`

## V2 Strategy

The previous sequence had excellent rain-noir texture but drifted like ten separate shots. V2 is one master continuity plate plus small edit-like moves. Frame 01 must be strong enough to become the physical source for the whole sequence. Frames 02-10 should be prompted as edits or crops of the accepted previous image, preserving architecture before changing action.

Core corrections:

- Keep S1 as a small distant left-wall lamp, not a giant foreground lamp.
- Keep D1 as the same arched service door, never a new rectangular door.
- Keep T1 as a very thin wet thread, not a thick red cable.
- Keep C1 as a tiny flat blue shard, not a glowing jewel.
- Avoid true reverse-angle rebuilds; use shallow over-door angles that keep the right curb and right facade visible.
- Keep raven action near W1/L1 for stronger continuity; no dominant lamp-perch close-up.

## Master Prompt Block

```text
Use case: illustration-story.
Asset type: finished widescreen visual novel CG, 16:9 landscape.
Style: cinematic hyperreal dark Swiss rain-noir in fictional Elf town with Zurich old-town and Winterthur industrial restraint; wet black stone, heavy rain, reflective cobblestones, old Swiss masonry, cold silver highlights, restrained practical light, museum-quality production design.

Master continuity plate: one narrow alley, south alley mouth looking north with slight right-wall bias. East/right facade contains exactly one hero dark rectangular window W1 with exterior horizontal blinds B1; shallow wet stone ledge L1 directly below W1; old drainpipe P1 immediately beside W1; small nail N1 under L1; very thin wet red thread T1 tied to N1, dropping down the right wall seam, running along the wet right curb, rising along D1 door crack, looping around H1. Farther down the same east/right facade is D1, the same dark arched service door with low iron ring H1. Center gutter near D1 contains C1, a tiny flat cold-blue glass shard, only a small glint. West/left wall deep in the alley contains S1, a small wall-mounted old Swiss streetlamp on a bracket, distant scale only. F1 is a small anonymous human silhouette under or near S1. R1 is one realistic black raven, normal scale, glossy wet feathers, tiny violet eye accent.

V2 continuity behavior: frame 01 is the master plate. Later frames must behave like edit/crop/dolly variants of the accepted previous image, preserving architectural silhouette, vanishing point, wall order, object order, rain direction, and light sources. Do not rebuild the location.

Palette: 65-70% monochrome graphite / wet charcoal / black stone / cold silver rain; 30-35% controlled narrative color only: violet raven eye, amber blind slits, very thin red thread, small yellow lamp reflection, tiny blue glass glint.

Hard negatives: no readable text, signage, logos, watermark, cyberpunk neon, cute fantasy village, gore, weapons, monster raven, extra raven, random new windows, new ledges, new doors, new pipes, giant foreground lamp, thick red cable, glowing blue jewel, mirrored alley, decorative colored glow.
```

## Frame Sequence

1. `raven_alley_10f_v2_frame_01_master_plate`  
   Generate a clean master continuity plate. All anchors must be visible and modestly scaled. R1 perches on exact L1. S1 stays small and distant. T1 is hair-thin, wet, traceable but not graphic. C1 is tiny.

2. `raven_alley_10f_v2_frame_02_sill_crop`  
   Edit/crop frame 01, push 15-20% toward W1/L1. Keep D1/S1/F1 in depth. Do not change wall order.

3. `raven_alley_10f_v2_frame_03_wing_prep`  
   Edit frame 02. R1 half-opens wings while still on L1. Thread and ledge unchanged.

4. `raven_alley_10f_v2_frame_04_short_launch`  
   Edit frame 03. R1 just leaves L1, only a short distance from the window; W1/L1 remain in frame.

5. `raven_alley_10f_v2_frame_05_mid_alley_cross`  
   Small pan/dolly. R1 crosses mid-alley, not landing on lamp. D1/H1 and S1/F1 remain anchors.

6. `raven_alley_10f_v2_frame_06_gutter_evidence`  
   Low crop from same set. Follow T1 along right curb to tiny C1 near D1. No new architecture.

7. `raven_alley_10f_v2_frame_07_door_endpoint`  
   Crop along same right facade to D1/H1. Thread rises along door crack and loops ring. W1/L1 visible behind or reflected.

8. `raven_alley_10f_v2_frame_08_ring_closeup`  
   Tight close-up of exact D1/H1/T1/C1. No face, no new prop, no readable mark.

9. `raven_alley_10f_v2_frame_09_shallow_lookback`  
   Shallow over-door lookback along the same right curb toward W1/L1. Avoid full reverse-angle rebuild.

10. `raven_alley_10f_v2_frame_10_return_plate`  
    Return to frame 01 composition. R1 back on exact L1. All anchors visible. No new final clue.
