// One hand drawn with react-konva: a palm, four fingers and a thumb, each with a clickable nail.
// It's drawn as a left hand (thumb on the right). A right hand is the same drawing flipped.
// Colours and selection come from the app state (src/state/nailState.ts).
//
// Konva's <Path> takes the same outline text as an SVG path ("M 0 0 L 10 10 ..."), so every
// outline is unchanged from the SVG version. SVG transforms become <Group> props:
// translate(x y) -> x, y   rotate(a) -> rotation   scale(-1 1) -> scaleX={-1}

import type Konva from 'konva'
import { useState } from 'react'
import { Circle, Group, Line, Path, Rect, Text } from 'react-konva'
import type { Nail, StickerChanges, Stroke } from '../state/nailState'
import { darken, lighten } from '../colour'
import NailEffect from './NailEffect'
import { freeEdgeLength, frenchTipPath, nailShapePath } from '../shapes'
import {
  FINGERS,
  fingertipLineOf,
  HAND_WIDTH,
  nailWidthOf,
  THUMB_INDEX,
  type Finger,
} from '../handGeometry'
import { paint, STICKER_DESIGNS, STICKER_SIZE, TEXT_FONTS, TEXT_SIZE } from '../stickers'

const NAIL_EDGE = 'rgba(150, 90, 80, 0.5)'
const DOT_COLOR = '#292524' // Tailwind stone-800
// Matte polish looks a little paler and flatter: a faint white layer over the whole nail.
const MATTE_HAZE = 'rgba(255, 255, 255, 0.14)'
// Shiny polish catches the light: white streaks that fade out down the nail.
const GLOSS_STOPS = [0, 'rgba(255, 255, 255, 0.7)', 1, 'rgba(255, 255, 255, 0)']

// A sticker at scale 1 is this fraction of the nail's width: small, like real nail stickers,
// so two or three fit on one nail.
const STICKER_WIDTH_RATIO = 0.35
// Smallest and largest a sticker can be resized to, compared with its default size
// (from about a sixth of the nail's width to just over the whole width).
const MIN_STICKER_SCALE = 0.5
const MAX_STICKER_SCALE = 3.2
// Stickers respond to taps within this many screen pixels of their middle (a 32px circle).
const STICKER_TAP_RADIUS = 16

// A small off-screen drawing surface, used only to ask "is this point inside this outline?"
// and "how wide is this text?".
const outlineChecker = document.createElement('canvas').getContext('2d')

// How wide a piece of nail text is, in the 24 x 24 sticker grid, so it can be centred.
function textWidth(text: string, fontFamily: string): number {
  if (!outlineChecker) return text.length * TEXT_SIZE * 0.6
  outlineChecker.font = `bold ${TEXT_SIZE}px ${fontFamily}`
  return outlineChecker.measureText(text).width
}


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
  onSelectNail: OnNailTap
  stickerEditing: StickerEditing | null
  drawing: DrawingTool | null
  mirrored: boolean // on the right hand, which is drawn as a flipped copy of the left
}

// Set while the Draw tab is open: the pen or eraser, and what to do with a finished line.
export type DrawingTool = {
  tool: 'pen' | 'eraser'
  color: string
  width: number // line thickness, in drawing units
  onAddStroke: (nailId: number, stroke: Stroke) => void
  onEraseStroke: (nailId: number, strokeId: string) => void
}

// How close (in screen pixels) the eraser has to get to a line to remove it.
const ERASER_REACH = 6

// The shortest distance from point p to the line segment a-b.
function distanceToSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax
  const dy = by - ay
  const lengthSquared = dx * dx + dy * dy
  const t = lengthSquared === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lengthSquared))
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy))
}

// A tap on a finger: which nail, and where on the nail (offset from its middle, in the same
// units as a sticker's x and y). `at` is missing when the tap wasn't on the nail itself.
export type OnNailTap = (nailId: number, at?: { x: number; y: number }) => void

