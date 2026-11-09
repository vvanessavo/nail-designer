// Two buttons to choose the polish finish: shiny (glossy highlights) or matte (flat, no shine).

import type { Finish } from '../state/nailState'

const FINISHES: { finish: Finish; label: string }[] = [
  { finish: 'shiny', label: 'Shiny' },
  { finish: 'matte', label: 'Matte' },
]

type FinishPickerProps = {
  value: Finish | null // the finish the target nails share, or null if they differ
  onChange: (finish: Finish) => void
}

function FinishPicker({ value, onChange }: FinishPickerProps) {
  return (
    <div
      role="group"
      aria-label="Finish"
      className="flex rounded-full bg-stone-100 p-1"
    >
      {FINISHES.map(({ finish, label }) => {
        const isActive = finish === value
        return (
          <button
            key={finish}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(finish)}
            className={`flex cursor-pointer items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold transition ${
              isActive ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            {/* A small dot of polish showing the finish: glossy with a highlight, or flat. */}
            <span
              aria-hidden="true"
              className={`h-4 w-4 rounded-full ${
                finish === 'shiny'
                  ? 'bg-[radial-gradient(circle_at_35%_30%,white_0,white_15%,#be123c_45%,#881337_100%)]'
                  : 'bg-[#c4566f]'
              }`}
            />
            {label}
          </button>
        )
      })}
    </div>
  )
}

export default FinishPicker
