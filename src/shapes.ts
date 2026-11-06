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

// Builds the free edge, from the left side of the nail (-half, 0) to the right side (half, 0).
// `width` is the nail's width; lengths are fractions of it so every finger scales the same way.
function freeEdge(shape: NailShape, width: number): string {
  const half = width / 2

  switch (shape) {
    case 'round': {
      // Short, with an evenly curved tip.
      const length = width * 0.45
      const curve = width * 0.425
      return [
        `L ${-half} ${-length + curve}`,
        `A ${half} ${curve} 0 0 1 ${half} ${-length + curve}`,
        `L ${half} 0`,
      ].join(' ')
    }

    case 'square': {
      // Short, straight sides, flat tip with slightly softened corners.
      const length = width * 0.35
      const corner = width * 0.12
      return [
        `L ${-half} ${-length + corner}`,
        `Q ${-half} ${-length} ${-half + corner} ${-length}`,
        `L ${half - corner} ${-length}`,
        `Q ${half} ${-length} ${half} ${-length + corner}`,
        `L ${half} 0`,
      ].join(' ')
    }

    case 'almond': {
      // Longer; the sides curve in to a soft point, like the shape of an almond.
      const length = width * 1.1
      return [
        `C ${-half} ${-length * 0.5} ${-half * 0.35} ${-length * 0.95} 0 ${-length}`,
        `C ${half * 0.35} ${-length * 0.95} ${half} ${-length * 0.5} ${half} 0`,
      ].join(' ')
    }

    case 'coffin': {
      // Longest; straight sides taper to a narrow flat tip (also called ballerina).
      const length = width * 1.2
      const tip = width * 0.27 // half the width of the flat tip
      const corner = width * 0.06
      return [
        `L ${-tip} ${-length + corner}`,
        `Q ${-tip} ${-length} ${-tip + corner} ${-length}`,
        `L ${tip - corner} ${-length}`,
        `Q ${tip} ${-length} ${tip} ${-length + corner}`,
        `L ${half} 0`,
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
