// The hands' measurements: where each finger sits, how big the nails are, and how much
// room the drawing needs. Shared by Hand (which draws one hand), Hands (both hands) and the
// picture export. It's a separate file because component files should only export components.

import { freeEdgeLength } from './shapes'
import type { Nail } from './state/nailState'

// Width of the area one hand takes up, used to place and flip the hands.
export const HAND_WIDTH = 270
// The drawing runs down to the wrist at y 400. Its top is just above the longest nails (see
// drawingTop); Hands crops off the empty space above that.
export const HAND_BOTTOM = 400
// The top when every nail is a usual length, so the layout stays put for normal nails.
const DEFAULT_TOP = 68
// Room needed above a nail's tip for the selection dot (9 above the tip, plus its size).
const ROOM_ABOVE_NAIL = 16

export type Finger = {
  x: number // where the finger joins the palm
  y: number
  baseWidth: number
  tipWidth: number
  length: number
  angle: number // degrees, 0 = straight up
  nailRatio: number // nail bed length ÷ nail width (real fingers ~1.15, thumb ~1.0)
}

// Pinky, ring, middle, index, thumb, sized from real hand proportions:
// - palm (knuckles to wrist, y 222 to 355) is about 0.8 times as wide as it is long
// - middle finger is about 0.8 of the palm's length; index ~0.92, ring ~0.95, pinky ~0.76 of the middle
// - knuckles form an arc (middle highest, pinky lowest), fingers touch at the base and fan out
// - the thumb grows from low on the palm, near the wrist, and its tip reaches the index knuckle
export const FINGERS: Finger[] = [
  { x: 54, y: 232, baseWidth: 26, tipWidth: 21, length: 84, angle: -10, nailRatio: 1.1 },
  { x: 81.5, y: 220, baseWidth: 29, tipWidth: 24, length: 104, angle: -3, nailRatio: 1.15 },
  { x: 111.5, y: 216, baseWidth: 31, tipWidth: 25, length: 110, angle: 1, nailRatio: 1.2 },
  { x: 142, y: 222, baseWidth: 30, tipWidth: 24, length: 101, angle: 7, nailRatio: 1.15 },
  { x: 168, y: 290.3, baseWidth: 40, tipWidth: 27, length: 76, angle: 30, nailRatio: 1.0 },
]

// Draw the palm before the thumb's neighbours but after the thumb, so it covers the joins.
export const THUMB_INDEX = 4

// Real nails cover about 78% of the fingertip's width.
export const nailWidthOf = (finger: Finger) => finger.tipWidth * 0.78
// The fingertip line, where the free edge starts: just below the top of the finger,
// where its rounded tip starts to narrow. Relative to where the finger joins the palm.
export const fingertipLineOf = (finger: Finger) => -finger.length + nailWidthOf(finger) * 0.15

// The highest point the drawing needs to show: above the tip of the longest nail, so long
// nails (and the dot above them) are never cut off. Finger i carries nail i on the left hand
// and nail 9 - i on the (flipped) right hand.
export function drawingTop(nails: Nail[]): number {
  let top = DEFAULT_TOP
  FINGERS.forEach((finger, index) => {
    const turn = (finger.angle * Math.PI) / 180
    for (const nail of [nails[index], nails[nails.length - 1 - index]]) {
      const nailWidth = nailWidthOf(finger)
      const tip =
        fingertipLineOf(finger) - freeEdgeLength(nail.shape, nailWidth, nail.length) - ROOM_ABOVE_NAIL
      top = Math.min(top, finger.y + tip * Math.cos(turn))
    }
  })
  return top
}

// Space between the two hands' drawing areas. It's negative so the areas overlap:
// each area has empty space beside the thumb, and this pulls the thumbs close together.
const GAP = -35
// Width of the whole drawing (both hands), and where the right hand's area starts.
export const HANDS_WIDTH = HAND_WIDTH * 2 + GAP
export const RIGHT_HAND_X = HAND_WIDTH + GAP

// Size of the whole drawing (both hands), in drawing units. It gets taller when nails are
// long (see drawingTop). Used when exporting a picture.
export function drawingSize(nails: Nail[]) {
  return { width: HANDS_WIDTH, height: HAND_BOTTOM - drawingTop(nails) }
}
