// One hand drawn with react-konva: a palm, four fingers and a thumb, each with a clickable nail.
// It's drawn as a left hand (thumb on the right). A right hand is the same drawing flipped.
// Colours and selection come from the app state (src/state/nailState.ts).
//
// Konva's <Path> takes the same outline text as an SVG path ("M 0 0 L 10 10 ..."), so every
// outline is unchanged from the SVG version. SVG transforms become <Group> props:
// translate(x y) -> x, y   rotate(a) -> rotation   scale(-1 1) -> scaleX={-1}

import type Konva from 'konva'
import { Circle, Group, Path, Rect } from 'react-konva'
import type { Nail, StickerChanges } from '../state/nailState'
import { freeEdgeLength, frenchTipPath, nailShapePath } from '../shapes'
import { STICKER_SIZE, STICKERS } from '../stickers'

const NAIL_EDGE = 'rgba(150, 90, 80, 0.5)'
const DOT_COLOR = '#292524' // Tailwind stone-800
// Matte polish looks a little paler and flatter: a faint white layer over the whole nail.
const MATTE_HAZE = 'rgba(255, 255, 255, 0.14)'
// Shiny polish catches the light: white streaks that fade out down the nail.
const GLOSS_STOPS = [0, 'rgba(255, 255, 255, 0.7)', 1, 'rgba(255, 255, 255, 0)']

// A sticker at scale 1 is this fraction of the nail's width.
const STICKER_WIDTH_RATIO = 0.7
// Smallest and largest a sticker can be resized to, compared with its default size.
const MIN_STICKER_SCALE = 0.3
const MAX_STICKER_SCALE = 1.6

// A small off-screen drawing surface, used only to ask "is this point inside this outline?".
const outlineChecker = document.createElement('canvas').getContext('2d')

// The outline for each sticker type, looked up by name.
const STICKER_PATHS = Object.fromEntries(STICKERS.map((sticker) => [sticker.type, sticker.path]))

// Width of the area one hand takes up, used to place and flip the hands.
export const HAND_WIDTH = 270
// The drawing runs from about y 80 (tips of the longest nails) to 400 (wrist); Hands crops off the empty top.
export const HAND_TOP = 68
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

// Set while stickers can be edited (Stickers tab open, no sticker picked up to place).
export type StickerEditing = {
  selectedId: string | null // the sticker showing the move / resize / turn handles
  onSelect: (stickerId: string) => void
  onChange: (nailId: number, stickerId: string, changes: StickerChanges) => void
}

type FingerShapeProps = {
  finger: Finger
  nail: Nail
  skinTone: string
  isTargeted: boolean // changes will apply to this nail, shown with a dot
  onSelectNail: (nailId: number) => void
  stickerEditing: StickerEditing | null
}

// Shows a pointing-hand cursor while the mouse is over a finger.
function setCursor(event: Konva.KonvaEventObject<MouseEvent>, cursor: string) {
  const stage = event.target.getStage()
  if (stage) stage.container().style.cursor = cursor
}

