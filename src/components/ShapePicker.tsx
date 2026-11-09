// Four buttons, one per nail shape, each with a small drawing of the shape.

import { nailShapePath } from '../shapes'
import type { NailShape } from '../state/nailState'

const SHAPES: { shape: NailShape; label: string }[] = [
  { shape: 'round', label: 'Round' },
  { shape: 'square', label: 'Square' },
  { shape: 'almond', label: 'Almond' },
  { shape: 'coffin', label: 'Coffin' },
  { shape: 'stiletto', label: 'Stiletto' },
  { shape: 'squoval', label: 'Squoval' },
  { shape: 'natural', label: 'Natural' },
]

// Size of the nail drawn in each preview.
const PREVIEW_WIDTH = 20
const PREVIEW_BED = 18

type ShapePickerProps = {
  value: NailShape | null // the shape the target nails share, or null if they differ
  onChange: (shape: NailShape) => void
}

function ShapePicker({ value, onChange }: ShapePickerProps) {
  return (
    // min-w-0: a fieldset otherwise refuses to be narrower than its contents, which would
    // stop the row below from scrolling.
    <fieldset className="flex w-full min-w-0 flex-col items-center gap-2">
      <legend className="sr-only">Nail shape</legend>
      {/* One row that scrolls sideways when the shapes don't all fit (on a phone).
          p-1 leaves room for the ring around the chosen shape. */}
      <div className="flex max-w-full gap-2 overflow-x-auto p-1">
        {SHAPES.map(({ shape, label }) => {
          const isSelected = shape === value
          return (
            <button
              key={shape}
              type="button"
              onClick={() => onChange(shape)}
              aria-pressed={isSelected}
              className={`flex w-18 shrink-0 cursor-pointer flex-col items-center gap-1 rounded-xl border bg-white px-2 py-2 text-xs font-semibold transition active:scale-95 ${
                isSelected
                  ? 'border-rose-600 text-rose-700 ring-1 ring-rose-600'
                  : 'border-stone-200 text-stone-600 hover:border-stone-400'
              }`}
            >
              <svg
                // Tall enough for the longest shape (stiletto).
                viewBox="-14 -31 28 53"
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
    </fieldset>
  )
}

export default ShapePicker
