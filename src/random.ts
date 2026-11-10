// A pseudo-random number generator that always gives the same numbers for the same seed, so
// a nail's glitter or texture doesn't jump around every time something is redrawn.
export function seeded(seed: number) {
  let value = seed * 9301 + 49297
  return () => {
    value = (value * 9301 + 49297) % 233280
    return value / 233280
  }
}
