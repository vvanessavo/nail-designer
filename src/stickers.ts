// The nail art you can place: drawn to look like what nail artists actually do in a salon,
// not like emoji. Four kinds:
// - Gems: rhinestones, pearls and studs, faceted and shiny.
// - Chrome: 3D pieces in mirror-shiny metal (hearts, stars, liquid-chrome blobs, swirls).
// - Gel: 3D pieces sculpted in gel, glossy and a little see-through (bows, flowers, droplets).
// - Painted: fine, delicate hand-painted art (thin lines, tiny flowers, dainty fruit).
//
// Each piece is a small stack of shapes ("layers") on a 24 x 24 grid, centred on (12, 12).
// A layer is painted in the piece's main colour ('main', which the user can change), a lighter
// or darker shade of it ('main-light', 'main-dark'), its own fixed colour, or a gradient of
// those (how chrome gets its mirror bands). So recolouring keeps the shading looking right.

import { darken, lighten } from './colour'
import type { Sticker, TextFont } from './state/nailState'

// The drawn pieces. Text is a sticker too ('text'), but it's written, not drawn.
export type StickerType = Exclude<Sticker['type'], 'text'>

// Text on a nail: the longest it can be, its starting colour, its size and its fonts
// (loaded in index.html).
export const TEXT_MAX_LENGTH = 12
export const TEXT_COLOR = '#1C1C1C'
export const TEXT_SIZE = 10 // font size, in the 24 x 24 sticker grid
export const TEXT_FONTS: Record<TextFont, string> = {
  script: '"Dancing Script", cursive',
  bold: 'Nunito, sans-serif',
}

// Every piece is drawn on a 24 x 24 grid, centred on (12, 12).
export const STICKER_SIZE = 24

// A colour, by name: 'main' (the chosen colour), 'main-light', 'main-dark', or a fixed colour.
type Colour = string

// A straight fade between colours, from one point to another on the 24 x 24 grid.
// stops: [position (0 to 1), colour] pairs.
export type Gradient = { from: [number, number]; to: [number, number]; stops: [number, Colour][] }

export type StickerLayer = {
  d: string // the outline, as SVG path text
  fill?: Colour | Gradient
  stroke?: Colour | Gradient
  strokeWidth?: number
  opacity?: number
  shift?: [number, number] // moves the layer by this much (x, y), e.g. for a shadow
}

export type StickerGroup = 'Gems' | 'Chrome' | 'Gel' | 'Painted'

export type StickerDesign = {
  type: StickerType
  label: string
  group: StickerGroup
  defaultColor: string // the main colour it comes in
  layers: StickerLayer[]
}

// A colour name turned into a real colour, for a piece in `mainColor`.
function resolve(colour: Colour, mainColor: string): string {
  if (colour === 'main') return mainColor
  if (colour === 'main-light') return lighten(mainColor, 0.65)
  if (colour === 'main-dark') return darken(mainColor, 0.45)
  return colour
}

// A layer's fill or outline as a single colour (undefined for none or for a gradient).
export function paint(value: Colour | Gradient | undefined, mainColor: string): string | undefined {
  return typeof value === 'string' ? resolve(value, mainColor) : undefined
}

// A gradient's stops with real colours.
export function gradientStops(gradient: Gradient, mainColor: string): [number, string][] {
  return gradient.stops.map(([at, colour]) => [at, resolve(colour, mainColor)])
}

// Konva's settings for a layer's fill and outline, gradients included (see Hand.tsx).
export function konvaPaint(layer: StickerLayer, mainColor: string) {
  const settings: Record<string, unknown> = {}
  for (const part of ['fill', 'stroke'] as const) {
    const value = layer[part]
    if (value === undefined) continue
    if (typeof value === 'string') {
      settings[part] = resolve(value, mainColor)
    } else {
      settings[`${part}LinearGradientStartPoint`] = { x: value.from[0], y: value.from[1] }
      settings[`${part}LinearGradientEndPoint`] = { x: value.to[0], y: value.to[1] }
      settings[`${part}LinearGradientColorStops`] = gradientStops(value, mainColor).flat()
      if (part === 'fill') settings.fillPriority = 'linear-gradient'
      if (part === 'stroke') settings.strokePriority = 'linear-gradient'
    }
  }
  return settings
}

// Fixed colours.
const WHITE = '#FFFFFF'
const YELLOW = '#F2C14E'
const SAGE = '#6E8B5E' // a soft, muted leaf green, the one nail artists use
const LEAF_DARK = '#4E6B44'
const SHADOW = 'rgba(0, 0, 0, 0.26)' // a piece's shadow on the nail
const SOFT_SHADOW = 'rgba(0, 0, 0, 0.14)'

// --- Small helpers to build outlines ---------------------------------------------------------

type Point = [number, number]
const fmt = (n: number) => Number(n.toFixed(2))
const pt = (p: Point) => p.map(fmt).join(' ')

