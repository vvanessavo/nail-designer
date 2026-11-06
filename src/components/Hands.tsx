// Both hands side by side on one react-konva canvas: left hand has nail-0 to nail-4,
// right hand nail-5 to nail-9.
//
// Konva draws on a <canvas>: a <Stage> is the canvas, a <Layer> is a drawing surface on it,
// and shapes go inside layers. Unlike SVG, a canvas doesn't resize itself, so we measure the
// space available and scale the drawing to fit.

import { useEffect, useRef, useState } from 'react'
import { Group, Layer, Rect, Stage } from 'react-konva'
import Hand, { HAND_HEIGHT, HAND_TOP, HAND_WIDTH } from './Hand'
import { isTargeted, type AppState } from '../state/nailState'

// Space between the two hands' drawing areas. It's negative so the areas overlap:
// each area has empty space beside the thumb, and this pulls the thumbs close together.
const GAP = -35
const WIDTH = HAND_WIDTH * 2 + GAP

type HandsProps = {
  state: AppState
  showTargets: boolean // show the dots that mark where shape and colour changes will go
  onSelectNail: (nailId: number) => void
}

function Hands({ state, showTargets, onSelectNail }: HandsProps) {
  const targetedNailIds = state.nails
    .filter(() => showTargets)
    .filter((nail) => isTargeted(state, nail.id))
    .map((nail) => nail.id)

  // Measure the box the hands can fill, and keep measuring when it changes size
  // (window resized, a toolbar panel opened or closed).
  const boxRef = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState({ width: 0, height: 0 })
  useEffect(() => {
    const element = boxRef.current
    if (!element) return
    const observer = new ResizeObserver(([entry]) => {
      setBox({ width: entry.contentRect.width, height: entry.contentRect.height })
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  // As large as fits in the box without stretching the hands.
  const scale = Math.min(box.width / WIDTH, box.height / HAND_HEIGHT)

  return (
    <div
      ref={boxRef}
      role="img"
      aria-label="Two hands. Tap a nail to choose it."
      className="flex h-full w-full max-w-2xl items-center justify-center drop-shadow-lg"
    >
      {scale > 0 && (
        <Stage
          width={WIDTH * scale}
          height={HAND_HEIGHT * scale}
          scaleX={scale}
          scaleY={scale}
        >
          <Layer>
            <Group y={-HAND_TOP}>
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
            </Group>
            {/* Fades the wrists out instead of cutting them off with a hard edge.
                "destination-out" makes this rectangle erase what's under it: not at all
                at the top, fully at the bottom. */}
            <Rect
              width={WIDTH}
              height={HAND_HEIGHT}
              fillLinearGradientStartPoint={{ x: 0, y: 0 }}
              fillLinearGradientEndPoint={{ x: 0, y: HAND_HEIGHT }}
              fillLinearGradientColorStops={[0, 'rgba(0,0,0,0)', 0.8, 'rgba(0,0,0,0)', 1, 'rgba(0,0,0,1)']}
              globalCompositeOperation="destination-out"
              listening={false}
            />
          </Layer>
        </Stage>
      )}
    </div>
  )
}

export default Hands