function FingerShape({ finger, nail, skinTone, isTargeted, onSelectNail, stickerEditing }: FingerShapeProps) {
  const { x, y, tipWidth, length, angle, nailRatio } = finger
  // Real nails cover about 78% of the fingertip's width.
  const nailWidth = tipWidth * 0.78
  // The fingertip line, where the free edge starts: just below the top of the finger,
  // where its rounded tip starts to narrow.
  const fingertipLine = -length + nailWidth * 0.15
  // How far the nail runs down the finger to the cuticle.
  const bedLength = nailWidth * (nailRatio - 0.15)
  // The middle of the nail, from the tip of the free edge down to the cuticle.
  // Stickers are positioned relative to this point.
  const nailCentreY = (bedLength - freeEdgeLength(nail.shape, nailWidth)) / 2
  // Turns a sticker's 24 x 24 outline into the right size for this nail.
  const stickerScale = (nailWidth * STICKER_WIDTH_RATIO) / STICKER_SIZE
  // The tip of the free edge (the top of the nail), relative to the fingertip line.
  const nailTop = -freeEdgeLength(nail.shape, nailWidth)
  // The nail's outline, used to draw it and to clip its stickers.
  const nailOutline = nailShapePath(nail.shape, nailWidth, bedLength)

  // Is this point (in the nail's own coordinates) inside the nail's outline?
  const isOnNail = (point: Konva.Vector2d) =>
    outlineChecker?.isPointInPath(new Path2D(nailOutline), point.x, point.y) ?? true

  // While dragging, keep the sticker's middle inside the nail's outline, so it can't end up
  // hidden off the edge (the clip would hide most of it). If the finger goes past the edge,
  // the sticker slides as far as it can toward the finger and stops at the edge.
  // Konva calls this for every drag position (in screen coordinates) before using it.
  function keepOnNail(this: Konva.Node, wantedOnScreen: Konva.Vector2d): Konva.Vector2d {
    const toScreen = this.getParent()?.getAbsoluteTransform()
    if (!toScreen) return wantedOnScreen
    const wanted = toScreen.copy().invert().point(wantedOnScreen) // in the nail's coordinates
    let onNail: Konva.Vector2d = this.getAttr('lastOnNail') ?? { x: 0, y: nailCentreY }
    if (isOnNail(wanted)) {
      onNail = wanted
    } else {
      // Halve the gap between the last spot on the nail and the wanted spot, ten times,
      // to find the furthest point along that line that is still on the nail.
      let offNail = wanted
      for (let step = 0; step < 10; step++) {
        const middle = { x: (onNail.x + offNail.x) / 2, y: (onNail.y + offNail.y) / 2 }
        if (isOnNail(middle)) onNail = middle
        else offNail = middle
      }
    }
    this.setAttr('lastOnNail', onNail)
    return toScreen.point(onNail)
  }

  // After a drag or a resize / turn, save where the sticker ended up. The Konva node's
  // position is relative to the nail's group, so convert it back to "offset from the
  // nail's centre" and "size relative to the default".
  const saveSticker = (stickerId: string, node: Konva.Node) => {
    stickerEditing?.onChange(nail.id, stickerId, {
      x: node.x(),
      y: node.y() - nailCentreY,
      scale: Math.max(
        MIN_STICKER_SCALE,
        Math.min(MAX_STICKER_SCALE, Math.abs(node.scaleX()) / stickerScale),
      ),
      rotation: node.rotation(),
    })
  }

  return (
    // The whole finger is clickable, so the target is big enough for a fingertip on a phone.
    // onPointerClick fires for mouse clicks, finger taps and pen taps alike.
    <Group
      x={x}
      y={y}
      rotation={angle}
      onPointerClick={() => onSelectNail(nail.id)}
      onMouseEnter={(event) => setCursor(event, 'pointer')}
      onMouseLeave={(event) => setCursor(event, 'default')}
    >
      <Path
        data={fingerPath(finger)}
        fill={skinTone}
      />
      <Group y={fingertipLine}>
        <Path
          id={`nail-${nail.id}`}
          nailShape={nail.shape}
          targeted={isTargeted}
          data={nailOutline}
          fill={nail.baseColor}
        />
        {/* Stickers are clipped to the nail's exact outline, so nothing shows outside the
            nail, even while a sticker is being dragged or resized near the edge. clipFunc
            returns the same outline as the nail shape (an SVG path, as a Path2D). */}
        <Group clipFunc={() => [new Path2D(nailOutline)]}>
          {/* The French tip goes under the stickers, and is clipped to the nail like them. */}
          {nail.hasFrenchTip && (
            <Path
              data={frenchTipPath(nail.shape, nailWidth, nail.frenchTipThickness)}
              fill={nail.frenchTipColor}
              listening={false}
            />
          )}
          {nail.stickers.map((sticker) => (
            <Path
              key={sticker.id}
              id={sticker.id}
              name="sticker"
              stickerType={sticker.type}
              data={STICKER_PATHS[sticker.type]}
              x={sticker.x}
              y={nailCentreY + sticker.y}
              // offset moves the outline's middle (12, 12) onto the sticker's position,
              // so it also turns around its middle.
              offsetX={STICKER_SIZE / 2}
              offsetY={STICKER_SIZE / 2}
              scaleX={stickerScale * sticker.scale}
              scaleY={stickerScale * sticker.scale}
              rotation={sticker.rotation}
              fill={sticker.color}
              // Stickers only respond to taps and drags while they can be edited. Otherwise
              // taps pass through to the finger and choose the nail as usual.
              listening={stickerEditing !== null}
              draggable={stickerEditing !== null}
              // A little extra invisible edge makes small stickers easier to grab.
              hitStrokeWidth={8}
              onPointerClick={(event) => {
                event.cancelBubble = true // don't also count as a tap on the finger
                stickerEditing?.onSelect(sticker.id)
              }}
              onDragStart={(event) => {
                const node: Konva.Node = event.target
                node.setAttr('lastOnNail', node.position())
                stickerEditing?.onSelect(sticker.id)
              }}
              dragBoundFunc={keepOnNail}
              onDragEnd={(event) => saveSticker(sticker.id, event.target)}
              onTransformEnd={(event) => saveSticker(sticker.id, event.target)}
            />
          ))}
          {/* The finish goes over everything, like a top coat. */}
          {nail.finish === 'matte' && (
            <Path
              data={nailOutline}
              fill={MATTE_HAZE}
              listening={false}
            />
          )}
          {nail.finish === 'shiny' && (
            <Group listening={false}>
              {/* A long streak down the left side and a short one on the right. */}
              <Rect
                x={-nailWidth * 0.32}
                y={nailTop * 0.7}
                width={nailWidth * 0.13}
                height={(bedLength - nailTop * 0.7) * 0.75}
                cornerRadius={nailWidth * 0.065}
                fillLinearGradientStartPoint={{ x: 0, y: 0 }}
                fillLinearGradientEndPoint={{ x: 0, y: (bedLength - nailTop * 0.7) * 0.75 }}
                fillLinearGradientColorStops={GLOSS_STOPS}
              />
              <Rect
                x={nailWidth * 0.2}
                y={nailTop * 0.6}
                width={nailWidth * 0.08}
                height={(bedLength - nailTop * 0.6) * 0.3}
                cornerRadius={nailWidth * 0.04}
                fillLinearGradientStartPoint={{ x: 0, y: 0 }}
                fillLinearGradientEndPoint={{ x: 0, y: (bedLength - nailTop * 0.6) * 0.3 }}
                fillLinearGradientColorStops={GLOSS_STOPS}
              />
            </Group>
          )}
        </Group>
        {/* The nail's edge, drawn last so the tip and stickers don't cover it. */}
        <Path
          data={nailOutline}
          stroke={NAIL_EDGE}
          strokeWidth={1}
          listening={false}
        />
        {/* A small dot just past the nail tip marks the nails your changes will go to.
            Dark with a white rim, so it shows against any polish or background. */}
        {isTargeted && (
          <Circle
            name="target-dot" // left out of exported images
            x={0}
            y={-freeEdgeLength(nail.shape, nailWidth) - 9}
            radius={4.5}
            fill={DOT_COLOR}
            stroke="white"
            strokeWidth={1.5}
            listening={false}
          />
        )}
      </Group>
    </Group>
  )
}

