// One hand drawn in SVG: a palm, four fingers and a thumb, each with a clickable nail.
// It's drawn as a left hand (thumb on the right). A right hand is the same drawing flipped.
// Colours and selection come from the app state (src/state/nailState.ts).

import type { Nail } from '../state/nailState'
import { nailShapePath } from '../shapes'

const NAIL_EDGE = 'rgba(150, 90, 80, 0.5)'
const SELECTED_EDGE = '#E11D48' // Tailwind rose-600

// Width of the area one hand takes up, used to place and flip the hands.
export const HAND_WIDTH = 270
// The drawing runs from about y 80 (tips of the longest nails) to 400 (wrist); Hands crops off the empty top.
export const HAND_TOP = 78
export const HAND_HEIGHT = 400 - HAND_TOP

type Finger = {
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
const FINGERS: Finger[] = [
  { x: 54, y: 232, baseWidth: 26, tipWidth: 21, length: 84, angle: -10, nailRatio: 1.1 },
  { x: 81.5, y: 220, baseWidth: 29, tipWidth: 24, length: 104, angle: -3, nailRatio: 1.15 },
  { x: 111.5, y: 216, baseWidth: 31, tipWidth: 25, length: 110, angle: 1, nailRatio: 1.2 },
  { x: 142, y: 222, baseWidth: 30, tipWidth: 24, length: 101, angle: 7, nailRatio: 1.15 },
  { x: 168, y: 290.3, baseWidth: 40, tipWidth: 27, length: 76, angle: 30, nailRatio: 1.0 },
]

// Draw the palm before the thumb's neighbours but after the thumb, so it covers the joins.
const THUMB_INDEX = 4

// A finger that gets narrower towards a rounded tip. Drawn pointing straight up from (0, 0).
function fingerPath({ baseWidth, tipWidth, length }: Finger): string {
  const base = baseWidth / 2
  const tip = tipWidth / 2
  return [
    `M ${-base} 40`,
    `L ${-tip} ${-length + tip}`,
    `A ${tip} ${tip} 0 0 1 ${tip} ${-length + tip}`,
    `L ${base} 40`,
    'Z',
  ].join(' ')
}

type FingerShapeProps = {
  finger: Finger
  nail: Nail
  skinTone: string
  isSelected: boolean
  onSelectNail: (nailId: number) => void
}

function FingerShape({ finger, nail, skinTone, isSelected, onSelectNail }: FingerShapeProps) {
  const { x, y, tipWidth, length, angle, nailRatio } = finger
  // Real nails cover about 78% of the fingertip's width.
  const nailWidth = tipWidth * 0.78
  // The fingertip line, where the free edge starts: just below the top of the finger,
  // where its rounded tip starts to narrow.
  const fingertipLine = -length + nailWidth * 0.15
  // How far the nail runs down the finger to the cuticle.
  const bedLength = nailWidth * (nailRatio - 0.15)

  return (
    // The whole finger is clickable, so the target is big enough for a fingertip on a phone.
    <g
      transform={`translate(${x} ${y}) rotate(${angle})`}
      onClick={() => onSelectNail(nail.id)}
      className="cursor-pointer"
    >
      <path
        d={fingerPath(finger)}
        fill={skinTone}
      />
      <g transform={`translate(0 ${fingertipLine})`}>
        <path
          id={`nail-${nail.id}`}
          data-shape={nail.shape}
          d={nailShapePath(nail.shape, nailWidth, bedLength)}
          fill={nail.baseColor}
          stroke={isSelected ? SELECTED_EDGE : NAIL_EDGE}
          strokeWidth={isSelected ? 2.5 : 1}
          strokeLinejoin="round"
        />
      </g>
    </g>
  )
}

type HandProps = {
  firstNail: number // number of the left-most nail on screen
  mirrored: boolean // true draws a right hand
  x: number // left edge of the hand's area
  skinTone: string
  nails: Nail[]
  selectedNailIds: number[]
  onSelectNail: (nailId: number) => void
}

function Hand({ firstNail, mirrored, x, skinTone, nails, selectedNailIds, onSelectNail }: HandProps) {
  // Nails are numbered left to right on screen. A left hand reads pinky to thumb,
  // a flipped right hand reads thumb to pinky.
  const nailNumberFor = (fingerIndex: number) => {
    const offset = mirrored ? FINGERS.length - 1 - fingerIndex : fingerIndex
    return firstNail + offset
  }

  const renderFinger = (finger: Finger, fingerIndex: number) => {
    const nail = nails[nailNumberFor(fingerIndex)]
    return (
      <FingerShape
        key={nail.id}
        finger={finger}
        nail={nail}
        skinTone={skinTone}
        isSelected={selectedNailIds.includes(nail.id)}
        onSelectNail={onSelectNail}
      />
    )
  }

  // scale(-1 1) flips the drawing left-to-right; the translate puts it back in view.
  const transform = mirrored
    ? `translate(${x + HAND_WIDTH} 0) scale(-1 1)`
    : `translate(${x} 0)`

  return (
    <g transform={transform}>
      {renderFinger(FINGERS[THUMB_INDEX], THUMB_INDEX)}
      <path
        d="M 41 245 C 40 228 46 218 60 217 L 140 215 C 150 216 154 228 153 245 L 150 290 C 152 330 146 365 136 386 L 132 400 L 66 400 L 62 360 C 46 335 38 290 41 245 Z"
        fill={skinTone}
      />
      {/* The skin between the thumb and index finger: one smooth curve that follows the
          side of the index finger down and flows into the top edge of the thumb. */}
      <path
        d="M 154.3 240 C 153.5 255 154.5 268 160 268 C 163.5 268 166.7 261.7 170 256.7 L 168 295 L 140 300 L 140 240 Z"
        fill={skinTone}
      />
      {/* The fleshy base of the thumb: a rounded bulge from the thumb down into the wrist. */}
      <path
        d="M 186.7 290 C 176.6 309.6 158 366 136 386 L 120 370 L 150 290 Z"
        fill={skinTone}
      />
      {FINGERS.slice(0, THUMB_INDEX).map(renderFinger)}
    </g>
  )
}

export default Hand
