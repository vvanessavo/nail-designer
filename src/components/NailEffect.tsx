// The special base effects drawn over a nail's polish: pearl shimmer, glitter and the
// patterns (marble, tortoiseshell, leopard, checkerboard, floral). Plain, ombre and chrome are
// drawn by the nail's own fill; see baseFill in Hand. Patterns use the polish colour as the
// background and the effect colour for the pattern.
// Drawn inside the nail's clip group, so nothing shows outside the nail.

import type Konva from 'konva'
import { Path, Shape } from 'react-konva'
import { darken, lighten, mix } from '../colour'
import type { Nail } from '../state/nailState'

type NailEffectProps = {
  nail: Nail
  outline: string // the nail's outline
  top: number // the tip of the nail
  bottom: number // the cuticle
  width: number // the nail's width
}

// A pseudo-random number generator that always gives the same numbers for the same seed, so
// a nail's glitter doesn't jump around every time something is redrawn.
function seeded(seed: number) {
  let value = seed * 9301 + 49297
  return () => {
    value = (value * 9301 + 49297) % 233280
    return value / 233280
  }
}

// A fully see-through version of a colour. Fading to this (rather than to see-through black)
// keeps a fade clean, without a grey ring where the colours blend.
const seeThrough = (hex: string) => `${hex.slice(0, 7)}00`

type PatternArea = {
  nail: Nail
  top: number
  bottom: number
  width: number
  random: () => number // the same numbers every time for this nail
}

