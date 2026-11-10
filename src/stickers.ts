// The stickers: motifs people actually get on their nails, drawn like real nail decals.
//
// Each sticker is a small stack of shapes ("layers") on a 24 x 24 grid, centred on (12, 12).
// A layer is painted either in the sticker's main colour ('main', which the user can change,
// e.g. the petals of a daisy) or in its own fixed colour (e.g. the daisy's yellow centre), so
// recolouring keeps the details looking natural.

import type { Sticker, TextFont } from './state/nailState'

// The drawn stickers. Text is a sticker too ('text'), but it's written, not drawn.
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

// The colour a sticker comes in before the user picks one.

// Every sticker is drawn on a 24 x 24 grid, centred on (12, 12).
export const STICKER_SIZE = 24

export type StickerLayer = {
  d: string // the outline, as SVG path text
  fill?: 'main' | string // 'main' = the sticker's chosen colour
  stroke?: 'main' | string
  strokeWidth?: number
  opacity?: number
}

export type StickerDesign = {
  type: StickerType
  label: string
  group: string // shown to group stickers in the panel
  defaultColor: string // the main colour it comes in
  layers: StickerLayer[]
}

// Fixed detail colours.
const INK = '#3B2A2A' // fine dark outlines, eyes, bodies
const LEAF = '#4F8F55'
const YELLOW = '#F6C945'
const WHITE = '#FFFFFF'
const SHADE = 'rgba(0, 0, 0, 0.28)' // a see-through shadow line that suits any main colour

// --- Small helpers to build outlines ---------------------------------------------------------

type Point = [number, number]
const fmt = (n: number) => Number(n.toFixed(2))

// Turns a point around (cx, cy) by `degrees`.
function turn([x, y]: Point, degrees: number, cx = 12, cy = 12): Point {
  const a = (degrees * Math.PI) / 180
  const dx = x - cx
  const dy = y - cy
  return [cx + dx * Math.cos(a) - dy * Math.sin(a), cy + dx * Math.sin(a) + dy * Math.cos(a)]
}

// An outline made of a start point and curves (each curve: two control points and an end
// point), turned around the middle by `degrees`.
function curvesPath(start: Point, curves: [Point, Point, Point][], degrees = 0): string {
  const p = (point: Point) => turn(point, degrees).map(fmt).join(' ')
  return `M ${p(start)} ` + curves.map(([a, b, c]) => `C ${p(a)} ${p(b)} ${p(c)}`).join(' ') + ' Z'
}

function circle(cx: number, cy: number, r: number): string {
  return `M ${cx - r} ${cy} A ${r} ${r} 0 1 0 ${cx + r} ${cy} A ${r} ${r} 0 1 0 ${cx - r} ${cy} Z`
}

// An ellipse centred on (cx, cy), long axis turned by `degrees` from vertical.
function ellipse(cx: number, cy: number, rx: number, ry: number, degrees = 0): string {
  const top = turn([cx, cy - ry], degrees, cx, cy).map(fmt)
  const bottom = turn([cx, cy + ry], degrees, cx, cy).map(fmt)
  return `M ${top.join(' ')} A ${rx} ${ry} ${degrees} 1 0 ${bottom.join(' ')} A ${rx} ${ry} ${degrees} 1 0 ${top.join(' ')} Z`
}

// A four-point twinkle star centred on (cx, cy).
function twinkle(cx: number, cy: number, r: number): string {
  const w = r * 0.22
  return (
    `M ${cx} ${cy - r} Q ${cx + w} ${cy - w} ${cx + r} ${cy} Q ${cx + w} ${cy + w} ${cx} ${cy + r} ` +
    `Q ${cx - w} ${cy + w} ${cx - r} ${cy} Q ${cx - w} ${cy - w} ${cx} ${cy - r} Z`
  )
}

const repeatAround = (count: number, make: (degrees: number) => string) =>
  Array.from({ length: count }, (_, i) => make((360 / count) * i)).join(' ')