type HandProps = {
  firstNail: number // number of the left-most nail on screen
  mirrored: boolean // true draws a right hand
  x: number // left edge of the hand's area
  skinTone: string
  nails: Nail[]
  targetedNailIds: number[]
  onSelectNail: (nailId: number) => void
  stickerEditing: StickerEditing | null
}

function Hand({
  firstNail,
  mirrored,
  x,
  skinTone,
  nails,
  targetedNailIds,
  onSelectNail,
  stickerEditing,
}: HandProps) {
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
        isTargeted={targetedNailIds.includes(nail.id)}
        onSelectNail={onSelectNail}
        stickerEditing={stickerEditing}
      />
    )
  }

  // scaleX={-1} flips the drawing left-to-right; moving it right by HAND_WIDTH puts it
  // back in view.
  return (
    <Group
      x={mirrored ? x + HAND_WIDTH : x}
      scaleX={mirrored ? -1 : 1}
    >
      {renderFinger(FINGERS[THUMB_INDEX], THUMB_INDEX)}
      <Path
        data="M 41 245 C 40 228 46 218 60 217 L 140 215 C 150 216 154 228 153 245 L 150 290 C 152 330 146 365 136 386 L 132 400 L 66 400 L 62 360 C 46 335 38 290 41 245 Z"
        fill={skinTone}
        listening={false}
      />
      {/* The skin between the thumb and index finger: one smooth curve that follows the
          side of the index finger down and flows into the top edge of the thumb. */}
      <Path
        data="M 154.3 240 C 153.5 255 154.5 268 160 268 C 163.5 268 166.7 261.7 170 256.7 L 168 295 L 140 300 L 140 240 Z"
        fill={skinTone}
        listening={false}
      />
      {/* The fleshy base of the thumb: a rounded bulge from the thumb down into the wrist. */}
      <Path
        data="M 186.7 290 C 176.6 309.6 158 366 136 386 L 120 370 L 150 290 Z"
        fill={skinTone}
        listening={false}
      />
      {FINGERS.slice(0, THUMB_INDEX).map(renderFinger)}
    </Group>
  )
}

export default Hand