// Turns a point around (cx, cy) by `degrees`.
function turn([x, y]: Point, degrees: number, cx = 12, cy = 12): Point {
  const a = (degrees * Math.PI) / 180
  const dx = x - cx
  const dy = y - cy
  return [cx + dx * Math.cos(a) - dy * Math.sin(a), cy + dx * Math.sin(a) + dy * Math.cos(a)]
}

function circle(cx: number, cy: number, r: number): string {
  return `M ${fmt(cx - r)} ${fmt(cy)} A ${fmt(r)} ${fmt(r)} 0 1 0 ${fmt(cx + r)} ${fmt(cy)} A ${fmt(r)} ${fmt(r)} 0 1 0 ${fmt(cx - r)} ${fmt(cy)} Z`
}

// An ellipse centred on (cx, cy), long axis turned by `degrees` from vertical.
function ellipse(cx: number, cy: number, rx: number, ry: number, degrees = 0): string {
  const top = turn([cx, cy - ry], degrees, cx, cy)
  const bottom = turn([cx, cy + ry], degrees, cx, cy)
  return `M ${pt(top)} A ${rx} ${ry} ${degrees} 1 0 ${pt(bottom)} A ${rx} ${ry} ${degrees} 1 0 ${pt(top)} Z`
}

// A petal: pointed at the middle (cx, cy), round at the far end, `length` long, pointing
// `degrees` round from straight up.
function petal(cx: number, cy: number, length: number, width: number, degrees: number): string {
  const p = (x: number, y: number) => pt(turn([cx + x, cy - y], degrees, cx, cy))
  const w = width / 2
  return (
    `M ${p(0, 0)} C ${p(-w * 1.2, length * 0.35)} ${p(-w, length)} ${p(0, length)} ` +
    `C ${p(w, length)} ${p(w * 1.2, length * 0.35)} ${p(0, 0)} Z`
  )
}

// A four-point sparkle centred on (cx, cy): long thin rays.
function sparkle(cx: number, cy: number, r: number, thin = 0.14): string {
  const w = r * thin
  return (
    `M ${cx} ${cy - r} Q ${cx + w} ${cy - w} ${cx + r} ${cy} Q ${cx + w} ${cy + w} ${cx} ${cy + r} ` +
    `Q ${cx - w} ${cy + w} ${cx - r} ${cy} Q ${cx - w} ${cy - w} ${cx} ${cy - r} Z`
  )
}

// A five-point star centred on (cx, cy).
function star(cx: number, cy: number, outer: number, inner: number): string {
  const points = Array.from({ length: 10 }, (_, i) => turn([cx, cy - (i % 2 ? inner : outer)], i * 36, cx, cy))
  return `M ${points.map(pt).join(' L ')} Z`
}

// The corners of a regular polygon around (cx, cy), starting at the top.
function polygonPoints(sides: number, radius: number, offsetDegrees = 0, cx = 12, cy = 12): Point[] {
  return Array.from({ length: sides }, (_, i) => turn([cx, cy - radius], (360 / sides) * i + offsetDegrees, cx, cy))
}
const polygon = (points: Point[]) => `M ${points.map(pt).join(' L ')} Z`
const lines = (pairs: [Point, Point][]) => pairs.map(([a, b]) => `M ${pt(a)} L ${pt(b)}`).join(' ')

const around = (count: number, make: (degrees: number) => string, offset = 0) =>
  Array.from({ length: count }, (_, i) => make((360 / count) * i + offset)).join(' ')

// The heart shape, centred on (cx, cy), `size` wide.
function heart(cx: number, cy: number, size: number): string {
  const s = size / 17
  const p = (x: number, y: number) => `${fmt(cx + (x - 12) * s)} ${fmt(cy + (y - 12) * s)}`
  return (
    `M ${p(12, 20.2)} C ${p(4.4, 15.2)} ${p(3, 10.8)} ${p(4.6, 7.4)} C ${p(6.4, 4.2)} ${p(10.4, 4.4)} ${p(12, 7.6)} ` +
    `C ${p(13.6, 4.4)} ${p(17.6, 4.2)} ${p(19.4, 7.4)} C ${p(21, 10.8)} ${p(19.6, 15.2)} ${p(12, 20.2)} Z`
  )
}

// --- Gems --------------------------------------------------------------------------------
// A soft shadow, the stone in its main colour, see-through light and dark facets (so any
// colour works) and a bright highlight.

const FACET_LIGHT = 'rgba(255, 255, 255, 0.4)'
const FACET_DARK = 'rgba(0, 0, 0, 0.2)'
const FACET_LINE = 'rgba(255, 255, 255, 0.55)'
const RIM = 'rgba(255, 255, 255, 0.6)'

