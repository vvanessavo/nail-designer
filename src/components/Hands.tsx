// Both hands side by side on one react-konva canvas: left hand has nail-0 to nail-4,
// right hand nail-5 to nail-9.
//
// Konva draws on a <canvas>: a <Stage> is the canvas, a <Layer> is a drawing surface on it,
// and shapes go inside layers. Unlike SVG, a canvas doesn't resize itself, so we measure the
// space available and scale the drawing to fit.
//
// Zoom: the drawing can be enlarged up to MAX_ZOOM times with the buttons, a pinch on touch,
// or a trackpad pinch / Ctrl + scroll. While zoomed in, dragging the hands pans around.

import Konva from 'konva'
import { useEffect, useRef, useState, type Ref } from 'react'
import { Group, Layer, Rect, Stage, Transformer } from 'react-konva'
import Hand, { HAND_HEIGHT, HAND_TOP, HAND_WIDTH, type StickerEditing } from './Hand'
import { isTargeted, type AppState } from '../state/nailState'

// Space between the two hands' drawing areas. It's negative so the areas overlap:
// each area has empty space beside the thumb, and this pulls the thumbs close together.
const GAP = -35
const WIDTH = HAND_WIDTH * 2 + GAP
// Size of the whole drawing (both hands), in drawing units. Used when exporting an image.
export const HANDS_WIDTH = WIDTH
export const HANDS_HEIGHT = HAND_HEIGHT

type HandsProps = {
  stageRef: Ref<Konva.Stage> // lets App reach the Konva stage, to export an image of it
  state: AppState
  showTargets: boolean // show the dots that mark where shape and colour changes will go
  onSelectNail: (nailId: number) => void
  onTapBackground: () => void // a tap on empty space, not on a hand
  stickerEditing: StickerEditing | null
}

// Smallest and largest a sticker can be resized to, in screen pixels.
const MIN_STICKER_PX = 8
const MAX_STICKER_PX = 160

// How far the hands can be zoomed in, and how much one press of + or - changes it.
const MAX_ZOOM = 4
const ZOOM_STEP = 1.5

// Keep reporting finger movement while something is being dragged, so a second finger
// landing mid-drag can start a pinch.
Konva.hitOnDragEnabled = true

// What part of the drawing is on screen: how much it's enlarged, and which drawing point
// (in the hands' own units) sits in the middle of the view.
type View = { zoom: number; centreX: number; centreY: number }
const FULL_VIEW: View = { zoom: 1, centreX: WIDTH / 2, centreY: HAND_HEIGHT / 2 }

const clampZoom = (zoom: number) => Math.max(1, Math.min(MAX_ZOOM, zoom))

// Where the drawing's top or left edge goes on the canvas, along one direction: where asked,
// but limited. If the drawing is smaller than the canvas that way, it stays fully on the
// canvas. If it's bigger, it can't move so far that a gap opens at either end.
function placeEdge(wanted: number, drawingSize: number, canvasSize: number): number {
  const spare = canvasSize - drawingSize
  return Math.max(Math.min(0, spare), Math.min(Math.max(0, spare), wanted))
}

type Point = { x: number; y: number }
const distance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y)
const midpoint = (a: Point, b: Point) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 })

