// Chooses the French tip style, each button with a small drawing of the style on a nail.
// One row that scrolls sideways.

import { frenchTipPath, nailShapePath } from '../shapes'
import type { FrenchTipStyle } from '../state/nailState'

const STYLES: { style: FrenchTipStyle; label: string }[] = [
  { style: 'classic', label: 'Classic' },
  { style: 'deep', label: 'Deep' },
  { style: 'micro', label: 'Micro' },
  { style: 'v', label: 'V' },
  { style: 'side', label: 'Side' },
  { style: 'double', label: 'Double' },
  { style: 'reverse', label: 'Reverse' },
]

// Size of the nail drawn in each preview.
const WIDTH = 16
const BED = 16

type TipStylePickerProps = {
  value: FrenchTipStyle | null // the style the target nails share, or null if they differ
  color: string // the tip colour, shown in the previews
  onChange: (style: FrenchTipStyle) => void
}

function TipStylePicker({ value, color, onChange }: TipStylePickerProps) {
  // A tip colour too pale to see on the light preview nail is drawn darker.
  const shown = color.toUpperCase() === '#FFFFFF' ? '#E11D48' : color
  return (
    <div
      role="group"
      aria-label="French tip style"
      className="flex max-w-full gap-2 overflow-x-auto p-1"
    >
      {STYLES.map(({ style, label }, index) => {
        const isSelected = style === value
        const outline = nailShapePath('almond', WIDTH, BED, 0.9)
        return (
          <button
            key={style}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onChange(style)}
            className={`flex w-16 shrink-0 cursor-pointer flex-col items-center gap-1 rounded-xl border bg-white px-1 py-1.5 text-xs font-semibold transition active:scale-95 ${
              isSelected ? 'border-rose-600 text-rose-700 ring-1 ring-rose-600' : 'border-stone-200 text-stone-600 hover:border-stone-400'
            }`}
          >
            <svg
              viewBox="-10 -18 20 36"
              className="h-10 w-6"
              aria-hidden="true"
            >
              <defs>
                <clipPath id={`tip-style-${index}`}>
                  <path d={outline} />
                </clipPath>
              </defs>
              <path
                d={outline}
                fill="#F6DCD6"
              />
              <path
                d={frenchTipPath('almond', WIDTH, 0.8, 0.9, style, BED)}
                fill={shown}
                clipPath={`url(#tip-style-${index})`}
              />
              <path
                d={outline}
                fill="none"
                stroke="rgba(150, 90, 80, 0.6)"
                strokeWidth={0.8}
              />
            </svg>
            {label}
          </button>
        )
      })}
    </div>
  )
}

export default TipStylePicker