// A round brilliant-cut stone of radius r at (cx, cy).
function roundStone(cx: number, cy: number, r: number): StickerLayer[] {
  const table = polygonPoints(8, r * 0.5, 22.5, cx, cy)
  const edge = polygonPoints(8, r * 0.98, 22.5, cx, cy)
  return [
    { d: circle(cx + r * 0.1, cy + r * 0.12, r), fill: SHADOW },
    { d: circle(cx, cy, r), fill: 'main' },
    { d: `M ${cx} ${cy} L ${fmt(cx + r)} ${cy} A ${r} ${r} 0 0 1 ${cx} ${fmt(cy + r)} Z`, fill: FACET_DARK },
    { d: polygon(table), fill: FACET_LIGHT },
    { d: lines(table.map((p, i) => [p, edge[i]])), stroke: FACET_LINE, strokeWidth: r * 0.045 },
    { d: circle(cx, cy, r), stroke: RIM, strokeWidth: r * 0.06 },
    { d: sparkle(cx - r * 0.35, cy - r * 0.4, r * 0.32, 0.22), fill: WHITE },
  ]
}

const TEARDROP = 'M 12 2.6 C 15.6 8 19.2 11.8 19.2 15.2 A 7.2 7.2 0 0 1 4.8 15.2 C 4.8 11.8 8.4 8 12 2.6 Z'
const GEM_TEARDROP: StickerLayer[] = [
  { d: TEARDROP, fill: SHADOW, shift: [0.9, 0.8] },
  { d: TEARDROP, fill: 'main' },
  { d: 'M 12 15.2 L 19.2 15.2 A 7.2 7.2 0 0 1 12 22.4 Z', fill: FACET_DARK },
  { d: 'M 12 8 C 14 11 15.6 13 15.6 15 A 3.6 3.6 0 0 1 8.4 15 C 8.4 13 10 11 12 8 Z', fill: FACET_LIGHT },
  { d: 'M 12 2.6 L 12 8 M 4.8 15.2 L 8.4 15 M 19.2 15.2 L 15.6 15 M 12 22.4 L 12 18.6', stroke: FACET_LINE, strokeWidth: 0.4 },
  { d: TEARDROP, stroke: RIM, strokeWidth: 0.5 },
  { d: sparkle(9.4, 12.6, 2.4, 0.22), fill: WHITE },
]

const SQUARE = 'M 3.6 3.6 L 20.4 3.6 L 20.4 20.4 L 3.6 20.4 Z'
const GEM_SQUARE: StickerLayer[] = [
  { d: SQUARE, fill: SHADOW, shift: [0.8, 0.8] },
  { d: SQUARE, fill: 'main' },
  { d: 'M 20.4 3.6 L 20.4 20.4 L 3.6 20.4 Z', fill: FACET_DARK },
  { d: 'M 8.2 8.2 L 15.8 8.2 L 15.8 15.8 L 8.2 15.8 Z', fill: FACET_LIGHT },
  { d: 'M 3.6 3.6 L 8.2 8.2 M 20.4 3.6 L 15.8 8.2 M 20.4 20.4 L 15.8 15.8 M 3.6 20.4 L 8.2 15.8', stroke: FACET_LINE, strokeWidth: 0.4 },
  { d: SQUARE, stroke: RIM, strokeWidth: 0.5 },
  { d: sparkle(7.4, 7.2, 2.4, 0.22), fill: WHITE },
]

// A pearl of radius r: smooth, a soft shade low on the right, a gentle glow at the top left.
function pearl(cx: number, cy: number, r: number): StickerLayer[] {
  return [
    { d: circle(cx + r * 0.1, cy + r * 0.13, r), fill: SHADOW },
    {
      d: circle(cx, cy, r),
      fill: { from: [cx - r, cy - r], to: [cx + r, cy + r], stops: [[0, 'main-light'], [0.55, 'main'], [1, 'main-dark']] },
    },
    { d: ellipse(cx - r * 0.3, cy - r * 0.32, r * 0.36, r * 0.46, 40), fill: WHITE, opacity: 0.5 },
    { d: circle(cx - r * 0.36, cy - r * 0.42, r * 0.13), fill: WHITE, opacity: 0.95 },
  ]
}

// A small metal stud: a domed disc with a bright highlight.
const STUD: StickerLayer[] = [
  { d: circle(12.7, 12.8, 6.4), fill: SHADOW },
  {
    d: circle(12, 12, 6.4),
    fill: { from: [6, 6], to: [18, 18], stops: [[0, 'main-light'], [0.45, 'main'], [1, 'main-dark']] },
  },
  { d: circle(12, 12, 6.4), stroke: 'rgba(0, 0, 0, 0.25)', strokeWidth: 0.4 },
  { d: ellipse(10, 9.4, 1.4, 2.4, 50), fill: WHITE, opacity: 0.85 },
]

// Small round stones in a cluster, biggest in the middle: the classic placement near the cuticle.
const GEM_CLUSTER: StickerLayer[] = [
  ...roundStone(12, 12, 4.6),
  ...roundStone(5.6, 14.4, 2.8),
  ...roundStone(18.2, 9.4, 2.6),
  ...roundStone(17.4, 16.6, 2),
  ...roundStone(7.4, 7.4, 1.8),
]

// --- Chrome and metal (3D) ---------------------------------------------------------------
// Mirror-shiny metal: bands of light and dark across the piece (a gradient of the main colour),
// a darker rim, crisp white highlights, and a small shadow on the nail.

