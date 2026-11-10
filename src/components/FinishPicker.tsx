// Buttons to choose the polish finish: shiny, matte, satin, velvet or sugar. Each has a small
// dot of polish showing the finish. One row that scrolls sideways if it doesn't fit.

import type { Finish } from '../state/nailState'

const FINISHES: { finish: Finish; label: string; preview: string }[] = [
  {
    finish: 'shiny',
    label: 'Shiny',
    preview: 'bg-[radial-gradient(circle_at_35%_30%,white_0,white_15%,#be123c_45%,#881337_100%)]',
  },
  { finish: 'matte', label: 'Matte', preview: 'bg-[#c4566f]' },
  {
    finish: 'satin',
    label: 'Satin',
    preview: 'bg-[linear-gradient(120deg,#be123c_20%,#e48a9e_45%,#be123c_75%)]',
  },
  {
    finish: 'velvet',
    label: 'Velvet',
    preview: 'bg-[linear-gradient(90deg,#6b0f24,#e0567a_50%,#6b0f24)]',
  },
  {
    finish: 'sugar',
    label: 'Sugar',
    preview:
      'bg-[radial-gradient(#fff_25%,transparent_30%),radial-gradient(#fff_20%,transparent_25%)] bg-[length:4px_4px,5px_5px] bg-[position:0_0,2px_1px] bg-[#c4566f]',
  },
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
      className="flex max-w-full min-w-0 gap-1 overflow-x-auto rounded-full bg-stone-100 p-1"
    >
      {FINISHES.map(({ finish, label, preview }) => {
        const isActive = finish === value
        return (
          <button
            key={finish}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(finish)}
            className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold transition ${
              isActive ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <span
              aria-hidden="true"
              className={`h-4 w-4 rounded-full ${preview}`}
            />
            {label}
          </button>
        )
      })}
    </div>
  )
}

export default FinishPicker
