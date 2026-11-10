// A small picture of three nails from a design (ring, middle and index finger of the left
// hand), drawn as SVG. Used for the starter design cards. It shows shape, length, colour,
// effect, tip, finish and stickers, simplified.

import { useId } from 'react'
import { darken, lighten } from '../colour'
import { freeEdgeLength, frenchTipPath, nailShapePath } from '../shapes'
import type { Nail } from '../state/nailState'
import { paint, STICKER_DESIGNS, STICKER_SIZE } from '../stickers'

const WIDTH = 20 // each nail's width
const BED = 18 // how far each nail runs down the finger
const GAP = 8 // space between nails

type NailPreviewProps = {
  nails: Nail[] // a whole set; nails 1, 2 and 3 are shown
}

function NailPreview({ nails }: NailPreviewProps) {
  const uid = useId() // keeps gradient and clip ids unique when several previews are on screen
  const shown = [nails[1], nails[2], nails[3]]
  const tallest = Math.max(...shown.map((nail) => freeEdgeLength(nail.shape, WIDTH, nail.length)))
  const viewWidth = WIDTH * 3 + GAP * 2 + 4
  const viewHeight = tallest + BED + 4

  return (
    <svg
      viewBox={`${-WIDTH / 2 - 2} ${-tallest - 2} ${viewWidth} ${viewHeight}`}
      className="h-14 w-full"
      aria-hidden="true"
    >
      {shown.map((nail, index) => {
        const id = `${uid}-${index}`
        const outline = nailShapePath(nail.shape, WIDTH, BED, nail.length)
        const top = -freeEdgeLength(nail.shape, WIDTH, nail.length)
        const centreY = (BED + top) / 2
        const fill =
          nail.baseEffect === 'ombre' || nail.baseEffect === 'chrome'
            ? `url(#${id}-fill)`
            : nail.baseEffect === 'pearl'
              ? lighten(nail.baseColor, 0.18)
              : nail.baseColor
        return (
          <g
            key={id}
            transform={`translate(${index * (WIDTH + GAP)} 0)`}
          >
            <defs>
              <clipPath id={`${id}-clip`}>
                <path d={outline} />
              </clipPath>
              {nail.baseEffect === 'ombre' && (
                <linearGradient
                  id={`${id}-fill`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0.2" stopColor={nail.effectColor} />
                  <stop offset="0.85" stopColor={nail.baseColor} />
                </linearGradient>
              )}
              {nail.baseEffect === 'chrome' && (
                <linearGradient
                  id={`${id}-fill`}
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1"
                >
                  <stop offset="0" stopColor={darken(nail.baseColor, 0.45)} />
                  <stop offset="0.4" stopColor={lighten(nail.baseColor, 0.8)} />
                  <stop offset="0.7" stopColor={darken(nail.baseColor, 0.35)} />
                  <stop offset="1" stopColor={lighten(nail.baseColor, 0.5)} />
                </linearGradient>
              )}
            </defs>
            <path
              d={outline}
              fill={fill}
            />
            <g clipPath={`url(#${id}-clip)`}>
              {nail.baseEffect === 'pearl' && (
                <path
                  d={outline}
                  fill="white"
                  opacity="0.35"
                />
              )}
              {nail.baseEffect === 'glitter' &&
                [0.2, 0.5, 0.8].flatMap((fx) =>
                  [0.15, 0.35, 0.55, 0.75].map((fy) => (
                    <circle
                      key={`${fx}-${fy}`}
                      cx={(fx - 0.5) * WIDTH + (fy * 7) % 3}
                      cy={top + fy * (BED - top)}
                      r="0.7"
                      fill={nail.effectColor}
                    />
                  )),
                )}
              {nail.hasFrenchTip && (
                <path
                  d={frenchTipPath(nail.shape, WIDTH, nail.frenchTipThickness, nail.length)}
                  fill={nail.frenchTipColor}
                />
              )}
              {nail.stickers
                .filter((sticker) => sticker.type !== 'text')
                .map((sticker) => {
                  const scale = ((WIDTH * 0.35) / STICKER_SIZE) * sticker.scale
                  const design = sticker.type === 'text' ? null : STICKER_DESIGNS[sticker.type]
                  return (
                    <g
                      key={sticker.id}
                      transform={`translate(${sticker.x} ${centreY + sticker.y}) rotate(${sticker.rotation}) scale(${scale}) translate(-12 -12)`}
                    >
                      {design?.layers.map((layer, layerIndex) => (
                        <path
                          key={layerIndex}
                          d={layer.d}
                          fill={paint(layer.fill, sticker.color) ?? 'none'}
                          stroke={paint(layer.stroke, sticker.color)}
                          strokeWidth={layer.strokeWidth}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          opacity={layer.opacity}
                        />
                      ))}
                    </g>
                  )
                })}
              {nail.finish === 'shiny' && (
                <rect
                  x={-WIDTH * 0.32}
                  y={top * 0.7}
                  width={WIDTH * 0.12}
                  height={(BED - top * 0.7) * 0.7}
                  rx={WIDTH * 0.06}
                  fill="white"
                  opacity="0.45"
                />
              )}
            </g>
            <path
              d={outline}
              fill="none"
              stroke="rgba(150, 90, 80, 0.5)"
              strokeWidth="0.8"
            />
          </g>
        )
      })}
    </svg>
  )
}

export default NailPreview
