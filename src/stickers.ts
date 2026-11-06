// The six stickers, loaded from the SVG files in src/assets/stickers/.
//
// Each file is one single-colour shape on a 24 x 24 grid. We read the file as text
// ("?raw") and pull out the shape's outline, so Konva can draw it in any colour the user
// picks (a sticker's `color` in state) instead of a fixed colour baked into an image.

import type { Sticker } from './state/nailState'
import dot from './assets/stickers/dot.svg?raw'
import flower from './assets/stickers/flower.svg?raw'
import heart from './assets/stickers/heart.svg?raw'
import line from './assets/stickers/line.svg?raw'
import sparkle from './assets/stickers/sparkle.svg?raw'
import star from './assets/stickers/star.svg?raw'

export type StickerType = Sticker['type']

// Every sticker file is drawn on a 24 x 24 grid, centred on (12, 12).
export const STICKER_SIZE = 24

// Finds the d="..." outline inside an SVG file's text.
function outlineOf(svg: string): string {
  const match = svg.match(/\sd="([^"]+)"/)
  if (!match) throw new Error('Sticker SVG has no <path d="...">')
  return match[1]
}

export const STICKERS: { type: StickerType; label: string; path: string }[] = [
  { type: 'star', label: 'Star', path: outlineOf(star) },
  { type: 'heart', label: 'Heart', path: outlineOf(heart) },
  { type: 'dot', label: 'Dot', path: outlineOf(dot) },
  { type: 'sparkle', label: 'Sparkle', path: outlineOf(sparkle) },
  { type: 'line', label: 'Line', path: outlineOf(line) },
  { type: 'flower', label: 'Flower', path: outlineOf(flower) },
]
