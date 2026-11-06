// One hand drawn in SVG: a palm, four fingers and a thumb, each with a clickable nail.
// It's drawn as a left hand (thumb on the right). A right hand is the same drawing flipped.
// Colours and selection come from the app state (src/state/nailState.ts).

import type { Nail } from '../state/nailState'

const NAIL_EDGE = 'rgba(150, 90, 80, 0.5)'
const SELECTED_EDGE = '#E11D48' // Tailwind rose-600

// Width of the area one hand takes up, used to place and flip the hands.
export const HAND_WIDTH = 270
export const HAND_HEIGHT = 400

type Finger = {
  x: number // where the finger joins the palm
  y: number
  baseWidth: number
  tipWidth: number
  length: number
  angle: number // degrees, 0 = straight up
  nailRatio: number // nail bed length ÷ nail width (real fingers ~1.15, thumb ~1.0)
}

// Pinky, ring, middle, index, thumb. Fingers touch at the base and fan out a little.
const FINGERS: Finger[] = [
  { x: 46, y: 228, baseWidth: 31, tipWidth: 23, length: 90, angle: -12, nailRatio: 1.1 },
  { x: 78, y: 214, baseWidth: 34, tipWidth: 26, length: 124, angle: -4, nailRatio: 1.15 },
  { x: 112, y: 210, baseWidth: 35, tipWidth: 27, length: 138, angle: 1, nailRatio: 1.2 },
  { x: 146, y: 216, baseWidth: 34, tipWidth: 26, length: 122, angle: 8, nailRatio: 1.15 },
  { x: 160, y: 296, baseWidth: 40, tipWidth: 29, length: 98, angle: 40, nailRatio: 1.0 },
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

// A natural nail: gently curved tip, nearly straight sides, and a U-shaped cuticle
// with rounded bottom corners. Top-centre at (0, 0).
function nailPath(width: number, height: number): string {
  const half = width / 2
  const topCurve = width * 0.28
  const bottomCurve = width * 0.32
  return [
    `M ${-half} ${topCurve}`,
    `A ${half} ${topCurve} 0 0 1 ${half} ${topCurve}`,
    `L ${half} ${height - bottomCurve}`,
    `A ${half} ${bottomCurve} 0 0 1 ${-half} ${height - bottomCurve}`,
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
  // A short free edge grows past the fingertip, like a natural nail.
  const freeEdge = nailWidth * 0.25
  const nailHeight = nailWidth * nailRatio + freeEdge
  const nailTop = -length - freeEdge

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
      <g transform={`translate(0 ${nailTop})`}>
        <path
          id={`nail-${nail.id}`}
          d={nailPath(nailWidth, nailHeight)}
          fill={nail.baseColor}
          stroke={isSelected ? SELECTED_EDGE : NAIL_EDGE}
          strokeWidth={isSelected ? 2.5 : 1}
        />
        {/* Shine streak. pointerEvents="none" lets clicks pass through to the nail. */}
        <rect
          x={-nailWidth * 0.28}
          y={nailHeight * 0.18}
          width={nailWidth * 0.13}
          height={nailHeight * 0.45}
          rx={nailWidth * 0.065}
          fill="white"
          opacity={0.6}
          pointerEvents="none"
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
        d="M 36 252 C 34 236 44 228 62 226 L 152 226 C 162 228 166 236 166 250 C 172 285 166 325 150 355 L 146 400 L 70 400 L 64 355 C 44 325 34 290 36 252 Z"
        fill={skinTone}
      />
      {FINGERS.slice(0, THUMB_INDEX).map(renderFinger)}
    </g>
  )
}

export default Hand
