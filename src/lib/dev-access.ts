// Temporary development escape hatch.
// Keep this OFF in any shared, preview, or production environment.
export function isDeveloperBypassEnabled() {
  return process.env.NEXT_PUBLIC_MIDNIGHT_DEV_UNLOCK === "true";
}