// One cherry-blossom petal pointing up from the middle, with the little notch at its tip.
const blossomPetal = (degrees: number) =>
  curvesPath(
    [12, 12],
    [
      [[8.2, 10.5], [7.6, 5.4], [10.6, 3.6]],
      [[11.2, 4.4], [11.6, 5], [12, 5.4]],
      [[12.4, 5], [12.8, 4.4], [13.4, 3.6]],
      [[16.4, 5.4], [15.8, 10.5], [12, 12]],
    ],
    degrees,
  )

// --- The stickers ----------------------------------------------------------------------------

// --- Gems: rhinestones, pearls and studs, drawn to look raised ---------------------------
// Each has a soft shadow below and to the right, the stone in its main colour, see-through
// light and dark facets (so they work in any colour), and a bright highlight.

const GEM_SHADOW = 'rgba(0, 0, 0, 0.28)'
const FACET_LIGHT = 'rgba(255, 255, 255, 0.4)'
const FACET_DARK = 'rgba(0, 0, 0, 0.2)'
const FACET_LINE = 'rgba(255, 255, 255, 0.55)'

// The corners of a regular polygon around (12, 12), starting at the top.
function polygonPoints(sides: number, radius: number, offsetDegrees = 0): Point[] {
  return Array.from({ length: sides }, (_, i) => turn([12, 12 - radius], (360 / sides) * i + offsetDegrees))
}
const polygon = (points: Point[]) => `M ${points.map((p) => p.map(fmt).join(' ')).join(' L ')} Z`
const lines = (pairs: [Point, Point][]) =>
  pairs.map(([a, b]) => `M ${a.map(fmt).join(' ')} L ${b.map(fmt).join(' ')}`).join(' ')

// A round brilliant-cut rhinestone: an octagon "table" in the middle, facet lines out to the
// edge, the lower right a little darker.
const roundTable = polygonPoints(8, 4.4, 22.5)
const roundEdge = polygonPoints(8, 8.6, 22.5)
const GEM_ROUND: StickerLayer[] = [
  { d: circle(12.9, 13.1, 8.8), fill: GEM_SHADOW },
  { d: circle(12, 12, 8.8), fill: 'main' },
  { d: 'M 12 12 L 20.8 12 A 8.8 8.8 0 0 1 12 20.8 Z', fill: FACET_DARK },
  { d: polygon(roundTable), fill: FACET_LIGHT },
  { d: lines(roundTable.map((p, i) => [p, roundEdge[i]])), stroke: FACET_LINE, strokeWidth: 0.4 },
  { d: circle(12, 12, 8.8), stroke: 'rgba(255, 255, 255, 0.6)', strokeWidth: 0.5 },
  { d: ellipse(9, 8.4, 1.3, 2, 40), fill: WHITE, opacity: 0.9 },
  { d: twinkle(15.6, 8.4, 1.6), fill: WHITE },
]

const TEARDROP = 'M 12 2.6 C 15.6 8 19.2 11.8 19.2 15.2 A 7.2 7.2 0 0 1 4.8 15.2 C 4.8 11.8 8.4 8 12 2.6 Z'
const GEM_TEARDROP: StickerLayer[] = [
  { d: 'M 12.9 3.4 C 16.5 8.8 20.1 12.6 20.1 16 A 7.2 7.2 0 0 1 5.7 16 C 5.7 12.6 9.3 8.8 12.9 3.4 Z', fill: GEM_SHADOW },
  { d: TEARDROP, fill: 'main' },
  { d: 'M 12 15.2 L 19.2 15.2 A 7.2 7.2 0 0 1 12 22.4 Z', fill: FACET_DARK },
  { d: 'M 12 8 C 14 11 15.6 13 15.6 15 A 3.6 3.6 0 0 1 8.4 15 C 8.4 13 10 11 12 8 Z', fill: FACET_LIGHT },
  { d: 'M 12 2.6 L 12 8 M 4.8 15.2 L 8.4 15 M 19.2 15.2 L 15.6 15 M 12 22.4 L 12 18.6', stroke: FACET_LINE, strokeWidth: 0.4 },
  { d: TEARDROP, stroke: 'rgba(255, 255, 255, 0.6)', strokeWidth: 0.5 },
  { d: ellipse(9.6, 12.4, 1, 1.8, 25), fill: WHITE, opacity: 0.9 },
]

