// Small helpers for mixing colours, used to shade chrome and glitter from the polish colour.

function toRgb(hex: string): [number, number, number] {
  const value = hex.replace('#', '')
  const full = value.length === 3 ? [...value].map((c) => c + c).join('') : value
  const n = parseInt(full.slice(0, 6), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

// A colour `amount` of the way (0 to 1) from `hex` to `other`.
export function mix(hex: string, other: string, amount: number): string {
  const a = toRgb(hex)
  const b = toRgb(other)
  const channel = (i: number) => Math.round(a[i] + (b[i] - a[i]) * amount)
  return `#${[0, 1, 2].map((i) => channel(i).toString(16).padStart(2, '0')).join('')}`
}

export const lighten = (hex: string, amount: number) => mix(hex, '#ffffff', amount)
export const darken = (hex: string, amount: number) => mix(hex, '#000000', amount)
