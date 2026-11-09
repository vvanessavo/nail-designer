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
import {
  FINGERS,
  fingertipLineOf,
  HAND_WIDTH,
  nailWidthOf,
  THUMB_INDEX,
  type Finger,
} from '../handGeometry'
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
// Stickers respond to taps within this many screen pixels of their middle (a 32px circle).
const STICKER_TAP_RADIUS = 16

// A small off-screen drawing surface, used only to ask "is this point inside this outline?".
const outlineChecker = document.createElement('canvas').getContext('2d')

// The outline for each sticker type, looked up by name.
const STICKER_PATHS = Object.fromEntries(STICKERS.map((sticker) => [sticker.type, sticker.path]))

// Where one side of a finger crosses the height `y`, in the hand's coordinates.
// side: -1 for the finger's left edge, 1 for its right edge.
function fingerEdgeX(finger: Finger, side: -1 | 1, y: number): number {
  const turn = (finger.angle * Math.PI) / 180
  // The edge runs from the base (40 below the joint) to where the rounded tip starts.
  const ends = [
    { x: (side * finger.baseWidth) / 2, y: 40 },
    { x: (side * finger.tipWidth) / 2, y: -finger.length + finger.tipWidth / 2 },
  ].map((point) => ({
    x: finger.x + point.x * Math.cos(turn) - point.y * Math.sin(turn),
    y: finger.y + point.x * Math.sin(turn) + point.y * Math.cos(turn),
  }))
  const along = (y - ends[0].y) / (ends[1].y - ends[0].y)
  return ends[0].x + (ends[1].x - ends[0].x) * along
}

// The skin between neighbouring fingers. Without it, the gap between two fingers ends in a
// flat, square bottom (the palm's straight top edge). Each web fills the corners so the gap
// ends in a soft rounded U, like real webbing.
const PALM_TOP = 216 // about where the palm's top edge runs between the fingers
const WEB_HEIGHT = 7 // how far up the fingers the webbing reaches
const WEB_PATHS = FINGERS.slice(0, THUMB_INDEX - 1).map((finger, index) => {
  const top = PALM_TOP - WEB_HEIGHT
  const left = fingerEdgeX(finger, 1, top) // right edge of this finger
  const right = fingerEdgeX(FINGERS[index + 1], -1, top) // left edge of the next one
  // Control points straight down from each side make the U leave the fingers smoothly;
  // its lowest point sits about 3 units above the palm edge.
  const dip = (WEB_HEIGHT - 3) / 0.75
  return [
    `M ${left - 1} ${top}`,
    `C ${left} ${top + dip} ${right} ${top + dip} ${right + 1} ${top}`,
    `L ${right + 1} ${PALM_TOP + 4}`,
    `L ${left - 1} ${PALM_TOP + 4}`,
    'Z',
  ].join(' ')
})

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
  const { x, y, angle, nailRatio } = finger
  const nailWidth = nailWidthOf(finger)
  const fingertipLine = fingertipLineOf(finger)
  // How far the nail runs down the finger to the cuticle.
  const bedLength = nailWidth * (nailRatio - 0.15)
  // The middle of the nail, from the tip of the free edge down to the cuticle.
  // Stickers are positioned relative to this point.
  const nailCentreY = (bedLength - freeEdgeLength(nail.shape, nailWidth, nail.length)) / 2
  // Turns a sticker's 24 x 24 outline into the right size for this nail.
  const stickerScale = (nailWidth * STICKER_WIDTH_RATIO) / STICKER_SIZE
  // The tip of the free edge (the top of the nail), relative to the fingertip line.
  const nailTop = -freeEdgeLength(nail.shape, nailWidth, nail.length)
  // The nail's outline, used to draw it and to clip its stickers.
  const nailOutline = nailShapePath(nail.shape, nailWidth, bedLength, nail.length)

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
              data={frenchTipPath(nail.shape, nailWidth, nail.frenchTipThickness, nail.length)}
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
              // The area that responds to taps: a circle around the sticker, at least
              // STICKER_TAP_RADIUS screen pixels, so even a tiny sticker is easy to tap with a
              // fingertip. getAbsoluteScale is how big one sticker unit is on screen right now
              // (it changes with the sticker's size and the zoom).
              hitFunc={(context, shape) => {
                const unitsPerPixel = 1 / Math.abs(shape.getAbsoluteScale().x)
                const radius = Math.max(STICKER_SIZE * 0.6, STICKER_TAP_RADIUS * unitsPerPixel)
                context.beginPath()
                context.arc(STICKER_SIZE / 2, STICKER_SIZE / 2, radius, 0, Math.PI * 2)
                context.closePath()
                context.fillStrokeShape(shape)
              }}
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
            y={nailTop - 9}
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
      {WEB_PATHS.map((web) => (
        <Path
          key={web}
          data={web}
          fill={skinTone}
          listening={false}
        />
      ))}
    </Group>
  )
}

export default Hand
