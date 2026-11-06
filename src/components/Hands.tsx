import Hand, { HAND_HEIGHT, HAND_TOP, HAND_WIDTH } from './Hand'
import { isTargeted, type AppState } from '../state/nailState'

// Space between the two hands' drawing areas. It's negative so the areas overlap:
// each area has empty space beside the thumb, and this pulls the thumbs close together.
const GAP = -35
const WIDTH = HAND_WIDTH * 2 + GAP

type HandsProps = {
  state: AppState
  onSelectNail: (nailId: number) => void
}

// Both hands side by side: left hand has nail-0 to nail-4, right hand nail-5 to nail-9.
function Hands({ state, onSelectNail }: HandsProps) {
  const targetedNailIds = state.nails
    .filter((nail) => isTargeted(state, nail.id))
    .map((nail) => nail.id)

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
        <g transform={`translate(0 ${-HAND_TOP})`}>
        <Hand
          firstNail={0}
          mirrored={false}
          x={0}
          skinTone={state.skinTone}
          nails={state.nails}
          targetedNailIds={targetedNailIds}
          onSelectNail={onSelectNail}
        />
        <Hand
          firstNail={5}
          mirrored={true}
          x={HAND_WIDTH + GAP}
          skinTone={state.skinTone}
          nails={state.nails}
          targetedNailIds={targetedNailIds}
          onSelectNail={onSelectNail}
        />
        </g>
      </g>
    </svg>
  )
}

export default Hands
