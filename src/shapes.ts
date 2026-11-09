// SVG outlines for each nail shape.
//
// Every nail has two parts:
// - the nail bed, which sits on the finger and is the same for every shape
//   (straight sides, rounded U-shaped cuticle at the bottom)
// - the free edge, the part that grows past the fingertip. This is what makes a nail
//   round, square, almond or coffin.
//
// Coordinates: (0, 0) is the middle of the fingertip line, where the free edge starts.
// Negative y goes up (out past the fingertip), positive y goes down towards the cuticle.

import type { NailShape } from './state/nailState'

// How far each shape's free edge grows past the fingertip, as a fraction of the nail's width.
const FREE_EDGE_LENGTH: Record<NailShape, number> = {
  round: 0.45,
  square: 0.35,
  almond: 1.1,
  coffin: 1.2,
}

export function freeEdgeLength(shape: NailShape, width: number): number {
  return width * FREE_EDGE_LENGTH[shape]
}

// Builds the free edge, from the left side of the nail (-half, 0) to the right side (half, 0).
// `width` is the nail's width; lengths are fractions of it so every finger scales the same way.
function freeEdge(shape: NailShape, width: number): string {
  const half = width / 2

  switch (shape) {
    case 'round': {
      // Short, with an evenly curved tip.
      const length = freeEdgeLength(shape, width)
      const curve = width * 0.425
      return [
        `L ${-half} ${-length + curve}`,
        `A ${half} ${curve} 0 0 1 ${half} ${-length + curve}`,
        `L ${half} 0`,
      ].join(' ')
    }

    case 'square': {
      // Short, straight sides and a flat tip with sharp corners.
      const length = freeEdgeLength(shape, width)
      return [
        `L ${-half} ${-length}`,
        `L ${half} ${-length}`,
        `L ${half} 0`,
      ].join(' ')
    }

    case 'almond': {
      // Longer; the sides curve in to a soft rounded point, like the shape of an almond.
      // Each side leaves the nail straight up (no corner) and arrives flat at the tip.
      const length = freeEdgeLength(shape, width)
      return [
        `C ${-half} ${-length * 0.45} ${-half * 0.35} ${-length} 0 ${-length}`,
        `C ${half * 0.35} ${-length} ${half} ${-length * 0.45} ${half} 0`,
      ].join(' ')
    }

    case 'coffin': {
      // Longest; the sides taper in a gentle curve to a narrow flat tip with sharp
      // corners (also called ballerina).
      const length = freeEdgeLength(shape, width)
      const tip = width * 0.27 // half the width of the flat tip
      return [
        `C ${-half} ${-length * 0.35} ${-tip - width * 0.04} ${-length * 0.75} ${-tip} ${-length}`,
        `L ${tip} ${-length}`,
        `C ${tip + width * 0.04} ${-length * 0.75} ${half} ${-length * 0.35} ${half} 0`,
      ].join(' ')
    }
  }
}

// The full nail outline: free edge on top, nail bed below down to a rounded cuticle.
// `bedLength` is how far the nail runs down the finger from the fingertip line.
export function nailShapePath(shape: NailShape, width: number, bedLength: number): string {
  const half = width / 2
  const cuticleCurve = width * 0.32
  return [
    `M ${-half} ${bedLength - cuticleCurve}`,
    `L ${-half} 0`,
    freeEdge(shape, width),
    `L ${half} ${bedLength - cuticleCurve}`,
    `A ${half} ${cuticleCurve} 0 0 1 ${-half} ${bedLength - cuticleCurve}`,
    'Z',
  ].join(' ')
}

// How much of the free edge a French tip covers in the middle of the nail (1 = all of it).
const FRENCH_TIP_COVER = 0.8
// How much further down the nail's sides the tip reaches than its middle, as a fraction of the
// nail's width. This is what makes the curved "smile line".
const SMILE_DEPTH = 0.3

// The white tip of a French manicure: everything above a curved smile line. It's drawn bigger
// than the nail at the top and sides, and clipped to the nail's outline, so it fits every shape.
export function frenchTipPath(shape: NailShape, width: number): string {
  const half = width / 2
  const length = freeEdgeLength(shape, width)
  const middleY = -length + length * FRENCH_TIP_COVER // where the smile line crosses the middle
  const sideY = middleY + width * SMILE_DEPTH // where it meets the sides
  const margin = width // extra space, so the clip decides the outer edge
  return [
    `M ${-half - margin} ${-length - margin}`,
    `L ${-half - margin} ${sideY}`,
    `L ${-half} ${sideY}`,
    // A curve whose middle reaches middleY: the control point sits twice as far up.
    `Q 0 ${2 * middleY - sideY} ${half} ${sideY}`,
    `L ${half + margin} ${sideY}`,
    `L ${half + margin} ${-length - margin}`,
    'Z',
  ].join(' ')
}
