import Hand, { HAND_HEIGHT, HAND_WIDTH } from './Hand'

// Space between the two hands' drawing areas. It's negative so the areas overlap:
// each area has empty space beside the thumb, and this pulls the thumbs close together.
const GAP = -45
const WIDTH = HAND_WIDTH * 2 + GAP

// Both hands side by side: left hand has nail-0 to nail-4, right hand nail-5 to nail-9.
function Hands() {
  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HAND_HEIGHT}`}
      className="w-full max-w-2xl drop-shadow-lg"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Fades the wrists out instead of cutting them off with a hard edge. */}
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
        <mask id="hands-mask">
          <rect
            width={WIDTH}
            height={HAND_HEIGHT}
            fill="url(#wrist-fade)"
          />
        </mask>
      </defs>

      <g mask="url(#hands-mask)">
        <Hand
          firstNail={0}
          mirrored={false}
          x={0}
        />
        <Hand
          firstNail={5}
          mirrored={true}
          x={HAND_WIDTH + GAP}
        />
      </g>
    </svg>
  )
}

export default Hands