const CHROME_BANDS: [number, Colour][] = [
  [0, 'main-light'],
  [0.28, 'main'],
  [0.42, 'main-dark'],
  [0.58, 'main-light'],
  [0.78, 'main'],
  [1, 'main-dark'],
]
const chromeFill = (from: Point, to: Point): Gradient => ({ from, to, stops: CHROME_BANDS })

// A chrome piece from one outline: shadow, mirror bands, rim, and highlights.
function chrome(outline: string, highlights: StickerLayer[], from: Point = [5, 4], to: Point = [19, 20]): StickerLayer[] {
  return [
    { d: outline, fill: SHADOW, shift: [0.7, 1] },
    { d: outline, fill: chromeFill(from, to) },
    { d: outline, stroke: 'main-dark', strokeWidth: 0.45 },
    ...highlights,
  ]
}

const CHROME_HEART = chrome(heart(12, 12.4, 17), [
  { d: ellipse(8.2, 8.6, 1.1, 2.4, 35), fill: WHITE, opacity: 0.85 },
  { d: circle(16.4, 8.2, 0.7), fill: WHITE, opacity: 0.9 },
  { d: 'M 12.6 18.6 C 15.6 16.6 17.8 14.4 18.6 12', stroke: WHITE, strokeWidth: 0.5, opacity: 0.6 },
])

// A plump star with rounded points, like a chrome star charm.
const STAR_OUTLINE = star(12, 12.4, 10, 4.8)
const CHROME_STAR = [
  ...chrome(STAR_OUTLINE, [
    { d: lines(polygonPoints(5, 9.4, 0, 12, 12.4).map((p) => [[12, 12.4], p])), stroke: 'rgba(255, 255, 255, 0.7)', strokeWidth: 0.4 },
    { d: ellipse(10.2, 7.6, 0.7, 1.9, 18), fill: WHITE, opacity: 0.9 },
  ]),
]

// A liquid-chrome blob: a soft, melted-metal puddle, wider at the bottom.
const BLOB = 'M 11.4 4 C 15.2 3.4 18.4 5.6 18.6 8.8 C 18.8 11.2 20.4 12.6 20 15.4 C 19.6 18.8 16.4 20.4 12.6 20.2 C 8.4 20 4.4 19 4.2 15.4 C 4 12.8 6 11.8 6.2 9.4 C 6.4 6.4 8.2 4.4 11.4 4 Z'
const CHROME_BLOB = chrome(BLOB, [
  { d: 'M 9 6.6 C 7.8 8.2 7.8 10.2 8.4 11.6', stroke: WHITE, strokeWidth: 1.1, opacity: 0.85 },
  { d: circle(15.4, 7, 0.8), fill: WHITE, opacity: 0.9 },
  { d: 'M 13.8 19.2 C 16.2 19 18.4 17.6 18.8 15.2', stroke: WHITE, strokeWidth: 0.5, opacity: 0.6 },
])

// A raised liquid-chrome swirl line.
const SWIRL_LINE = 'M 4.6 18 C 4.4 10 12 5.6 16.6 8.6 C 20 10.8 18.6 15.8 14.6 15.6 C 11.6 15.4 11.4 12 13.8 11.4'
const CHROME_SWIRL: StickerLayer[] = [
  { d: SWIRL_LINE, stroke: SHADOW, strokeWidth: 2.6, shift: [0.6, 0.8] },
  { d: SWIRL_LINE, stroke: chromeFill([4, 6], [20, 18]), strokeWidth: 2.4 },
  { d: SWIRL_LINE, stroke: WHITE, strokeWidth: 0.5, opacity: 0.75, shift: [-0.45, -0.45] },
]

// A thin chrome line that curves across the nail, for a chrome French tip line.
const TIP_LINE = 'M 2.6 15.4 Q 12 6.4 21.4 15.4'
const CHROME_LINE: StickerLayer[] = [
  { d: TIP_LINE, stroke: SHADOW, strokeWidth: 1.4, shift: [0.4, 0.5] },
  { d: TIP_LINE, stroke: chromeFill([3, 10], [21, 14]), strokeWidth: 1.3 },
  { d: TIP_LINE, stroke: WHITE, strokeWidth: 0.3, opacity: 0.8, shift: [0, -0.3] },
]

