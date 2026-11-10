// The finish: the top coat drawn over everything else on the nail (polish, tip, drawing,
// stickers). Drawn inside the nail's clip group, so nothing shows outside the nail.
//
// Shiny: two white streaks that fade out down the nail.
// Matte: a faint white haze, so the polish looks paler and flatter.
// Satin: one soft, wide sheen, between shiny and matte.
// Velvet: a glowing band of light down the middle and darker edges, like magnetic velvet polish.
// Sugar: a gritty, sparkly texture of tiny light and dark grains, like sugar sprinkled on.

import { Group, Path, Rect, Shape } from 'react-konva'
import { seeded } from '../random'
import type { Nail } from '../state/nailState'

type NailFinishProps = {
  nail: Nail
  outline: string // the nail's outline
  top: number // the tip of the nail (negative: above the fingertip line)
  bottom: number // the cuticle
  width: number // the nail's width
}

// Shiny polish catches the light: white streaks that fade out down the nail.
const GLOSS_STOPS = [0, 'rgba(255, 255, 255, 0.7)', 1, 'rgba(255, 255, 255, 0)']

function NailFinish({ nail, outline, top, bottom, width }: NailFinishProps) {
  const height = bottom - top

  switch (nail.finish) {
    case 'matte':
      return (
        <Path
          data={outline}
          fill="rgba(255, 255, 255, 0.14)"
          listening={false}
        />
      )

    case 'shiny':
      return (
        <Group listening={false}>
          {/* A long streak down the left side and a short one on the right. */}
          <Rect
            x={-width * 0.32}
            y={top * 0.7}
            width={width * 0.13}
            height={(bottom - top * 0.7) * 0.75}
            cornerRadius={width * 0.065}
            fillLinearGradientStartPoint={{ x: 0, y: 0 }}
            fillLinearGradientEndPoint={{ x: 0, y: (bottom - top * 0.7) * 0.75 }}
            fillLinearGradientColorStops={GLOSS_STOPS}
          />
          <Rect
            x={width * 0.2}
            y={top * 0.6}
            width={width * 0.08}
            height={(bottom - top * 0.6) * 0.3}
            cornerRadius={width * 0.04}
            fillLinearGradientStartPoint={{ x: 0, y: 0 }}
            fillLinearGradientEndPoint={{ x: 0, y: (bottom - top * 0.6) * 0.3 }}
            fillLinearGradientColorStops={GLOSS_STOPS}
          />
        </Group>
      )

    case 'satin':
      // One wide, soft sheen running across the nail at a slant, fading out at both sides.
      return (
        <Path
          data={outline}
          listening={false}
          fillLinearGradientStartPoint={{ x: -width / 2, y: top }}
          fillLinearGradientEndPoint={{ x: width / 2, y: top + height * 0.4 }}
          fillLinearGradientColorStops={[
            0, 'rgba(255, 255, 255, 0)',
            0.2, 'rgba(255, 255, 255, 0.05)',
            0.38, 'rgba(255, 255, 255, 0.32)',
            0.6, 'rgba(255, 255, 255, 0.05)',
            1, 'rgba(255, 255, 255, 0)',
          ]}
        />
      )

    case 'velvet':
      return (
        <Group listening={false}>
          {/* Darker towards the sides... */}
          <Path
            data={outline}
            fillLinearGradientStartPoint={{ x: -width / 2, y: 0 }}
            fillLinearGradientEndPoint={{ x: width / 2, y: 0 }}
            fillLinearGradientColorStops={[
              0, 'rgba(0, 0, 0, 0.35)',
              0.3, 'rgba(0, 0, 0, 0)',
              0.7, 'rgba(0, 0, 0, 0)',
              1, 'rgba(0, 0, 0, 0.35)',
            ]}
          />
          {/* ...and a soft band of light down the middle. */}
          <Path
            data={outline}
            fillLinearGradientStartPoint={{ x: -width / 2, y: top }}
            fillLinearGradientEndPoint={{ x: width / 2, y: top + height * 0.15 }}
            fillLinearGradientColorStops={[
              0.25, 'rgba(255, 255, 255, 0)',
              0.5, 'rgba(255, 255, 255, 0.42)',
              0.75, 'rgba(255, 255, 255, 0)',
            ]}
          />
        </Group>
      )

    case 'sugar': {
      // Tiny grains over the whole nail, the same every time for this nail. Most are light
      // (catching the light), some dark (the shadow side of a grain).
      const random = seeded(nail.id + 101)
      const grains = Array.from({ length: Math.round(width * height * 0.6) }, () => ({
        x: (random() - 0.5) * width,
        y: top + random() * height,
        r: width * (0.012 + random() * 0.02),
        light: random() < 0.7,
      }))
      return (
        <Group listening={false}>
          <Path
            data={outline}
            fill="rgba(255, 255, 255, 0.1)"
          />
          {(['light', 'dark'] as const).map((kind) => (
            <Shape
              key={kind}
              fill={kind === 'light' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.22)'}
              sceneFunc={(context, shape) => {
                context.beginPath()
                for (const grain of grains) {
                  if (grain.light !== (kind === 'light')) continue
                  context.moveTo(grain.x + grain.r, grain.y)
                  context.arc(grain.x, grain.y, grain.r, 0, Math.PI * 2, false)
                }
                context.fillShape(shape)
              }}
            />
          ))}
        </Group>
      )
    }
  }
}

export default NailFinish
