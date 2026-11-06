// A hand drawn in SVG: a palm, four fingers and a thumb, each with a clickable nail.
// Nails keep their ids nail-0 (pinky) to nail-4 (thumb).

const SKIN_TONE = '#E8B896'
const NAIL_COLOR = '#F6DCD6'
const NAIL_EDGE = 'rgba(150, 90, 80, 0.3)'

type Finger = {
  nailId: string
  x: number // where the finger joins the palm
  y: number
  baseWidth: number
  tipWidth: number
  length: number
  angle: number // degrees, 0 = straight up
}

// Fingers touch at the base and fan out a little, like a relaxed hand.
const FINGERS: Finger[] = [
  { nailId: 'nail-0', x: 80, y: 238, baseWidth: 38, tipWidth: 29, length: 92, angle: -13 },
  { nailId: 'nail-1', x: 118, y: 222, baseWidth: 42, tipWidth: 33, length: 128, angle: -5 },
  { nailId: 'nail-2', x: 160, y: 218, baseWidth: 44, tipWidth: 34, length: 142, angle: 1 },
  { nailId: 'nail-3', x: 202, y: 224, baseWidth: 42, tipWidth: 33, length: 126, angle: 8 },
]

const THUMB: Finger = {
  nailId: 'nail-4',
  x: 224,
  y: 318,
  baseWidth: 52,
  tipWidth: 37,
  length: 98,
  angle: 48,
}

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

// A natural nail: rounded tip, curved cuticle at the bottom. Top-centre at (0, 0).
function nailPath(width: number, height: number): string {
  const half = width / 2
  return [
    `M ${-half} ${height}`,
    `L ${-half} ${half}`,
    `A ${half} ${half} 0 0 1 ${half} ${half}`,
    `L ${half} ${height}`,
    `Q 0 ${height + 6} ${-half} ${height}`,
    'Z',
  ].join(' ')
}

type FingerShapeProps = {
  finger: Finger
}

function FingerShape({ finger }: FingerShapeProps) {
  const { nailId, x, y, tipWidth, length, angle } = finger
  const nailWidth = tipWidth * 0.78
  const nailHeight = nailWidth * 1.3
  const nailTop = -length + 3

  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <path
        d={fingerPath(finger)}
        fill={SKIN_TONE}
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
          y={nailHeight * 0.2}
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

function Hand() {
  return (
    <svg
      viewBox="0 0 330 420"
      className="w-full max-w-xs drop-shadow-lg"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Fades the wrist out instead of cutting it off with a hard edge. */}
        <linearGradient
          id="wrist-fade"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0.8" stopColor="white" />
          <stop offset="1" stopColor="black" />
        </linearGradient>
        <mask id="hand-mask">
          <rect
            width="330"
            height="420"
            fill="url(#wrist-fade)"
          />
        </mask>
      </defs>

      <g mask="url(#hand-mask)">
        {/* Thumb goes first so the palm covers where it joins. */}
        <FingerShape finger={THUMB} />
        <path
          d="M 66 262 C 64 244 74 236 96 234 L 210 234 C 224 236 230 246 230 262 C 244 300 236 345 210 375 L 200 420 L 96 420 L 88 375 C 66 340 58 295 64 250 Z"
          fill={SKIN_TONE}
        />
        {FINGERS.map((finger) => (
          <FingerShape
            key={finger.nailId}
            finger={finger}
          />
        ))}
      </g>
    </svg>
  )
}

export default Hand
