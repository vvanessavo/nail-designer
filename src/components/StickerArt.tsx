// One sticker's layers as SVG, for the small pictures outside the canvas (the sticker buttons
// and the nail previews). Gradients (chrome, gel) become SVG gradients with their own ids.
// The canvas draws the same layers with Konva, in Hand.tsx.

import { useId } from 'react'
import { gradientStops, paint, type Gradient, type StickerDesign } from '../stickers'

type StickerArtProps = {
  design: StickerDesign
  color: string // the sticker's main colour
}

function StickerArt({ design, color }: StickerArtProps) {
  const idBase = useId()
  const gradientId = (index: number, part: 'fill' | 'stroke') => `${idBase}-${index}-${part}`.replace(/:/g, '')

  // A layer's fill or outline: a colour, a link to its gradient, or nothing.
  const svgPaint = (value: string | Gradient | undefined, index: number, part: 'fill' | 'stroke') =>
    value === undefined ? 'none' : typeof value === 'string' ? (paint(value, color) ?? 'none') : `url(#${gradientId(index, part)})`

  return (
    <>
      <defs>
        {design.layers.flatMap((layer, index) =>
          (['fill', 'stroke'] as const).flatMap((part) => {
            const value = layer[part]
            if (value === undefined || typeof value === 'string') return []
            return [
              <linearGradient
                key={`${index}-${part}`}
                id={gradientId(index, part)}
                gradientUnits="userSpaceOnUse"
                x1={value.from[0]}
                y1={value.from[1]}
                x2={value.to[0]}
                y2={value.to[1]}
              >
                {gradientStops(value, color).map(([at, stopColour]) => (
                  <stop
                    key={at}
                    offset={at}
                    stopColor={stopColour}
                  />
                ))}
              </linearGradient>,
            ]
          }),
        )}
      </defs>
      {design.layers.map((layer, index) => (
        <path
          key={index}
          d={layer.d}
          transform={layer.shift && `translate(${layer.shift[0]} ${layer.shift[1]})`}
          fill={svgPaint(layer.fill, index, 'fill')}
          stroke={svgPaint(layer.stroke, index, 'stroke')}
          strokeWidth={layer.strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={layer.opacity}
        />
      ))}
    </>
  )
}

export default StickerArt