// A square "princess cut" stone: an inner square table and lines to each corner.
const GEM_SQUARE: StickerLayer[] = [
  { d: 'M 4.4 4.4 L 20.6 4.4 L 20.6 20.6 L 4.4 20.6 Z', fill: GEM_SHADOW },
  { d: 'M 3.6 3.6 L 20.4 3.6 L 20.4 20.4 L 3.6 20.4 Z', fill: 'main' },
  { d: 'M 20.4 3.6 L 20.4 20.4 L 3.6 20.4 Z', fill: FACET_DARK },
  { d: 'M 8.2 8.2 L 15.8 8.2 L 15.8 15.8 L 8.2 15.8 Z', fill: FACET_LIGHT },
  { d: 'M 3.6 3.6 L 8.2 8.2 M 20.4 3.6 L 15.8 8.2 M 20.4 20.4 L 15.8 15.8 M 3.6 20.4 L 8.2 15.8', stroke: FACET_LINE, strokeWidth: 0.4 },
  { d: 'M 3.6 3.6 L 20.4 3.6 L 20.4 20.4 L 3.6 20.4 Z', stroke: 'rgba(255, 255, 255, 0.6)', strokeWidth: 0.5 },
  { d: ellipse(7, 6.6, 1, 1.8, 45), fill: WHITE, opacity: 0.9 },
]

// A pearl: smooth, with a soft shade on the lower right and a gentle glow at the top left.
const PEARL: StickerLayer[] = [
  { d: circle(12.8, 13, 8.4), fill: GEM_SHADOW },
  { d: circle(12, 12, 8.4), fill: 'main' },
  { d: 'M 20.4 12 A 8.4 8.4 0 0 1 12 20.4 A 8.4 8.4 0 0 1 4.4 15.6 C 8 18.6 15.6 18.6 20.4 12 Z', fill: 'rgba(0, 0, 0, 0.12)' },
  { d: ellipse(9.4, 9, 3, 3.8, 40), fill: WHITE, opacity: 0.55 },
  { d: circle(8.8, 8.4, 1.1), fill: WHITE, opacity: 0.95 },
]

// A small round metal stud: a domed disc with a bright rim highlight.
const STUD: StickerLayer[] = [
  { d: circle(12.7, 12.8, 6.4), fill: GEM_SHADOW },
  { d: circle(12, 12, 6.4), fill: 'main' },
  { d: 'M 18.4 12 A 6.4 6.4 0 0 1 5.6 12 C 8 16.6 16 16.6 18.4 12 Z', fill: 'rgba(0, 0, 0, 0.22)' },
  { d: circle(12, 12, 6.4), stroke: 'rgba(0, 0, 0, 0.25)', strokeWidth: 0.4 },
  { d: ellipse(10, 9.4, 1.4, 2.4, 50), fill: WHITE, opacity: 0.85 },
]

