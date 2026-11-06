// Four buttons, one per nail shape, each with a small drawing of the shape.

import { nailShapePath } from '../shapes'
import type { NailShape } from '../state/nailState'

const SHAPES: { shape: NailShape; label: string }[] = [
  { shape: 'round', label: 'Round' },
  { shape: 'square', label: 'Square' },
  { shape: 'almond', label: 'Almond' },
  { shape: 'coffin', label: 'Coffin' },
]

// Size of the nail drawn in each preview.
const PREVIEW_WIDTH = 20
const PREVIEW_BED = 18

type ShapePickerProps = {
  value: NailShape | null // the shape the target nails share, or null if they differ
  targetLabel: string // e.g. "all nails" or "the selected nail"
  onChange: (shape: NailShape) => void
}

function ShapePicker({ value, targetLabel, onChange }: ShapePickerProps) {
  return (
    <fieldset className="flex flex-col items-center gap-2">
      <legend className="sr-only">Nail shape</legend>
      <div className="flex justify-center gap-2">
        {SHAPES.map(({ shape, label }) => {
          const isSelected = shape === value
          return (
            <button
              key={shape}
              type="button"
              onClick={() => onChange(shape)}
              aria-pressed={isSelected}
              className={`flex w-18 shrink-0 cursor-pointer flex-col items-center gap-1 rounded-xl border bg-white px-2 py-2 text-xs font-medium transition ${
                isSelected
                  ? 'border-rose-600 text-rose-700 ring-1 ring-rose-600'
                  : 'border-stone-200 text-stone-600 hover:border-stone-400'
              }`}
            >
              <svg
                viewBox="-14 -28 28 50"
                className="h-12 w-8"
                aria-hidden="true"
              >
                <path
                  d={nailShapePath(shape, PREVIEW_WIDTH, PREVIEW_BED)}
                  fill="#F6DCD6"
                  stroke="rgba(150, 90, 80, 0.6)"
                  strokeWidth={1}
                />
              </svg>
              {label}
            </button>
          )
        })}
      </div>
      <p className="text-xs text-stone-500">Applies to {targetLabel}</p>
    </fieldset>
  )
}

export default ShapePicker