// A metal bow charm: two loops, a knot and two tails, in mirror-shiny metal.
const BOW_LOOPS = `${ellipse(7.2, 10.2, 3.2, 5, -64)} ${ellipse(16.8, 10.2, 3.2, 5, 64)}`
const BOW_TAILS = 'M 10.8 12.2 L 8 20.4 L 9.8 19.6 L 10.8 21.2 L 12.4 12.8 Z M 13.2 12.2 L 16 20.4 L 14.2 19.6 L 13.2 21.2 L 11.6 12.8 Z'
const BOW_KNOT = ellipse(12, 11, 2.2, 2.6)
const CHARM_BOW = [
  ...chrome(`${BOW_TAILS} ${BOW_LOOPS}`, [
    { d: ellipse(6.4, 8.4, 0.7, 2.2, -64), fill: WHITE, opacity: 0.85 },
    { d: ellipse(15.6, 8.4, 0.7, 2.2, 64), fill: WHITE, opacity: 0.85 },
  ], [3, 5], [21, 17]),
  // The loops' inner holes, seen through the metal.
  { d: `${ellipse(7.6, 10.4, 1, 2.2, -64)} ${ellipse(16.4, 10.4, 1, 2.2, 64)}`, fill: 'main-dark', opacity: 0.55 },
  ...chrome(BOW_KNOT, [{ d: circle(11.3, 10, 0.6), fill: WHITE, opacity: 0.9 }], [10, 8], [14, 14]),
]

// --- Gel (3D) ----------------------------------------------------------------------------
// Sculpted in gel: smooth, glossy and a little see-through, with a soft shadow and a long
// gloss highlight.

// A gel piece from one outline. `clear` makes it more see-through.
function gel(outline: string, highlights: StickerLayer[], clear = 0.85): StickerLayer[] {
  return [
    { d: outline, fill: SOFT_SHADOW, shift: [0.8, 1.1] },
    { d: outline, fill: { from: [6, 4], to: [18, 20], stops: [[0, 'main-light'], [0.5, 'main'], [1, 'main-dark']] }, opacity: clear },
    { d: outline, stroke: 'main-dark', strokeWidth: 0.3, opacity: 0.5 },
    ...highlights,
  ]
}

// A clear gel water droplet: almost see-through, with a bright highlight and a light glint
// on the shadow side, like a real drop of water.
const DROP = 'M 12 3.4 C 15.6 7.8 18.6 11.4 18.6 14.6 A 6.6 6.6 0 0 1 5.4 14.6 C 5.4 11.4 8.4 7.8 12 3.4 Z'
const WATER_DROP: StickerLayer[] = [
  { d: DROP, fill: 'rgba(0, 0, 0, 0.12)', shift: [0.9, 1.2] },
  { d: DROP, fill: 'main', opacity: 0.22 },
  { d: 'M 18.6 14.6 A 6.6 6.6 0 0 1 9 20.4 C 13.6 20.2 17.4 17.6 18.6 14.6 Z', fill: 'rgba(0, 0, 0, 0.14)' },
  { d: DROP, stroke: WHITE, strokeWidth: 0.4, opacity: 0.8 },
  { d: ellipse(9.4, 12.4, 1.1, 2.6, 22), fill: WHITE, opacity: 0.95 },
  { d: circle(15.2, 17.6, 0.9), fill: WHITE, opacity: 0.7 },
]

const GEL_BOW = [
  ...gel(`${BOW_TAILS} ${BOW_LOOPS}`, [
    { d: ellipse(6.2, 8.6, 0.8, 2.4, -64), fill: WHITE, opacity: 0.75 },
    { d: ellipse(15.8, 8.6, 0.8, 2.4, 64), fill: WHITE, opacity: 0.75 },
  ]),
  ...gel(BOW_KNOT, [{ d: circle(11.2, 10.1, 0.6), fill: WHITE, opacity: 0.9 }], 1),
]

// A 3D gel flower: five soft petals with a vein down each, and a crystal in the middle.
const GEL_PETALS = around(5, (deg) => petal(12, 12, 9, 7.4, deg))
const GEL_FLOWER: StickerLayer[] = [
  ...gel(GEL_PETALS, [
    { d: around(5, (deg) => `M ${pt(turn([12, 9.6], deg))} L ${pt(turn([12, 5.4], deg))}`), stroke: 'main-dark', strokeWidth: 0.35, opacity: 0.45 },
    { d: around(5, (deg) => ellipse(...turn([10.6, 5.8], deg), 0.5, 1.4, deg - 15)), fill: WHITE, opacity: 0.7 },
  ]),
  ...roundStone(12, 12, 2.6).map((layer) => (layer.fill === 'main' ? { ...layer, fill: '#F4F7FB' } : layer)),
]

// Pearls of different sizes, grouped.
const PEARL_CLUSTER = [...pearl(8.2, 14, 4.4), ...pearl(15.6, 9.6, 3.6), ...pearl(16, 17, 2.6), ...pearl(9.4, 6.8, 2.2)]

// --- Hand-painted ------------------------------------------------------------------------
// Fine and delicate, like a nail artist's brush: thin lines, small shapes, no heavy outlines.

const HAIRLINE = 0.45 // the finest painted line

// A tiny painted daisy: thin white petals and a yellow middle.
const DAISY: StickerLayer[] = [
  { d: around(10, (deg) => petal(12, 12, 8.6, 2.6, deg)), fill: 'main' },
  { d: around(10, (deg) => petal(12, 12, 8.6, 2.6, deg)), stroke: 'rgba(0, 0, 0, 0.16)', strokeWidth: 0.25 },
  { d: circle(12, 12, 2.2), fill: YELLOW },
  { d: circle(12.5, 12.5, 1.1), fill: 'rgba(160, 100, 20, 0.35)' },
]

