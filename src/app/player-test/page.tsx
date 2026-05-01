import { NightGate } from "@/components/night-gate/NightGate";
import { PlayerRuntime } from "@/components/player/PlayerRuntime";
import { createVerticalSliceStory } from "@/lib/data/injectVerticalSlice";

export default function PlayerTestPage() {
  const developerOverride = process.env.NEXT_PUBLIC_NIGHT_GATE_OVERRIDE === "true";
  const story = createVerticalSliceStory();

  // Inject the player test suffix for the HUD
  story.title = `${story.title} // Player Test`;

  return (
    <NightGate developerOverride={developerOverride}>
      <PlayerRuntime story={story} />
    </NightGate>
  );
}
