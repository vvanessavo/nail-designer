// Small helpers for mixing colours, used to shade chrome and glitter from the polish colour,
// and to work out the hand's colour from the skin tone, undertone and grayscale setting.

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
// The colour the hand is drawn in. Warm leans golden, cool leans pink, neutral is the tone as
// picked. Grayscale keeps how light or dark the skin is, without its colour.
export function handColour(skinTone: string, undertone: 'warm' | 'neutral' | 'cool', grayscale: boolean): string {
  const tone = undertone === 'warm' ? mix(skinTone, '#E0A84A', 0.18) : undertone === 'cool' ? mix(skinTone, '#D07A8E', 0.18) : skinTone
  if (!grayscale) return tone
  const [r, g, b] = toRgb(tone)
  const grey = Math.round(0.299 * r + 0.587 * g + 0.114 * b)
  return mix('#000000', '#ffffff', grey / 255)
}

export const darken = (hex: string, amount: number) => mix(hex, '#000000', amount)