function Hands({ stageRef, state, showTargets, onSelectNail, onTapBackground, stickerEditing }: HandsProps) {
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

  // The canvas fills the whole box, so a zoomed-in view uses all the space there is.
  const stageWidth = Math.floor(box.width)
  const stageHeight = Math.floor(box.height)
  // As large as fits in the box without stretching the hands (the full view).
  const fitScale = Math.min(stageWidth / WIDTH, stageHeight / HAND_HEIGHT)

  const [view, setView] = useState<View>(FULL_VIEW)
  const scale = fitScale * view.zoom
  // Where the drawing's top-left corner lands on the canvas: the view's centre in the middle,
  // kept inside the limits of placeEdge.
  const stageX = placeEdge(stageWidth / 2 - view.centreX * scale, WIDTH * scale, stageWidth)
  const stageY = placeEdge(stageHeight / 2 - view.centreY * scale, HAND_HEIGHT * scale, stageHeight)
  // The drawing point under a canvas point.
  const toDrawing = (screen: Point) => ({ x: (screen.x - stageX) / scale, y: (screen.y - stageY) / scale })

  // Zoom to newZoom while keeping `drawingPoint` under `screen` (canvas pixels),
  // e.g. under the mouse or between two fingers.
  const zoomAround = (newZoom: number, drawingPoint: Point, screen: Point): View => {
    const zoom = clampZoom(newZoom)
    if (zoom === 1) return FULL_VIEW // fully zoomed out: centre the hands again
    const newScale = fitScale * zoom
    return {
      zoom,
      centreX: drawingPoint.x + (stageWidth / 2 - screen.x) / newScale,
      centreY: drawingPoint.y + (stageHeight / 2 - screen.y) / newScale,
    }
  }
  // The + and - buttons zoom around the middle of the canvas.
  const zoomBy = (factor: number) => {
    const middle = { x: stageWidth / 2, y: stageHeight / 2 }
    setView(zoomAround(view.zoom * factor, toDrawing(middle), middle))
  }

  // Pinch: remember the finger distance, zoom and drawing point between the fingers when the
  // second finger lands, then scale with the distance and keep that point between the fingers.
  const pinch = useRef<{ distance: number; zoom: number; drawingPoint: Point } | null>(null)
  // A pinch or pan ending also produces a tap; this time is used to ignore it.
  const lastGestureEnd = useRef(0)

  const touchPoints = (event: Konva.KonvaEventObject<TouchEvent>): [Point, Point] | null => {
    const touches = event.evt.touches
    const stage = event.target.getStage()
    if (touches.length < 2 || !stage) return null
    const rect = stage.container().getBoundingClientRect()
    const toCanvas = (t: Touch) => ({ x: t.clientX - rect.left, y: t.clientY - rect.top })
    return [toCanvas(touches[0]), toCanvas(touches[1])]
  }

  const handleTouchMove = (event: Konva.KonvaEventObject<TouchEvent>) => {
    const points = touchPoints(event)
    if (!points) return
    event.evt.preventDefault()
    const stage = event.target.getStage()
    // Two fingers means pinch: stop any pan or sticker drag the first finger started.
    if (stage?.isDragging()) stage.stopDrag()
    stage?.find('.sticker').forEach((node) => node.isDragging() && node.stopDrag())
    const middle = midpoint(points[0], points[1])
    if (!pinch.current) {
      pinch.current = {
        distance: distance(points[0], points[1]),
        zoom: view.zoom,
        drawingPoint: toDrawing(middle),
      }
      return
    }
    const start = pinch.current
    const newZoom = (start.zoom * distance(points[0], points[1])) / start.distance
    setView(zoomAround(newZoom, start.drawingPoint, middle))
  }

  const handleTouchEnd = (event: Konva.KonvaEventObject<TouchEvent>) => {
    if (pinch.current && event.evt.touches.length < 2) {
      pinch.current = null
      lastGestureEnd.current = Date.now()
    }
  }

  // Trackpad pinch (and Ctrl + scroll wheel) zooms around the mouse.
  const handleWheel = (event: Konva.KonvaEventObject<WheelEvent>) => {
    event.evt.preventDefault()
    const pointer = event.target.getStage()?.getPointerPosition()
    if (!pointer) return
    const factor = Math.exp(-event.evt.deltaY * (event.evt.ctrlKey ? 0.01 : 0.002))
    setView(zoomAround(view.zoom * factor, toDrawing(pointer), pointer))
  }

  // Taps that are really the end of a pinch, or come during one, are ignored.
  const isGestureTap = () => pinch.current !== null || Date.now() - lastGestureEnd.current < 300
  const handleSelectNail = (nailId: number) => {
    if (!isGestureTap()) onSelectNail(nailId)
  }

  return (
    <div
      ref={boxRef}
      role="img"
      aria-label="Two hands. Tap a nail to choose it."
      // touch-none stops the browser from zooming or scrolling the page on a pinch here.
      // select-none and the touch-callout setting stop a long press from selecting things or
      // popping up the phone's "save image" menu.
      className="relative flex h-full w-full max-w-2xl touch-none items-center justify-center select-none [-webkit-touch-callout:none]"
    >
      {stageWidth > 0 && stageHeight > 0 && (
        // drop-shadow is on this wrapper, not the box, so it doesn't also shade the zoom buttons.
        <div className="drop-shadow-lg">
          <Stage
            ref={stageRef}
            width={stageWidth}
            height={stageHeight}
            scaleX={scale}
            scaleY={scale}
            x={stageX}
            y={stageY}
            // While zoomed in, dragging anywhere that isn't a sticker pans. A finger has to move
            // a few pixels first, so a slightly wobbly tap still counts as a tap.
            draggable={view.zoom > 1}
            dragDistance={6}
            // Don't let a pan drag the hands away from the edges of the canvas.
            dragBoundFunc={(position) => ({
              x: placeEdge(position.x, WIDTH * scale, stageWidth),
              y: placeEdge(position.y, HAND_HEIGHT * scale, stageHeight),
            })}
            onDragStart={() => {
              isDragging.current = true
            }}
            onDragEnd={(event) => {
              isDragging.current = false
              lastDragEnd.current = Date.now()
              // A pan just ended (not a sticker drag): save where the view moved to.
              const stage = event.target
              if (stage === stage.getStage()) {
                setView({
                  zoom: view.zoom,
                  centreX: (stageWidth / 2 - stage.x()) / scale,
                  centreY: (stageHeight / 2 - stage.y()) / scale,
                })
              }
            }}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onWheel={handleWheel}
            onPointerClick={(event) => {
              // Taps on a finger or sticker are handled there; this is for taps on empty space.
              const fromDrag = isDragging.current || Date.now() - lastDragEnd.current < 300
              if (event.target === event.target.getStage() && !fromDrag && !isGestureTap()) {
                onTapBackground()
              }
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
                  onSelectNail={handleSelectNail}
                  stickerEditing={stickerEditing}
                />
                <Hand
                  firstNail={5}
                  mirrored={true}
                  x={HAND_WIDTH + GAP}
                  skinTone={state.skinTone}
                  nails={state.nails}
                  targetedNailIds={targetedNailIds}
                  onSelectNail={handleSelectNail}
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
              // An invisible 14px band around each handle makes it about 26px to grab, easier
              // for a fingertip, without drawing it bigger.
              anchorStyleFunc={(anchor) => anchor.hitStrokeWidth(14)}
                anchorCornerRadius={6}
                anchorStroke="#E11D48"
                anchorFill="white"
                borderStroke="#E11D48"
                rotateAnchorOffset={16}
                padding={8}
                shouldOverdrawWholeArea={true}
                // The limits are in screen pixels, so they grow with the zoom.
                boundBoxFunc={(oldBox, newBox) =>
                  Math.abs(newBox.width) < MIN_STICKER_PX * view.zoom ||
                  Math.abs(newBox.width) > MAX_STICKER_PX * view.zoom
                    ? oldBox
                    : newBox
                }
              />
            </Layer>
          </Stage>
        </div>
      )}
      {/* Zoom buttons, in the bottom-right corner of the hands area. */}
      <div className="absolute right-0 bottom-0 flex overflow-hidden rounded-xl border border-stone-200 bg-white/90 text-stone-700 shadow-sm">
        <button
          type="button"
          aria-label="Zoom out"
          disabled={view.zoom <= 1}
          onClick={() => zoomBy(1 / ZOOM_STEP)}
          className="h-11 w-11 cursor-pointer text-xl disabled:cursor-default disabled:text-stone-300"
        >
          −
        </button>
        <button
          type="button"
          aria-label="Zoom in"
          disabled={view.zoom >= MAX_ZOOM}
          onClick={() => zoomBy(ZOOM_STEP)}
          className="h-11 w-11 cursor-pointer border-x border-stone-200 text-xl disabled:cursor-default disabled:text-stone-300"
        >
          +
        </button>
        <button
          type="button"
          disabled={view.zoom <= 1}
          onClick={() => setView(FULL_VIEW)}
          className="h-11 cursor-pointer px-3 text-sm disabled:cursor-default disabled:text-stone-300"
        >
          Reset
        </button>
      </div>
    </div>
  )
}

export default Hands