// A dotting-tool flower: five round dots and a dot in the middle, the most classic nail art.
const DOT_FLOWER: StickerLayer[] = [
  { d: around(5, (deg) => circle(...turn([12, 7.4], deg), 3)), fill: 'main' },
  { d: around(5, (deg) => circle(...turn([12, 7.4], deg), 3)), stroke: 'rgba(0, 0, 0, 0.12)', strokeWidth: 0.25 },
  { d: circle(12, 12, 2.1), fill: YELLOW },
]

// A "blooming gel" flower: soft petals where the colour spreads out from a deeper middle, like
// colour dropped into wet gel, with a few fine lines and dots.
const BLOOM: StickerLayer[] = [
  { d: around(5, (deg) => petal(12, 12, 9.4, 8.6, deg)), fill: 'main', opacity: 0.4 },
  { d: around(5, (deg) => petal(12, 12, 6.4, 5.6, deg)), fill: 'main', opacity: 0.45 },
  { d: around(5, (deg) => petal(12, 12, 3.6, 3, deg)), fill: 'main-dark', opacity: 0.45 },
  { d: around(5, (deg) => `M 12 12 L ${pt(turn([12, 5], deg))}`), stroke: 'main-dark', strokeWidth: HAIRLINE * 0.6, opacity: 0.5 },
  { d: around(5, (deg) => circle(...turn([12, 9], deg), 0.45), 36), fill: YELLOW },
]

// A painted cherry blossom: five notched petals, fine lines from the middle.
function blossomPetal(degrees: number): string {
  const p = (x: number, y: number) => pt(turn([x, y], degrees))
  return `M ${p(12, 12)} C ${p(8.4, 10.4)} ${p(8, 5.6)} ${p(10.6, 4)} C ${p(11.2, 4.6)} ${p(11.6, 5.2)} ${p(12, 5.6)} C ${p(12.4, 5.2)} ${p(12.8, 4.6)} ${p(13.4, 4)} C ${p(16, 5.6)} ${p(15.6, 10.4)} ${p(12, 12)} Z`
}
const BLOSSOM: StickerLayer[] = [
  { d: around(5, blossomPetal), fill: 'main' },
  { d: around(5, blossomPetal), fill: { from: [12, 4], to: [12, 12], stops: [[0, 'main-light'], [1, 'main']] }, opacity: 0.6 },
  { d: around(5, (deg) => `M 12 12 L ${pt(turn([12, 8.4], deg))}`, 36), stroke: 'main-dark', strokeWidth: HAIRLINE * 0.6, opacity: 0.7 },
  { d: around(5, (deg) => circle(...turn([12, 8.3], deg), 0.4), 36), fill: 'main-dark' },
  { d: circle(12, 12, 1), fill: 'main-dark', opacity: 0.8 },
]

// A painted rose: a scalloped bloom, petals curling round the middle in a deeper shade,
// light catching the petal edges, and two small leaves.
const ROSE_BLOOM = around(7, (deg) => circle(...turn([12, 7.6], deg), 3.4))
const ROSE: StickerLayer[] = [
  { d: `${ellipse(5.4, 17.8, 1.4, 3, -60)} ${ellipse(18.6, 17.8, 1.4, 3, 60)}`, fill: SAGE },
  { d: `${ROSE_BLOOM} ${circle(12, 12, 4.6)}`, fill: 'main' },
  { d: circle(12, 12, 4), fill: 'main-dark', opacity: 0.35 },
  {
    d: 'M 8.6 11.2 C 8.8 7.8 14.4 7.2 15.6 10.6 M 15.6 13 C 15 16.6 9.6 16.8 8.4 13.6 M 10.6 11.6 C 11 9.8 13.6 10 13.6 11.8 C 13.6 13.2 11.6 13.4 11.4 12.2',
    stroke: 'main-dark',
    strokeWidth: HAIRLINE * 1.3,
  },
  { d: 'M 7.4 9 C 8.4 6.2 11.6 5 14.4 5.8 M 17 14.4 C 16.4 17 14 18.6 11 18.4', stroke: 'main-light', strokeWidth: HAIRLINE, opacity: 0.8 },
]

// A fine leaf sprig: a thin curved stem with small leaves.
const VINE: StickerLayer[] = [
  { d: 'M 6 20.4 C 8 15 12.4 9.6 18.8 4.6', stroke: 'main', strokeWidth: HAIRLINE },
  {
    d: [
      ellipse(7.8, 15.6, 1.1, 2.5, -20),
      ellipse(10.2, 15.8, 1.1, 2.5, 70),
      ellipse(10.4, 11.6, 1, 2.3, -15),
      ellipse(13, 12, 1, 2.3, 75),
      ellipse(13.6, 7.8, 0.9, 2.1, -10),
      ellipse(16.2, 8.2, 0.9, 2.1, 80),
      ellipse(18.6, 4.2, 0.8, 1.7, 45),
    ].join(' '),
    fill: 'main',
  },
]

