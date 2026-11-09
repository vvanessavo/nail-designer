// SVG outlines for each nail shape.
//
// Every nail has two parts:
// - the nail bed, which sits on the finger and is the same for every shape
//   (straight sides, rounded U-shaped cuticle at the bottom)
// - the free edge, the part that grows past the fingertip. This is what makes a nail
//   round, square, almond, coffin, stiletto, squoval or natural.
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
  stiletto: 1.4,
  squoval: 0.38,
  natural: 0.18,
}

// `lengthScale` is the nail's length setting: 1 is the shape's usual length, 0.5 half, 2 double.
export function freeEdgeLength(shape: NailShape, width: number, lengthScale = 1): number {
  return width * FREE_EDGE_LENGTH[shape] * lengthScale
}

// Builds the free edge, from the left side of the nail (-half, 0) to the right side (half, 0).
// `width` is the nail's width; lengths are fractions of it so every finger scales the same way.
function freeEdge(shape: NailShape, width: number, lengthScale: number): string {
  const half = width / 2

  switch (shape) {
    case 'round': {
      // Short, with an evenly curved tip.
      const length = freeEdgeLength(shape, width, lengthScale)
      // The curve can't be deeper than the free edge is long (short nails).
      const curve = Math.min(width * 0.425, length)
      return [
        `L ${-half} ${-length + curve}`,
        `A ${half} ${curve} 0 0 1 ${half} ${-length + curve}`,
        `L ${half} 0`,
      ].join(' ')
    }

    case 'square': {
      // Short, straight sides and a flat tip with sharp corners.
      const length = freeEdgeLength(shape, width, lengthScale)
      return [
        `L ${-half} ${-length}`,
        `L ${half} ${-length}`,
        `L ${half} 0`,
      ].join(' ')
    }

    case 'almond': {
      // Longer; the sides curve in to a soft rounded point, like the shape of an almond.
      // Each side leaves the nail straight up (no corner) and arrives flat at the tip.
      const length = freeEdgeLength(shape, width, lengthScale)
      return [
        `C ${-half} ${-length * 0.45} ${-half * 0.35} ${-length} 0 ${-length}`,
        `C ${half * 0.35} ${-length} ${half} ${-length * 0.45} ${half} 0`,
      ].join(' ')
    }

    case 'coffin': {
      // Longest; the sides taper in a gentle curve to a narrow flat tip with sharp
      // corners (also called ballerina).
      const length = freeEdgeLength(shape, width, lengthScale)
      const tip = width * 0.27 // half the width of the flat tip
      return [
        `C ${-half} ${-length * 0.35} ${-tip - width * 0.04} ${-length * 0.75} ${-tip} ${-length}`,
        `L ${tip} ${-length}`,
        `C ${tip + width * 0.04} ${-length * 0.75} ${half} ${-length * 0.35} ${half} 0`,
      ].join(' ')
    }

    case 'stiletto': {
      // Longest of all; the sides curve in to a sharp point. Unlike almond, the sides meet
      // at an angle, so the tip is pointed instead of rounded.
      const length = freeEdgeLength(shape, width, lengthScale)
      return [
        `C ${-half} ${-length * 0.4} ${-half * 0.15} ${-length * 0.85} 0 ${-length}`,
        `C ${half * 0.15} ${-length * 0.85} ${half} ${-length * 0.4} ${half} 0`,
      ].join(' ')
    }

    case 'squoval': {
      // Short like square, with a flat tip, but the corners are softly rounded
      // ("square" + "oval").
      const length = freeEdgeLength(shape, width, lengthScale)
      const corner = Math.min(width * 0.2, length)
      return [
        `L ${-half} ${-length + corner}`,
        `Q ${-half} ${-length} ${-half + corner} ${-length}`,
        `L ${half - corner} ${-length}`,
        `Q ${half} ${-length} ${half} ${-length + corner}`,
        `L ${half} 0`,
      ].join(' ')
    }

    case 'natural': {
      // Very short, a gentle curve that follows the fingertip, like an unpainted nail.
      const length = freeEdgeLength(shape, width, lengthScale)
      // The curve's middle reaches the full length: the control point sits higher.
      return [
        `L ${-half} ${-length * 0.3}`,
        `Q 0 ${-length * 1.7} ${half} ${-length * 0.3}`,
        `L ${half} 0`,
      ].join(' ')
    }
  }
}

// The full nail outline: free edge on top, nail bed below down to a rounded cuticle.
// `bedLength` is how far the nail runs down the finger from the fingertip line.
export function nailShapePath(
  shape: NailShape,
  width: number,
  bedLength: number,
  lengthScale = 1,
): string {
  const half = width / 2
  const cuticleCurve = width * 0.32
  return [
    `M ${-half} ${bedLength - cuticleCurve}`,
    `L ${-half} 0`,
    freeEdge(shape, width, lengthScale),
    `L ${half} ${bedLength - cuticleCurve}`,
    `A ${half} ${cuticleCurve} 0 0 1 ${-half} ${bedLength - cuticleCurve}`,
    'Z',
  ].join(' ')
}

// How much further down the nail's sides the tip reaches than its middle, as a fraction of the
// nail's width. This is what makes the curved "smile line".
const SMILE_DEPTH = 0.3

// The white tip of a French manicure: everything above a curved smile line. It's drawn bigger
// than the nail at the top and sides, and clipped to the nail's outline, so it fits every shape.
// `thickness` is the share of the free edge it covers in the middle (1 = all of it).
export function frenchTipPath(
  shape: NailShape,
  width: number,
  thickness: number,
  lengthScale = 1,
): string {
  const half = width / 2
  const length = freeEdgeLength(shape, width, lengthScale)
  const middleY = -length + length * thickness // where the smile line crosses the middle
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
