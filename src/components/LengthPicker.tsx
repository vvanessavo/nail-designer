// Nail length: three quick presets (Short, Medium, Long) and a slider for anything in between.
// The slider is a native range input, so it works with mouse, touch and arrow keys.

import { LENGTH_PRESETS, MAX_LENGTH, MIN_LENGTH } from '../state/nailState'

type LengthPickerProps = {
  value: number | null // the length the target nails share, or null if they differ
  onChange: (length: number) => void
}

function LengthPicker({ value, onChange }: LengthPickerProps) {
  return (
    <div className="flex w-full max-w-72 flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-stone-700">Length</span>
        <div
          role="group"
          aria-label="Length presets"
          className="flex rounded-full bg-stone-100 p-1"
        >
          {LENGTH_PRESETS.map((preset) => {
            const isActive = value !== null && Math.abs(value - preset.length) < 0.01
            return (
              <button
                key={preset.label}
                type="button"
                aria-pressed={isActive}
                onClick={() => onChange(preset.length)}
                className={`cursor-pointer rounded-full px-3 py-1 text-xs font-semibold transition ${
                  isActive ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {preset.label}
              </button>
            )
          })}
        </div>
      </div>
      <label className="flex items-center gap-3 text-xs text-stone-500">
        Shorter
        <input
          type="range"
          aria-label="Nail length"
          min={MIN_LENGTH}
          max={MAX_LENGTH}
          step={0.05}
          // With mixed lengths the slider sits in the middle until it's moved.
          value={value ?? 1}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-11 min-w-0 flex-1 cursor-pointer accent-rose-600"
        />
        Longer
      </label>
    </div>
  )
}

export default LengthPicker