export const STICKERS: StickerDesign[] = [
  { type: 'gem-round', label: 'Round rhinestone', group: 'Gems', defaultColor: '#E6F1FA', layers: GEM_ROUND },
  { type: 'gem-teardrop', label: 'Teardrop rhinestone', group: 'Gems', defaultColor: '#F2C6D6', layers: GEM_TEARDROP },
  { type: 'gem-square', label: 'Square rhinestone', group: 'Gems', defaultColor: '#BFD8F2', layers: GEM_SQUARE },
  { type: 'pearl', label: 'Pearl', group: 'Gems', defaultColor: '#F6F0E6', layers: PEARL },
  { type: 'stud', label: 'Stud', group: 'Gems', defaultColor: '#D4AF37', layers: STUD },
  {
    type: 'daisy',
    label: 'Daisy',
    group: 'Florals',
    defaultColor: WHITE,
    layers: [
      {
        // Ten petals around the middle: each petal's centre is turned around (12, 12), and
        // the petal itself is turned the same amount so it points outwards.
        d: repeatAround(10, (deg) => {
          const [x, y] = turn([12, 6.4], deg)
          return ellipse(fmt(x), fmt(y), 1.9, 4.2, deg)
        }),
        fill: 'main',
        stroke: SHADE,
        strokeWidth: 0.35,
      },
      { d: circle(12, 12, 3), fill: YELLOW, stroke: '#D9A21E', strokeWidth: 0.4 },
      { d: `${circle(11, 11.2, 0.45)} ${circle(13, 11.6, 0.4)} ${circle(11.8, 13, 0.4)}`, fill: '#D9A21E' },
    ],
  },
  {
    type: 'blossom',
    label: 'Cherry blossom',
    group: 'Florals',
    defaultColor: '#F7B8CC',
    layers: [
      { d: repeatAround(5, blossomPetal), fill: 'main', stroke: SHADE, strokeWidth: 0.35 },
      { d: circle(12, 12, 1.9), fill: '#E2678C' },
      {
        d: repeatAround(5, (deg) => {
          const [x, y] = turn([12, 8.6], deg)
          return circle(fmt(x), fmt(y), 0.45)
        }),
        fill: '#C9446D',
      },
    ],
  },
  {
    type: 'rose',
    label: 'Rose',
    group: 'Florals',
    defaultColor: '#D7263D',
    layers: [
      { d: ellipse(6.6, 16.2, 1.9, 3.6, -55), fill: LEAF },
      { d: ellipse(17.4, 16.2, 1.9, 3.6, 55), fill: LEAF },
      { d: circle(12, 11, 6.2), fill: 'main' },
      {
        // The rose's spiral of petals.
        d: 'M 12 9.4 C 13.6 9.4 14.4 10.8 13.8 12 C 13.1 13.4 10.9 13.6 10 12.2 C 9 10.6 10.2 8.2 12.4 8 C 15 7.8 16.6 10 16 12.4 C 15.4 14.8 12.6 16 10.2 15 C 7.6 13.9 7 10.6 8.4 8.6',
        stroke: SHADE,
        strokeWidth: 0.9,
      },
    ],
  },
  {
    type: 'vine',
    label: 'Leaf vine',
    group: 'Florals',
    defaultColor: LEAF,
    layers: [
      { d: 'M 4 21 C 7 16 6 12 10 10 C 14 8 13 5 19 3', stroke: 'main', strokeWidth: 1 },
      {
        d: [
          ellipse(4.8, 15.4, 1.3, 2.6, -30),
          ellipse(9.6, 14.2, 1.3, 2.6, 50),
          ellipse(8, 8.4, 1.3, 2.6, -40),
          ellipse(14.4, 10.2, 1.3, 2.6, 60),
          ellipse(13.4, 4.4, 1.3, 2.6, -30),
          ellipse(18.6, 6.8, 1.2, 2.4, 70),
        ].join(' '),
        fill: 'main',
      },
    ],
  },
  {
    type: 'bow',
    label: 'Bow',
    group: 'Cute',
    defaultColor: '#F4A7B9',
    layers: [
      {
        // Two ribbon tails.
        d: 'M 11.2 12.6 L 7.4 19.6 L 9.4 19 L 10.4 21 L 12.4 13 Z M 12.8 12.6 L 16.6 19.6 L 14.6 19 L 13.6 21 L 11.6 13 Z',
        fill: 'main',
        stroke: SHADE,
        strokeWidth: 0.4,
      },
      {
        // Two loops.
        d: 'M 12 11.6 C 9.4 6.6 3.4 5.8 3.6 9.8 C 3.8 13.8 9 14 12 11.6 Z M 12 11.6 C 14.6 6.6 20.6 5.8 20.4 9.8 C 20.2 13.8 15 14 12 11.6 Z',
        fill: 'main',
        stroke: SHADE,
        strokeWidth: 0.4,
      },
      { d: 'M 10.4 9.6 C 8.6 8.6 6 8.8 5.6 10.2 M 13.6 9.6 C 15.4 8.6 18 8.8 18.4 10.2', stroke: SHADE, strokeWidth: 0.4 },
      { d: ellipse(12, 11.7, 1.6, 1.9), fill: 'main', stroke: SHADE, strokeWidth: 0.5 },
    ],
  },
  {
    type: 'cherries',
    label: 'Cherries',
    group: 'Cute',
    defaultColor: '#D7263D',
    layers: [
      { d: 'M 7.8 14 C 9 9 11 6 14.2 3.6 M 15.4 14.6 C 15.4 10 15 6.4 14.2 3.6', stroke: '#5C7A35', strokeWidth: 0.9 },
      { d: 'M 14.2 3.6 C 16 2 19.4 2.4 20.4 4 C 18.4 5.4 15.6 5.2 14.2 3.6 Z', fill: LEAF },
      { d: `${circle(7.8, 16.6, 3.6)} ${circle(15.6, 17.4, 3.6)}`, fill: 'main', stroke: SHADE, strokeWidth: 0.4 },
      { d: `${ellipse(6.5, 15.4, 0.7, 1.1, 40)} ${ellipse(14.3, 16.2, 0.7, 1.1, 40)}`, fill: WHITE, opacity: 0.8 },
    ],
  },
  {
    type: 'strawberry',
    label: 'Strawberry',
    group: 'Cute',
    defaultColor: '#E8384F',
    layers: [
      {
        d: 'M 12 21.4 C 6.6 18 4.4 12.4 6.6 9.2 C 8.4 6.8 15.6 6.8 17.4 9.2 C 19.6 12.4 17.4 18 12 21.4 Z',
        fill: 'main',
        stroke: SHADE,
        strokeWidth: 0.4,
      },
      {
        d: [
          [9, 11], [12, 10.6], [15, 11], [7.8, 13.6], [10.6, 13.4], [13.4, 13.4], [16.2, 13.6],
          [9.4, 16.2], [12, 16.4], [14.6, 16.2], [12, 19],
        ]
          .map(([x, y]) => ellipse(x, y, 0.35, 0.6))
          .join(' '),
        fill: '#F8E27A',
      },
      { d: 'M 12 9.4 L 8.2 7 L 10.6 7.2 L 9.6 5 L 11.8 6.4 L 12.4 3.6 L 13 6.4 L 15 5 L 14 7.2 L 16.4 7 Z', fill: LEAF },
    ],
  },
  {
    type: 'butterfly',
    label: 'Butterfly',
    group: 'Cute',
    defaultColor: '#8FCDEB',
    layers: [
      {
        d: [
          'M 12 11.4 C 9.4 5.4 3.2 3.4 3.4 8.2 C 3.6 11.4 8 12.6 12 12 Z',
          'M 12 11.4 C 14.6 5.4 20.8 3.4 20.6 8.2 C 20.4 11.4 16 12.6 12 12 Z',
          'M 12 12.6 C 8.4 13 4.8 15.4 6.4 18.6 C 7.8 21 11 17.6 12 13.6 Z',
          'M 12 12.6 C 15.6 13 19.2 15.4 17.6 18.6 C 16.2 21 13 17.6 12 13.6 Z',
        ].join(' '),
        fill: 'main',
        stroke: INK,
        strokeWidth: 0.45,
      },
      { d: `${circle(6.4, 8, 0.9)} ${circle(17.6, 8, 0.9)} ${circle(8.4, 16.4, 0.6)} ${circle(15.6, 16.4, 0.6)}`, fill: WHITE, opacity: 0.85 },
      { d: ellipse(12, 12.6, 0.8, 4.4), fill: INK },
      { d: 'M 11.6 8.6 C 11 6.6 10 5.4 9 5 M 12.4 8.6 C 13 6.6 14 5.4 15 5', stroke: INK, strokeWidth: 0.4 },
    ],
  },
  {
    type: 'smiley',
    label: 'Smiley',
    group: 'Cute',
    defaultColor: '#F7D23E',
    layers: [
      { d: circle(12, 12, 8.6), fill: 'main', stroke: SHADE, strokeWidth: 0.4 },
      { d: `${ellipse(9.2, 9.8, 0.9, 1.6)} ${ellipse(14.8, 9.8, 0.9, 1.6)}`, fill: INK },
      { d: 'M 7.6 13.2 C 8.8 17 15.2 17 16.4 13.2', stroke: INK, strokeWidth: 1.1 },
    ],
  },
  {
    type: 'heart',
    label: 'Heart',
    group: 'Hearts and luck',
    defaultColor: '#D7263D',
    layers: [
      {
        // An outlined heart, a classic minimal nail design.
        d: 'M 12 19.6 C 5.4 15.4 3.2 11.6 4.2 8.4 C 5.2 5.2 9.6 4.8 12 8.4 C 14.4 4.8 18.8 5.2 19.8 8.4 C 20.8 11.6 18.6 15.4 12 19.6 Z',
        stroke: 'main',
        strokeWidth: 1.5,
      },
    ],
  },
  {
    type: 'evil-eye',
    label: 'Evil eye',
    group: 'Hearts and luck',
    defaultColor: '#1F3A93',
    layers: [
      { d: circle(12, 12, 8.8), fill: 'main' },
      { d: circle(12, 12, 6.2), fill: WHITE },
      { d: circle(12, 12, 4.3), fill: '#6FB7E9' },
      { d: circle(12, 12, 2.2), fill: '#141414' },
      { d: circle(13, 11, 0.7), fill: WHITE },
    ],
  },
  {
    type: 'moon',
    label: 'Moon and stars',
    group: 'Celestial',
    defaultColor: '#E9C46A',
    layers: [
      { d: 'M 13.4 3.4 A 8.4 8.4 0 1 0 20.4 16.6 A 6.8 6.8 0 1 1 13.4 3.4 Z', fill: 'main', stroke: SHADE, strokeWidth: 0.35 },
      { d: `${twinkle(18.4, 6.6, 2.4)} ${twinkle(15.6, 11.2, 1.4)}`, fill: 'main' },
    ],
  },
  {
    type: 'twinkle',
    label: 'Twinkle star',
    group: 'Celestial',
    defaultColor: '#D4AF37',
    layers: [
      { d: `${twinkle(11, 13, 8)} ${twinkle(18.6, 5.4, 2.6)}`, fill: 'main', stroke: SHADE, strokeWidth: 0.3 },
      { d: ellipse(9.6, 11.2, 0.5, 1.6, 0), fill: WHITE, opacity: 0.7 },
    ],
  },
  {
    type: 'swirl',
    label: 'Swirl',
    group: 'Minimal',
    defaultColor: '#F08DB4',
    layers: [
      { d: 'M 2.6 13 C 5 6.6 8.4 6.6 9.6 12 C 10.8 17.4 14.4 17.4 15.8 12 C 17 7.4 20 7 21.4 10', stroke: 'main', strokeWidth: 1.6 },
    ],
  },
]

// The design for each sticker type, looked up by name.
export const STICKER_DESIGNS = Object.fromEntries(
  STICKERS.map((design) => [design.type, design]),
) as Record<StickerType, StickerDesign>

// The colour a sticker comes in before the user picks one.
export const originalColorOf = (type: Sticker['type']) =>
  type === 'text' ? TEXT_COLOR : STICKER_DESIGNS[type].defaultColor

// A layer's paint: the sticker's chosen colour for 'main', otherwise the layer's own colour.
export const paint = (value: string | undefined, mainColor: string) =>
  value === 'main' ? mainColor : value
