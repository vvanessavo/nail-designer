// The "recipe" for a design: a plain-language list of what's on each nail, so a nail artist
// can recreate the set. Nails with the same design are grouped ("All nails", "Both ring
// fingers"...). Drawn under the hands when saving "Picture + recipe".

import { nailName, type Design, type Nail } from './state/nailState'
import { STICKERS } from './stickers'

export type RecipeGroup = {
  nails: string // which nails, e.g. "Both ring fingers"
  lines: string[] // what's on them
}

// Names for the colours offered as swatches, so the recipe can say "Red" not just a code.
const COLOUR_NAMES: Record<string, string> = {
  '#F6DCD6': 'Natural',
  '#D7263D': 'Red',
  '#F28C28': 'Orange',
  '#F6D13A': 'Yellow',
  '#3BAA5C': 'Green',
  '#2F6FDE': 'Blue',
  '#3F3A9E': 'Indigo',
  '#8E44AD': 'Violet',
  '#7B4A2D': 'Brown',
  '#1C1C1C': 'Black',
  '#FFFFFF': 'White',
  '#D4AF37': 'Gold',
  '#C0C0C0': 'Silver',
}

export function colourName(hex: string): string {
  const name = COLOUR_NAMES[hex.toUpperCase()]
  return name ? `${name} (${hex.toUpperCase()})` : hex.toUpperCase()
}

const SHAPE_NAMES: Record<Nail['shape'], string> = {
  round: 'Round',
  square: 'Square',
  almond: 'Almond',
  coffin: 'Coffin',
  stiletto: 'Stiletto',
  squoval: 'Squoval',
  natural: 'Natural',
}

function lengthName(length: number): string {
  if (length < 0.8) return 'short'
  if (length <= 1.2) return 'medium length'
  return 'long'
}

const STICKER_LABELS = Object.fromEntries(STICKERS.map((s) => [s.type, s.label.toLowerCase()]))

// The recipe lines for one nail. Positions don't matter here, only what's there.
function describe(nail: Nail): string[] {
  const lines = [`${SHAPE_NAMES[nail.shape]}, ${lengthName(nail.length)}`]
  const effect =
    nail.baseEffect === 'plain'
      ? ''
      : nail.baseEffect === 'ombre'
        ? `, ombre to ${colourName(nail.effectColor)} at the tip`
        : nail.baseEffect === 'glitter'
          ? `, with ${colourName(nail.effectColor)} glitter`
          : `, ${nail.baseEffect}`
  lines.push(`Polish: ${colourName(nail.baseColor)}${effect}, ${nail.finish}`)
  if (nail.hasFrenchTip) {
    const depth = nail.frenchTipThickness < 0.6 ? 'thin' : nail.frenchTipThickness > 1 ? 'deep' : 'classic'
    lines.push(`French tip: ${colourName(nail.frenchTipColor)}, ${depth}`)
  }
  const stickers = nail.stickers.filter((s) => s.type !== 'text')
  if (stickers.length > 0) {
    // Count each kind of sticker in each colour, e.g. "2 × cherries (Red)".
    const counts = new Map<string, number>()
    for (const s of stickers) {
      const key = `${STICKER_LABELS[s.type]} (${colourName(s.color)})`
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }
    lines.push(`Stickers: ${[...counts].map(([key, count]) => (count > 1 ? `${count} × ${key}` : key)).join(', ')}`)
  }
  for (const s of nail.stickers.filter((s) => s.type === 'text')) {
    lines.push(`Text: "${s.text}" (${s.font === 'bold' ? 'bold' : 'script'}, ${colourName(s.color)})`)
  }
  if (nail.strokes.length > 0) {
    lines.push(`Hand-painted art: ${nail.strokes.length} ${nail.strokes.length === 1 ? 'line' : 'lines'} (see picture)`)
  }
  return lines
}

// Readable names for a group of nails.
function nailsLabel(ids: number[]): string {
  if (ids.length === 10) return 'All nails'
  // A finger on both hands: nail i and nail 9 - i.
  const names: string[] = []
  const used = new Set<number>()
  for (const id of ids) {
    if (used.has(id)) continue
    const pair = 9 - id
    if (ids.includes(pair) && pair !== id) {
      const finger = nailName(Math.min(id, pair)).replace('left ', '')
      names.push(`both ${finger.endsWith('y') ? `${finger.slice(0, -1)}ies` : `${finger}s`}`)
      used.add(id).add(pair)
    } else {
      names.push(nailName(id))
      used.add(id)
    }
  }
  const text = names.join(', ')
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function designRecipe(design: Design): RecipeGroup[] {
  const groups = new Map<string, { ids: number[]; lines: string[] }>()
  for (const nail of design.nails) {
    const lines = describe(nail)
    const key = lines.join('\n')
    const group = groups.get(key)
    if (group) group.ids.push(nail.id)
    else groups.set(key, { ids: [nail.id], lines })
  }
  return [...groups.values()].map(({ ids, lines }) => ({ nails: nailsLabel(ids), lines }))
}
