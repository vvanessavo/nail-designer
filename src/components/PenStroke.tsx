// One drawn line, in the style of the pen it was drawn with (see PenType in nailState.ts).
// The fine liner is a plain Konva Line. The other pens are worked out as one filled outline
// (built in `sceneFunc`, Konva's way of drawing a custom shape), filled in one go: that way a
// sheer line is evenly see-through, without darker spots where its parts overlap.

import type { Context } from 'konva/lib/Context'
import { Line, Shape } from 'react-konva'
import type { Stroke } from '../state/nailState'

type PenStrokeProps = {
  stroke: Stroke
  y: number // where the middle of the nail is (points are relative to it)
}

type Point = { x: number; y: number }

// The points as x, y pairs, without points on top of each other (they'd have no direction).
function toPoints(flat: number[]): Point[] {
  const points: Point[] = []
  for (let i = 0; i + 1 < flat.length; i += 2) {
    const point = { x: flat[i], y: flat[i + 1] }
    const last = points[points.length - 1]
    if (!last || Math.hypot(point.x - last.x, point.y - last.y) > 0.05) points.push(point)
  }
  return points
}

// Adds a four-cornered piece to the outline, always going round the same way. With every
// piece wound the same way, overlapping pieces join up instead of cancelling into holes.
function addPiece(context: Context, corners: Point[]) {
  let area = 0
  corners.forEach((a, i) => {
    const b = corners[(i + 1) % corners.length]
    area += a.x * b.y - b.x * a.y
  })
  const ordered = area < 0 ? [...corners].reverse() : corners
  context.moveTo(ordered[0].x, ordered[0].y)
  ordered.slice(1).forEach((corner) => context.lineTo(corner.x, corner.y))
  context.closePath()
}

// Adds a round blob, wound the same way as the pieces.
function addDot(context: Context, centre: Point, radius: number) {
  context.moveTo(centre.x + radius, centre.y)
  context.arc(centre.x, centre.y, radius, 0, Math.PI * 2, false)
  context.closePath()
}

// Fountain pen: a flat nib held at a slant. Moving along the nib draws a hairline, moving
// across it draws the full width. Each step sweeps the nib from one point to the next.
function drawFountain(context: Context, points: Point[], width: number) {
  const nib = { x: Math.cos(-Math.PI / 4) * (width / 2), y: Math.sin(-Math.PI / 4) * (width / 2) }
  const hair = width * 0.08
  if (points.length === 1) {
    const [p] = points
    addPiece(context, [
      { x: p.x + nib.x - hair, y: p.y + nib.y - hair },
      { x: p.x + nib.x + hair, y: p.y + nib.y + hair },
      { x: p.x - nib.x + hair, y: p.y - nib.y + hair },
      { x: p.x - nib.x - hair, y: p.y - nib.y - hair },
    ])
    return
  }
  for (let i = 0; i + 1 < points.length; i++) {
    const a = points[i]
    const b = points[i + 1]
    // The nib sweep.
    addPiece(context, [
      { x: a.x + nib.x, y: a.y + nib.y },
      { x: b.x + nib.x, y: b.y + nib.y },
      { x: b.x - nib.x, y: b.y - nib.y },
      { x: a.x - nib.x, y: a.y - nib.y },
    ])
    // A thin line along the path too, so strokes along the nib don't vanish.
    const length = Math.hypot(b.x - a.x, b.y - a.y)
    const side = { x: (-(b.y - a.y) / length) * hair, y: ((b.x - a.x) / length) * hair }
    addPiece(context, [
      { x: a.x + side.x, y: a.y + side.y },
      { x: b.x + side.x, y: b.y + side.y },
      { x: b.x - side.x, y: b.y - side.y },
      { x: a.x - side.x, y: a.y - side.y },
    ])
  }
}

// Brush: starts full and round, swells a little, then tapers to a fine point at the end,
// like a nail-art brush lifted off the nail.
function drawBrush(context: Context, points: Point[], width: number) {
  if (points.length === 1) {
    addDot(context, points[0], width / 2)
    return
  }
  // How far along the line each point is, from 0 (start) to 1 (end).
  const along = [0]
  for (let i = 1; i < points.length; i++) {
    along.push(along[i - 1] + Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y))
  }
  const total = along[along.length - 1]
  const halfWidth = (i: number) => {
    const t = along[i] / total
    return (width / 2) * Math.max(0.05, Math.min(0.75 + t * 2, 1, (1 - t) * 2.2))
  }
  // Pieces between neighbouring points, each as wide as the brush is there.
  for (let i = 0; i + 1 < points.length; i++) {
    const a = points[i]
    const b = points[i + 1]
    const length = Math.hypot(b.x - a.x, b.y - a.y)
    const across = { x: -(b.y - a.y) / length, y: (b.x - a.x) / length }
    const wa = halfWidth(i)
    const wb = halfWidth(i + 1)
    addPiece(context, [
      { x: a.x + across.x * wa, y: a.y + across.y * wa },
      { x: b.x + across.x * wb, y: b.y + across.y * wb },
      { x: b.x - across.x * wb, y: b.y - across.y * wb },
      { x: a.x - across.x * wa, y: a.y - across.y * wa },
    ])
    // A round joint, so bends stay smooth.
    if (i > 0) addDot(context, a, wa)
  }
  addDot(context, points[0], halfWidth(0))
}

// Dotting tool: round dots spaced evenly along the line.
function drawDots(context: Context, points: Point[], width: number) {
  const radius = width / 2
  const gap = width * 1.8 // from one dot's middle to the next
  addDot(context, points[0], radius)
  let sinceLast = 0
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]
    const b = points[i]
    const length = Math.hypot(b.x - a.x, b.y - a.y)
    let travelled = gap - sinceLast
    while (travelled <= length) {
      addDot(context, { x: a.x + ((b.x - a.x) * travelled) / length, y: a.y + ((b.y - a.y) * travelled) / length }, radius)
      travelled += gap
    }
    sinceLast = length - (travelled - gap)
  }
}

const DRAWERS = { fountain: drawFountain, brush: drawBrush, dots: drawDots }

function PenStroke({ stroke, y }: PenStrokeProps) {
  const pen = stroke.pen ?? 'fine'
  const opacity = stroke.opacity ?? 1

  if (pen === 'fine') {
    return (
      <Line
        y={y}
        // A tap without moving is a single point: draw it as a tiny line, so it shows as a dot.
        points={stroke.points.length === 2 ? [...stroke.points, stroke.points[0] + 0.01, stroke.points[1]] : stroke.points}
        stroke={stroke.color}
        strokeWidth={stroke.width}
        lineCap="round"
        lineJoin="round"
        tension={0.35}
        opacity={opacity}
        listening={false}
      />
    )
  }

  const points = toPoints(stroke.points)
  const draw = DRAWERS[pen]
  return (
    <Shape
      y={y}
      fill={stroke.color}
      opacity={opacity}
      listening={false}
      sceneFunc={(context, shape) => {
        if (points.length === 0) return
        context.beginPath()
        draw(context, points, stroke.width)
        context.fillShape(shape)
      }}
    />
  )
}

export default PenStroke