// How the polish itself is painted. Plain is one colour (the nail's fill). Ombre fades from
// the effect colour at the tip to the polish colour at the cuticle. Chrome is the polish
// colour in bands of light and dark, like polished metal. Pearl is a slightly paler polish
// (its shimmer is drawn on top by NailEffect). The fill stays set to the polish colour.
function baseFill(nail: Nail, width: number, top: number, bottom: number): Partial<Konva.PathConfig> {
  switch (nail.baseEffect) {
    case 'ombre':
      return {
        fillPriority: 'linear-gradient',
        fillLinearGradientStartPoint: { x: 0, y: top },
        fillLinearGradientEndPoint: { x: 0, y: bottom },
        fillLinearGradientColorStops: [0, nail.effectColor, 0.2, nail.effectColor, 0.85, nail.baseColor, 1, nail.baseColor],
      }
    case 'chrome': {
      const base = nail.baseColor
      return {
        fillPriority: 'linear-gradient',
        fillLinearGradientStartPoint: { x: -width / 2, y: top },
        fillLinearGradientEndPoint: { x: width / 2, y: bottom },
        fillLinearGradientColorStops: [
          0, darken(base, 0.45),
          0.22, base,
          0.4, lighten(base, 0.8),
          0.5, lighten(base, 0.35),
          0.7, darken(base, 0.35),
          0.88, lighten(base, 0.5),
          1, darken(base, 0.25),
        ],
      }
    }
    case 'pearl':
      return { fill: lighten(nail.baseColor, 0.18) }
    default:
      return {}
  }
}

// Shows a pointing-hand cursor while the mouse is over a finger.
function setCursor(event: Konva.KonvaEventObject<MouseEvent>, cursor: string) {
  const stage = event.target.getStage()
  if (stage) stage.container().style.cursor = cursor
}