// A small painted heart: smooth, no outline, a little gloss.
const HEART: StickerLayer[] = [
  { d: heart(12, 12, 15), fill: 'main' },
  { d: ellipse(8.8, 9.4, 0.8, 1.6, 35), fill: WHITE, opacity: 0.55 },
]

// A sparkle: long, thin rays and a tiny companion.
const TWINKLE: StickerLayer[] = [
  { d: sparkle(11, 13, 8.4), fill: 'main' },
  { d: sparkle(18.4, 5.8, 3, 0.18), fill: 'main' },
  { d: circle(5.6, 5.4, 0.7), fill: 'main' },
]

// A scatter of tiny stars and dots.
const STARS: StickerLayer[] = [
  { d: [star(9, 9.4, 4.4, 1.9), star(16.6, 15.4, 3, 1.3), star(7.2, 18, 2, 0.9)].join(' '), fill: 'main' },
  { d: [circle(16.4, 6.4, 0.6), circle(19.6, 10.6, 0.45), circle(12.6, 19.4, 0.5), circle(4, 13, 0.45)].join(' '), fill: 'main' },
]

// A fine-line swirl, painted in one stroke.
const SWIRL: StickerLayer[] = [
  { d: 'M 3.6 19.4 C 5 10 13.6 4.4 18.4 8.4 C 21.4 11 19 15.8 15 15 C 12.2 14.4 12.4 11 14.8 10.8', stroke: 'main', strokeWidth: HAIRLINE * 1.4 },
]

// Dainty cherries: thin stems, a tiny leaf, glossy fruit.
const CHERRIES: StickerLayer[] = [
  { d: 'M 8.4 15.4 C 9.4 11 11.6 7.4 14.6 5.4 M 15.6 15.6 C 15.2 11.6 15 8.2 14.6 5.4', stroke: LEAF_DARK, strokeWidth: HAIRLINE },
  { d: ellipse(17, 5.4, 1.1, 2.6, 70), fill: SAGE },
  { d: `${circle(8.2, 17.4, 3.4)} ${circle(15.8, 17.6, 3.4)}`, fill: 'main' },
  { d: `${circle(8.2, 17.4, 3.4)} ${circle(15.8, 17.6, 3.4)}`, fill: { from: [5, 14], to: [19, 21], stops: [[0, 'main-light'], [0.45, 'main'], [1, 'main-dark']] }, opacity: 0.55 },
  { d: `${ellipse(7, 16.2, 0.6, 1, 35)} ${ellipse(14.6, 16.4, 0.6, 1, 35)}`, fill: WHITE, opacity: 0.85 },
]

// A small painted strawberry with tiny seeds and a leafy top.
const BERRY = 'M 12 21 C 7.4 18.4 5.4 13.8 6.4 10.6 C 7.2 8.2 10 7.6 12 8.6 C 14 7.6 16.8 8.2 17.6 10.6 C 18.6 13.8 16.6 18.4 12 21 Z'
const STRAWBERRY: StickerLayer[] = [
  { d: BERRY, fill: 'main' },
  { d: BERRY, fill: { from: [7, 9], to: [17, 20], stops: [[0, 'main-light'], [0.5, 'main'], [1, 'main-dark']] }, opacity: 0.45 },
  {
    d: [[9.4, 11.4], [12, 11.2], [14.6, 11.4], [8.6, 14], [11, 14.2], [13.4, 14.2], [15.6, 14], [10, 16.8], [12.4, 17], [14.4, 16.6], [12, 19.2]]
      .map(([x, y]) => ellipse(x, y, 0.28, 0.5))
      .join(' '),
    fill: '#F7E3A1',
  },
  { d: 'M 12 9.2 L 8.4 7.8 L 10.4 7 L 9.4 5.2 L 11.4 6.2 L 12 4.4 L 12.6 6.2 L 14.6 5.2 L 13.6 7 L 15.6 7.8 Z', fill: SAGE },
]

// A dainty ribbon bow painted in fine lines (the "coquette" bow).
const BOW: StickerLayer[] = [
  {
    d:
      'M 12 11.2 C 9.6 8.4 4.6 6.8 4.2 9.6 C 3.8 12.4 8.6 12.8 12 11.2 Z ' +
      'M 12 11.2 C 14.4 8.4 19.4 6.8 19.8 9.6 C 20.2 12.4 15.4 12.8 12 11.2 Z ' +
      'M 11.4 11.6 C 10.6 14 9.2 17.4 7.6 20 M 12.6 11.6 C 13.4 14 14.8 17.4 16.4 20',
    stroke: 'main',
    strokeWidth: HAIRLINE * 1.6,
  },
  { d: ellipse(12, 11.2, 1.1, 1.2), fill: 'main' },
]

// --- The list ----------------------------------------------------------------------------
// In the order shown in the Stickers tab: gems, chrome, gel, then painted art.

