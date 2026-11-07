// Both hands side by side on one react-konva canvas: left hand has nail-0 to nail-4,
// right hand nail-5 to nail-9.
//
// Konva draws on a <canvas>: a <Stage> is the canvas, a <Layer> is a drawing surface on it,
// and shapes go inside layers. Unlike SVG, a canvas doesn't resize itself, so we measure the
// space available and scale the drawing to fit.

import type Konva from 'konva'
import { useEffect, useRef, useState } from 'react'
import { Group, Layer, Rect, Stage, Transformer } from 'react-konva'
import Hand, { HAND_HEIGHT, HAND_TOP, HAND_WIDTH, type StickerEditing } from './Hand'
import { isTargeted, type AppState } from '../state/nailState'

// Space between the two hands' drawing areas. It's negative so the areas overlap:
// each area has empty space beside the thumb, and this pulls the thumbs close together.
const GAP = -35
const WIDTH = HAND_WIDTH * 2 + GAP

type HandsProps = {
  state: AppState
  showTargets: boolean // show the dots that mark where shape and colour changes will go
  onSelectNail: (nailId: number) => void
  onTapBackground: () => void // a tap on empty space, not on a hand
  stickerEditing: StickerEditing | null
}

// Smallest and largest a sticker can be resized to, in screen pixels.
const MIN_STICKER_PX = 8
const MAX_STICKER_PX = 160

function Hands({ state, showTargets, onSelectNail, onTapBackground, stickerEditing }: HandsProps) {
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

  // The Transformer is Konva's box of handles for resizing and turning a shape. Whenever
  // the selected sticker changes, attach it to that sticker (or to nothing).
  const transformerRef = useRef<Konva.Transformer>(null)
  const selectedStickerId = stickerEditing?.selectedId ?? null
  useEffect(() => {
    const transformer = transformerRef.current
    if (!transformer) return
    const sticker = selectedStickerId ? transformer.getStage()?.findOne(`#${selectedStickerId}`) : undefined
    transformer.nodes(sticker ? [sticker] : [])
  }, [selectedStickerId])

  // When a sticker drag ends over empty space, Konva also reports a tap there (just before
  // the drag's end). Track drags so that tap doesn't put the handles away.
  const isDragging = useRef(false)
  const lastDragEnd = useRef(0)

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
          onDragStart={() => {
            isDragging.current = true
          }}
          onDragEnd={() => {
            isDragging.current = false
            lastDragEnd.current = Date.now()
          }}
          onPointerClick={(event) => {
            // Taps on a finger or sticker are handled there; this is for taps on empty space.
            const fromDrag = isDragging.current || Date.now() - lastDragEnd.current < 300
            if (event.target === event.target.getStage() && !fromDrag) onTapBackground()
          }}
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
                stickerEditing={stickerEditing}
              />
              <Hand
                firstNail={5}
                mirrored={true}
                x={HAND_WIDTH + GAP}
                skinTone={state.skinTone}
                nails={state.nails}
                targetedNailIds={targetedNailIds}
                onSelectNail={onSelectNail}
                stickerEditing={stickerEditing}
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
            {/* Handles for the selected sticker: corners resize it from its middle (keeping its proportions),
                the handle on top turns it, snapping to straight when close. Drawn after the
                wrist fade so the fade never hides them.
                Stickers can be tiny on a phone, so the corner handles sit a few pixels out
                (padding) instead of on top of the sticker, and the whole area inside the box
                can be grabbed to move it (shouldOverdrawWholeArea). */}
            <Transformer
              ref={transformerRef}
              enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
              keepRatio={true}
              centeredScaling={true}
              flipEnabled={false}
              rotationSnaps={[0, 90, 180, 270]}
              rotationSnapTolerance={8}
              anchorSize={12}
              anchorCornerRadius={6}
              anchorStroke="#E11D48"
              anchorFill="white"
              borderStroke="#E11D48"
              rotateAnchorOffset={16}
              padding={8}
              shouldOverdrawWholeArea={true}
              boundBoxFunc={(oldBox, newBox) =>
                Math.abs(newBox.width) < MIN_STICKER_PX || Math.abs(newBox.width) > MAX_STICKER_PX
                  ? oldBox
                  : newBox
              }
            />
          </Layer>
        </Stage>
      )}
    </div>
  )
}

export default Hands
