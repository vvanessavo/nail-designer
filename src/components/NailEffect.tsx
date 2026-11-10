// The special base effects drawn over a nail's polish: pearl shimmer and glitter.
// (Plain, ombre and chrome are drawn by the nail's own fill; see baseFill in Hand.)
// Drawn inside the nail's clip group, so nothing shows outside the nail.

import type Konva from 'konva'
import { Path, Shape } from 'react-konva'
import { darken, lighten } from '../colour'
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
