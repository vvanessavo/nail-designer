// A hand drawn in SVG: a palm, four fingers and a thumb, each with a clickable nail.
// Nails keep their ids nail-0 (pinky) to nail-4 (thumb).

const SKIN_TONE = '#E8B896'
const CREASE_COLOR = 'rgba(120, 70, 45, 0.25)'
const NAIL_COLOR = '#F6DCD6'
const NAIL_EDGE = 'rgba(150, 90, 80, 0.35)'

type Finger = {
  nailId: string
  x: number // where the finger joins the palm
  y: number
  width: number
  length: number
  angle: number // degrees, 0 = straight up
}

const FINGERS: Finger[] = [
  { nailId: 'nail-0', x: 72, y: 240, width: 34, length: 120, angle: -7 },
  { nailId: 'nail-1', x: 112, y: 235, width: 38, length: 165, angle: -2 },
  { nailId: 'nail-2', x: 154, y: 235, width: 40, length: 185, angle: 0 },
  { nailId: 'nail-3', x: 196, y: 238, width: 38, length: 165, angle: 5 },
]

const THUMB: Finger = { nailId: 'nail-4', x: 222, y: 345, width: 44, length: 125, angle: 42 }

// Builds the outline of a natural nail: rounded tip, curved cuticle at the bottom.
// Drawn with its top-centre at (0, 0).
function nailPath(width: number, height: number): string {
  const half = width / 2
  return [
    `M ${-half} ${height}`,
    `L ${-half} ${half}`,
    `A ${half} ${half} 0 0 1 ${half} ${half}`,
    `L ${half} ${height}`,
    `Q 0 ${height + 7} ${-half} ${height}`,
    'Z',
  ].join(' ')
}

type FingerShapeProps = {
  finger: Finger
}

function FingerShape({ finger }: FingerShapeProps) {
  const { nailId, x, y, width, length, angle } = finger
  const nailWidth = width * 0.72
  const nailHeight = width * 0.95
  const nailTop = -length + 4

  // Small curved lines where the knuckles bend.
  const crease = (atY: number) =>
    `M ${-width * 0.3} ${atY} Q 0 ${atY + 4} ${width * 0.3} ${atY}`

  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <rect
        x={-width / 2}
        y={-length}
        width={width}
        height={length + 30}
        rx={width / 2}
        fill={SKIN_TONE}
      />
      <path
        d={`${crease(-length * 0.62)} ${crease(-length * 0.3)}`}
        stroke={CREASE_COLOR}
        strokeWidth={1.5}
        strokeLinecap="round"
        fill="none"
      />
      <g transform={`translate(0 ${nailTop})`}>
        <path
          id={nailId}
          d={nailPath(nailWidth, nailHeight)}
          fill={NAIL_COLOR}
          stroke={NAIL_EDGE}
          strokeWidth={1}
          onClick={() => console.log(`${nailId} clicked`)}
          className="cursor-pointer"
        />
        {/* Shine streak. pointerEvents="none" lets clicks pass through to the nail. */}
        <rect
          x={-nailWidth * 0.28}
          y={nailHeight * 0.22}
          width={nailWidth * 0.14}
          height={nailHeight * 0.5}
          rx={nailWidth * 0.07}
          fill="white"
          opacity={0.6}
          pointerEvents="none"
        />
      </g>
    </g>
  )
}

function Hand() {
  return (
    <svg
      viewBox="0 0 330 440"
      className="w-full max-w-xs drop-shadow-xl"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Thumb goes first so the palm covers where it joins. */}
      <FingerShape finger={THUMB} />
      <path
        d="M 54 275 C 48 245 68 233 98 234 L 200 236 C 226 237 238 250 233 280 Q 236 345 205 440 L 82 440 Q 46 340 54 275 Z"
        fill={SKIN_TONE}
      />
      {FINGERS.map((finger) => (
        <FingerShape
          key={finger.nailId}
          finger={finger}
        />
      ))}
    </svg>
  )
}

export default Hand