function FingerShape({
  finger,
  nail,
  skinTone,
  isTargeted,
  onSelectNail,
  stickerEditing,
  drawing,
  mirrored,
}: FingerShapeProps) {
  // The line being drawn right now (shown while the finger moves, saved when it lifts).
  const [liveLine, setLiveLine] = useState<number[] | null>(null)
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

  // Tap areas are at least fingertip-sized, so on a small screen the tap areas of stickers
  // that sit close together overlap. Konva gives the tap to the sticker on top; instead, find
  // the sticker whose middle is closest to the finger. `node` is the sticker Konva chose.
  const closestStickerTo = (node: Konva.Node): string => {
    const pointer = node.getStage()?.getPointerPosition()
    const nailGroup = node.getParent()
    if (!pointer || !nailGroup) return node.id()
    const finger = nailGroup.getAbsoluteTransform().copy().invert().point(pointer)
    let closest = node.id()
    let closestDistance = Infinity
    for (const sticker of nail.stickers) {
      const distance = Math.hypot(sticker.x - finger.x, nailCentreY + sticker.y - finger.y)
      if (distance < closestDistance) {
        closest = sticker.id
        closestDistance = distance
      }
    }
    return closest
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

  // Draw tab: pressing on a nail starts a line (or, with the eraser, removes lines it touches).
  // The finger can then move anywhere; the stage reports every move until it lifts. A second
  // finger landing (a pinch) fires 'drawcancel', which throws the line away.
  const startDrawing = (event: Konva.KonvaEventObject<PointerEvent>) => {
    const tool = drawing
    const stage = event.target.getStage()
    const nailArea = (event.currentTarget as Konva.Group).findOne('.nail-area')
    if (!tool || !stage || !nailArea) return
    // The finger's position relative to the middle of the nail.
    const fingerOnNail = () => {
      const pointer = stage.getPointerPosition()
      if (!pointer) return null
      const local = nailArea.getAbsoluteTransform().copy().invert().point(pointer)
      return { x: local.x, y: local.y - nailCentreY }
    }
    const first = fingerOnNail()
    if (!first || !isOnNail({ x: first.x, y: first.y + nailCentreY })) return

    const eraseAt = (point: { x: number; y: number }) => {
      const reach = ERASER_REACH / Math.abs(nailArea.getAbsoluteScale().x)
      for (const stroke of nail.strokes) {
        const p = stroke.points
        const touched =
          p.length === 2
            ? Math.hypot(point.x - p[0], point.y - p[1]) < reach + stroke.width / 2
            : p.some(
                (_, i) =>
                  i % 2 === 0 &&
                  i + 3 < p.length &&
                  distanceToSegment(point.x, point.y, p[i], p[i + 1], p[i + 2], p[i + 3]) <
                    reach + stroke.width / 2,
              )
        if (touched) tool.onEraseStroke(nail.id, stroke.id)
      }
    }

    const points = [first.x, first.y]
    if (tool.tool === 'eraser') eraseAt(first)
    else setLiveLine(points.slice())

    const stop = () => {
      stage.off('.draw')
      window.removeEventListener('pointerup', finish)
    }
    const finish = () => {
      stop()
      setLiveLine(null)
      if (tool.tool !== 'pen') return
      // A tap without moving makes a dot.
      const line = points.length === 2 ? [...points, points[0] + 0.01, points[1]] : points
      tool.onAddStroke(nail.id, {
        id: `stroke-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        color: tool.color,
        width: tool.width,
        points: line,
      })
    }
    stage.on('pointermove.draw', () => {
      const point = fingerOnNail()
      if (!point) return
      if (tool.tool === 'eraser') return eraseAt(point)
      points.push(point.x, point.y)
      setLiveLine(points.slice())
    })
    stage.on('pointerup.draw pointercancel.draw', finish)
    stage.on('drawcancel.draw', () => {
      stop()
      setLiveLine(null)
    })
    window.addEventListener('pointerup', finish) // in case the finger lifts off the canvas
  }

  return (
    // The whole finger is clickable, so the target is big enough for a fingertip on a phone.
    // onPointerClick fires for mouse clicks, finger taps and pen taps alike.
    <Group
      x={x}
      y={y}
      rotation={angle}
      onPointerClick={(event) => {
        // Where on the nail the tap was, so a new sticker can go exactly there.
        const nailArea = (event.currentTarget as Konva.Group).findOne('.nail-area')
        const pointer = event.target.getStage()?.getPointerPosition()
        if (!nailArea || !pointer) return onSelectNail(nail.id)
        const local = nailArea.getAbsoluteTransform().copy().invert().point(pointer)
        onSelectNail(nail.id, isOnNail(local) ? { x: local.x, y: local.y - nailCentreY } : undefined)
      }}
      onPointerDown={drawing ? startDrawing : undefined}
      onMouseEnter={(event) => setCursor(event, drawing ? 'crosshair' : 'pointer')}
      onMouseLeave={(event) => setCursor(event, 'default')}
    >
      <Path
        data={fingerPath(finger)}
        fill={skinTone}
      />
      <Group
        name="nail-area"
        y={fingertipLine}
      >
        <Path
          id={`nail-${nail.id}`}
          nailShape={nail.shape}
          targeted={isTargeted}
          data={nailOutline}
          fill={nail.baseColor}
          {...baseFill(nail, nailWidth, nailTop, bedLength)}
        />
        {/* Stickers are clipped to the nail's exact outline, so nothing shows outside the
            nail, even while a sticker is being dragged or resized near the edge. clipFunc
            returns the same outline as the nail shape (an SVG path, as a Path2D). */}
        <Group clipFunc={() => [new Path2D(nailOutline)]}>
          {/* Pearl and glitter go over the polish, under the tip and stickers. */}
          <NailEffect
            nail={nail}
            outline={nailOutline}
            top={nailTop}
            bottom={bedLength}
            width={nailWidth}
          />
          {/* The French tip goes under the stickers, and is clipped to the nail like them. */}
          {nail.hasFrenchTip && (
            <Path
              data={frenchTipPath(nail.shape, nailWidth, nail.frenchTipThickness, nail.length)}
              fill={nail.frenchTipColor}
              listening={false}
            />
          )}
          {/* Freehand lines go over the polish and tip, under the stickers. */}
          {[...nail.strokes, ...(liveLine && drawing ? [{ id: 'live', color: drawing.color, width: drawing.width, points: liveLine }] : [])].map(
            (stroke) => (
              <Line
                key={stroke.id}
                y={nailCentreY}
                points={stroke.points.length === 2 ? [...stroke.points, stroke.points[0] + 0.01, stroke.points[1]] : stroke.points}
                stroke={stroke.color}
                strokeWidth={stroke.width}
                lineCap="round"
                lineJoin="round"
                tension={0.35}
                listening={false}
              />
            ),
          )}
          {nail.stickers.map((sticker) => (
            // Each sticker is a group of layers (see src/stickers.ts). The group is what moves,
            // resizes and turns; its layers just draw.
            <Group
              key={sticker.id}
              id={sticker.id}
              name="sticker"
              stickerType={sticker.type}
              mainColor={sticker.color}
              x={sticker.x}
              y={nailCentreY + sticker.y}
              // offset moves the design's middle (12, 12) onto the sticker's position,
              // so it also turns around its middle.
              offsetX={STICKER_SIZE / 2}
              offsetY={STICKER_SIZE / 2}
              // On the right hand (drawn as a flipped copy of the left) the sticker is flipped
              // back, so its picture and any text read the right way round.
              scaleX={stickerScale * sticker.scale * (mirrored ? -1 : 1)}
              scaleY={stickerScale * sticker.scale}
              rotation={sticker.rotation}
              // Stickers only respond to taps and drags while they can be edited. Otherwise
              // taps pass through to the finger and choose the nail as usual.
              listening={stickerEditing !== null}
              draggable={stickerEditing !== null}
              onPointerClick={(event) => {
                event.cancelBubble = true // don't also count as a tap on the finger
                const group = event.target.findAncestor('.sticker', true) ?? event.target
                stickerEditing?.onSelect(closestStickerTo(group))
              }}
              onDragStart={(event) => {
                const node: Konva.Node = event.target
                // If the finger is closer to another sticker, drag that one instead.
                const closest = closestStickerTo(node)
                const other = closest !== node.id() ? node.getParent()?.findOne(`#${closest}`) : null
                if (other) {
                  node.stopDrag()
                  other.setAttr('lastOnNail', other.position())
                  other.startDrag()
                  stickerEditing?.onSelect(closest)
                  return
                }
                node.setAttr('lastOnNail', node.position())
                stickerEditing?.onSelect(sticker.id)
              }}
              dragBoundFunc={keepOnNail}
              onDragEnd={(event) => saveSticker(sticker.id, event.target)}
              onTransformEnd={(event) => saveSticker(sticker.id, event.target)}
            >
              {sticker.type === 'text' ? (
                // Text, centred on the middle of the sticker's 24 x 24 square. It responds to
                // taps too, so long words are easy to grab.
                (() => {
                  const fontFamily = TEXT_FONTS[sticker.font ?? 'script']
                  const width = textWidth(sticker.text ?? '', fontFamily) * 1.1 + 2
                  return (
                    <Text
                      text={sticker.text ?? ''}
                      x={STICKER_SIZE / 2 - width / 2}
                      y={STICKER_SIZE / 2 - TEXT_SIZE * 0.6}
                      width={width}
                      align="center"
                      fontFamily={fontFamily}
                      fontStyle="bold"
                      fontSize={TEXT_SIZE}
                      fill={sticker.color}
                    />
                  )
                })()
              ) : (
                STICKER_DESIGNS[sticker.type].layers.map((layer, index) => (
                  <Path
                    key={index}
                    data={layer.d}
                    fill={paint(layer.fill, sticker.color)}
                    stroke={paint(layer.stroke, sticker.color)}
                    strokeWidth={layer.strokeWidth}
                    lineCap="round"
                    lineJoin="round"
                    opacity={layer.opacity}
                    listening={false}
                  />
                ))
              )}
              {/* The area that responds to taps. It covers the sticker's 24 x 24 square, and
                  its hitFunc makes the tap area a circle at least STICKER_TAP_RADIUS screen
                  pixels wide, so even a tiny sticker is easy to tap with a fingertip.
                  getAbsoluteScale is how big one sticker unit is on screen right now (it
                  changes with the sticker's size and the zoom). */}
              <Circle
                x={STICKER_SIZE / 2}
                y={STICKER_SIZE / 2}
                radius={STICKER_SIZE / 2}
                fill="transparent"
                hitFunc={(context, shape) => {
                  const unitsPerPixel = 1 / Math.abs(shape.getAbsoluteScale().x)
                  const radius = Math.max(STICKER_SIZE * 0.6, STICKER_TAP_RADIUS * unitsPerPixel)
                  context.beginPath()
                  context.arc(0, 0, radius, 0, Math.PI * 2)
                  context.closePath()
                  context.fillStrokeShape(shape)
                }}
              />
            </Group>
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
  onSelectNail: OnNailTap
  stickerEditing: StickerEditing | null
  drawing: DrawingTool | null
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
  drawing,
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
        drawing={drawing}
        mirrored={mirrored}
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