// Each pattern paints on the canvas over the whole nail area (the clip trims it to the nail).
const PATTERNS = {
  // Soft wavy veins of different widths, some see-through.
  marble: (ctx: CanvasRenderingContext2D, { nail, top, bottom, width, random }: PatternArea) => {
    ctx.lineCap = 'round'
    for (let i = 0; i < 7; i++) {
      const x = (random() - 0.5) * width
      ctx.beginPath()
      ctx.moveTo(x, top - 2)
      ctx.bezierCurveTo(
        x + (random() - 0.5) * width,
        top + (bottom - top) * 0.35,
        x + (random() - 0.5) * width,
        top + (bottom - top) * 0.65,
        x + (random() - 0.5) * width * 0.6,
        bottom + 2,
      )
      ctx.strokeStyle = nail.effectColor
      ctx.globalAlpha = 0.25 + random() * 0.5
      ctx.lineWidth = width * (0.01 + random() * 0.04)
      ctx.stroke()
    }
    ctx.globalAlpha = 1
  },
  // Dark blotches that fade softly into the amber background.
  tortoise: (ctx: CanvasRenderingContext2D, { nail, top, bottom, width, random }: PatternArea) => {
    for (let i = 0; i < 14; i++) {
      const x = (random() - 0.5) * width * 1.1
      const y = top + random() * (bottom - top)
      const r = width * (0.12 + random() * 0.18)
      const fade = ctx.createRadialGradient(x, y, 0, x, y, r)
      fade.addColorStop(0, nail.effectColor)
      fade.addColorStop(0.55, nail.effectColor)
      fade.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = fade
      ctx.globalAlpha = 0.55 + random() * 0.4
      ctx.beginPath()
      ctx.ellipse(x, y, r, r * (0.7 + random() * 0.5), random() * Math.PI, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
  },
  // Spots: a slightly darker centre inside a broken ring.
  leopard: (ctx: CanvasRenderingContext2D, { nail, top, bottom, width, random }: PatternArea) => {
    const step = width * 0.32
    for (let y = top; y < bottom + step; y += step) {
      for (let x = -width / 2; x < width / 2 + step; x += step) {
        const cx = x + (random() - 0.5) * step * 0.5
        const cy = y + (random() - 0.5) * step * 0.5
        const r = step * (0.24 + random() * 0.12)
        ctx.fillStyle = mix(nail.baseColor, nail.effectColor, 0.3)
        ctx.beginPath()
        ctx.ellipse(cx, cy, r, r * 0.8, random() * Math.PI, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = nail.effectColor
        ctx.lineWidth = r * 0.45
        ctx.lineCap = 'round'
        // Two or three arcs around the centre, with gaps between them.
        const start = random() * Math.PI * 2
        for (let arc = 0; arc < 3; arc++) {
          ctx.beginPath()
          const from = start + (arc * Math.PI * 2) / 3
          ctx.ellipse(cx, cy, r * 1.2, r, 0, from, from + Math.PI * (0.35 + random() * 0.25))
          ctx.stroke()
        }
      }
    }
  },
  // Squares in the pattern colour on every other square.
  checker: (ctx: CanvasRenderingContext2D, { nail, top, bottom, width }: PatternArea) => {
    const size = width / 4
    ctx.fillStyle = nail.effectColor
    for (let row = 0; top + row * size < bottom; row++) {
      for (let column = 0; column < 4; column++) {
        if ((row + column) % 2 === 0) ctx.fillRect(-width / 2 + column * size, top + row * size, size, size)
      }
    }
  },
  // Little five-petal flowers with yellow middles, scattered over the nail.
  floral: (ctx: CanvasRenderingContext2D, { nail, top, bottom, width, random }: PatternArea) => {
    const step = width * 0.42
    for (let y = top + step / 2; y < bottom + step / 2; y += step) {
      for (let x = -width / 2 + step / 2; x < width / 2 + step / 2; x += step) {
        const cx = x + (random() - 0.5) * step * 0.6
        const cy = y + (random() - 0.5) * step * 0.6
        const r = step * 0.22
        const spin = random() * Math.PI
        ctx.fillStyle = nail.effectColor
        for (let petal = 0; petal < 5; petal++) {
          const angle = spin + (petal * Math.PI * 2) / 5
          ctx.beginPath()
          ctx.arc(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r, r * 0.75, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.fillStyle = '#F6C945'
        ctx.beginPath()
        ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  },
}

function NailEffect({ nail, outline, top, bottom, width }: NailEffectProps) {
  if (nail.baseEffect === 'pearl') {
    // A soft, see-through rainbow sheen over the polish, like the inside of a shell.
    return (
      <Path
        data={outline}
        listening={false}
        fillLinearGradientStartPoint={{ x: -width / 2, y: top }}
        fillLinearGradientEndPoint={{ x: width / 2, y: bottom }}
        fillLinearGradientColorStops={[
          0, 'rgba(255, 255, 255, 0.6)',
          0.3, 'rgba(255, 210, 235, 0.3)',
          0.55, 'rgba(205, 230, 255, 0.35)',
          0.8, 'rgba(255, 255, 255, 0.5)',
          1, 'rgba(255, 238, 215, 0.25)',
        ]}
      />
    )
  }

  if (nail.baseEffect === 'cat-eye') {
    // A bright band running down the nail, fading out to each side; effectAmount moves it
    // from left (0) to right (1). Slightly slanted, like a magnet-pulled cat-eye.
    // The gradient runs almost straight across the nail, so the band runs down its length.
    const centre = 0.15 + nail.effectAmount * 0.7
    const band = 0.22
    const clear = seeThrough(nail.effectColor)
    return (
      <Path
        data={outline}
        listening={false}
        fillLinearGradientStartPoint={{ x: -width / 2, y: top }}
        fillLinearGradientEndPoint={{ x: width / 2, y: top + width * 0.35 }}
        fillLinearGradientColorStops={[
          0, clear,
          Math.max(0, centre - band), clear,
          Math.max(0, centre - band * 0.35), nail.effectColor,
          centre, lighten(nail.effectColor, 0.6),
          Math.min(1, centre + band * 0.35), nail.effectColor,
          Math.min(1, centre + band), clear,
          1, clear,
        ]}
        opacity={0.85}
      />
    )
  }

  if (nail.baseEffect === 'aura') {
    // A soft glow in the effect colour, strongest in the middle of the nail.
    const middleY = (top + bottom) / 2
    const radius = width * (0.3 + nail.effectAmount * 0.7)
    return (
      <Path
        data={outline}
        listening={false}
        fillRadialGradientStartPoint={{ x: 0, y: middleY }}
        fillRadialGradientEndPoint={{ x: 0, y: middleY }}
        fillRadialGradientStartRadius={0}
        fillRadialGradientEndRadius={radius}
        fillRadialGradientColorStops={[0, nail.effectColor, 0.45, nail.effectColor, 1, seeThrough(nail.effectColor)]}
        opacity={0.9}
      />
    )
  }

  if (nail.baseEffect === 'jelly') {
    // The polish, see-through: effectAmount 0 is very sheer, 1 is nearly solid.
    return (
      <Path
        data={outline}
        fill={nail.baseColor}
        opacity={0.25 + nail.effectAmount * 0.6}
        listening={false}
      />
    )
  }

  const pattern = PATTERNS[nail.baseEffect as keyof typeof PATTERNS]
  if (pattern) {
    const random = seeded(nail.id + 7)
    return (
      <Shape
        listening={false}
        sceneFunc={(context: Konva.Context) =>
          pattern(context._context, { nail, top, bottom, width, random })
        }
      />
    )
  }

  if (nail.baseEffect === 'glitter') {
    // Lots of tiny specks in three shades of the glitter colour, so they show up on any polish.
    const colours = [nail.effectColor, lighten(nail.effectColor, 0.6), darken(nail.effectColor, 0.35)]
    const random = seeded(nail.id + 1)
    const specks = Array.from({ length: 70 }, () => ({
      x: (random() - 0.5) * width,
      y: top + random() * (bottom - top),
      r: width * (0.012 + random() * 0.03),
      shade: Math.floor(random() * colours.length),
    }))
    return (
      <Shape
        listening={false}
        // Draws every speck in one go, which is much quicker than one shape per speck.
        sceneFunc={(context: Konva.Context) => {
          colours.forEach((colour, shade) => {
            context.beginPath()
            for (const speck of specks.filter((s) => s.shade === shade)) {
              context.moveTo(speck.x + speck.r, speck.y)
              context.arc(speck.x, speck.y, speck.r, 0, Math.PI * 2)
            }
            context.setAttr('fillStyle', colour)
            context.fill()
          })
        }}
      />
    )
  }

  return null
}

export default NailEffect