export const STICKERS: StickerDesign[] = [
  { type: 'gem-round', label: 'Round rhinestone', group: 'Gems', defaultColor: '#E6F1FA', layers: roundStone(12, 12, 8.8) },
  { type: 'gem-teardrop', label: 'Teardrop rhinestone', group: 'Gems', defaultColor: '#F2C6D6', layers: GEM_TEARDROP },
  { type: 'gem-square', label: 'Square rhinestone', group: 'Gems', defaultColor: '#BFD8F2', layers: GEM_SQUARE },
  { type: 'gem-cluster', label: 'Rhinestone cluster', group: 'Gems', defaultColor: '#E6F1FA', layers: GEM_CLUSTER },
  { type: 'pearl', label: 'Pearl', group: 'Gems', defaultColor: '#F6F0E6', layers: pearl(12, 12, 8.4) },
  { type: 'stud', label: 'Gold stud', group: 'Gems', defaultColor: '#D4AF37', layers: STUD },
  { type: 'chrome-heart', label: 'Chrome heart', group: 'Chrome', defaultColor: '#B9BEC6', layers: CHROME_HEART },
  { type: 'chrome-star', label: 'Chrome star', group: 'Chrome', defaultColor: '#B9BEC6', layers: CHROME_STAR },
  { type: 'chrome-blob', label: 'Liquid chrome', group: 'Chrome', defaultColor: '#B9BEC6', layers: CHROME_BLOB },
  { type: 'chrome-swirl', label: 'Chrome swirl', group: 'Chrome', defaultColor: '#D4AF37', layers: CHROME_SWIRL },
  { type: 'chrome-line', label: 'Chrome tip line', group: 'Chrome', defaultColor: '#B9BEC6', layers: CHROME_LINE },
  { type: 'charm-bow', label: 'Gold bow charm', group: 'Chrome', defaultColor: '#D4AF37', layers: CHARM_BOW },
  { type: 'water-drop', label: 'Water droplet', group: 'Gel', defaultColor: '#FFFFFF', layers: WATER_DROP },
  { type: 'gel-bow', label: 'Gel bow', group: 'Gel', defaultColor: '#F6D3DC', layers: GEL_BOW },
  { type: 'gel-flower', label: 'Gel flower', group: 'Gel', defaultColor: '#F7E9EE', layers: GEL_FLOWER },
  { type: 'pearl-cluster', label: 'Pearl cluster', group: 'Gel', defaultColor: '#F6F0E6', layers: PEARL_CLUSTER },
  { type: 'daisy', label: 'Daisy', group: 'Painted', defaultColor: WHITE, layers: DAISY },
  { type: 'dot-flower', label: 'Dot flower', group: 'Painted', defaultColor: WHITE, layers: DOT_FLOWER },
  { type: 'bloom', label: 'Blooming flower', group: 'Painted', defaultColor: '#D9649A', layers: BLOOM },
  { type: 'blossom', label: 'Cherry blossom', group: 'Painted', defaultColor: '#F4B6C8', layers: BLOSSOM },
  { type: 'rose', label: 'Rose', group: 'Painted', defaultColor: '#C8304A', layers: ROSE },
  { type: 'vine', label: 'Leaf sprig', group: 'Painted', defaultColor: SAGE, layers: VINE },
  { type: 'heart', label: 'Tiny heart', group: 'Painted', defaultColor: '#D7263D', layers: HEART },
  { type: 'twinkle', label: 'Sparkle', group: 'Painted', defaultColor: '#D4AF37', layers: TWINKLE },
  { type: 'stars', label: 'Tiny stars', group: 'Painted', defaultColor: '#D4AF37', layers: STARS },
  { type: 'swirl', label: 'Fine swirl', group: 'Painted', defaultColor: '#1C1C1C', layers: SWIRL },
  { type: 'cherries', label: 'Cherries', group: 'Painted', defaultColor: '#B3122E', layers: CHERRIES },
  { type: 'strawberry', label: 'Strawberry', group: 'Painted', defaultColor: '#E5394B', layers: STRAWBERRY },
  { type: 'bow', label: 'Ribbon bow', group: 'Painted', defaultColor: '#E68AA6', layers: BOW },
]

export const STICKER_DESIGNS = Object.fromEntries(
  STICKERS.map((design) => [design.type, design]),
) as Record<StickerType, StickerDesign>

// Stickers that were in the app before this set, and the piece now shown in their place, so
// designs saved with them still open.
export const RETIRED_STICKERS: Record<string, StickerType> = {
  butterfly: 'bow',
  smiley: 'heart',
  'evil-eye': 'dot-flower',
  moon: 'stars',
  '3d-heart': 'chrome-heart',
  '3d-bow': 'gel-bow',
  '3d-flower': 'gel-flower',
  '3d-star': 'chrome-star',
}

// The colour a sticker comes in before the user picks one.
export const originalColorOf = (type: Sticker['type']) =>
  type === 'text' ? TEXT_COLOR : STICKER_DESIGNS[type].defaultColor
