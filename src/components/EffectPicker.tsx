// Chooses the polish effect: plain, ombre, chrome, pearl or glitter. Each button has a small
// preview dot. One row that scrolls sideways if it doesn't fit.

import type { BaseEffect } from '../state/nailState'

const EFFECTS: { effect: BaseEffect; label: string; preview: string }[] = [
  { effect: 'plain', label: 'Plain', preview: 'bg-rose-400' },
  { effect: 'ombre', label: 'Ombre', preview: 'bg-[linear-gradient(to_top,#fb7185,#fff)]' },
  {
    effect: 'chrome',
    label: 'Chrome',
    preview: 'bg-[linear-gradient(135deg,#6b6b6b,#e7e7e7_40%,#9a9a9a_55%,#f5f5f5_75%,#7a7a7a)]',
  },
  {
    effect: 'pearl',
    label: 'Pearl',
    preview: 'bg-[linear-gradient(135deg,#fff,#ffd6ec_35%,#d6ecff_60%,#fff)]',
  },
  {
    effect: 'glitter',
    label: 'Glitter',
    preview:
      'bg-[radial-gradient(#fff_20%,transparent_25%),radial-gradient(#d4af37_20%,transparent_25%)] bg-[length:5px_5px,7px_7px] bg-rose-400',
  },
]

type EffectPickerProps = {
  value: BaseEffect | null // the effect the target nails share, or null if they differ
  onChange: (effect: BaseEffect) => void
}

function EffectPicker({ value, onChange }: EffectPickerProps) {
  return (
    <div
      role="group"
      aria-label="Polish effect"
      className="flex max-w-full gap-1 overflow-x-auto rounded-full bg-stone-100 p-1"
    >
      {EFFECTS.map(({ effect, label, preview }) => {
        const isActive = effect === value
        return (
          <button
            key={effect}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(effect)}
            className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition ${
              isActive ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <span
              aria-hidden="true"
              className={`h-4 w-4 rounded-full border border-black/10 ${preview}`}
            />
            {label}
          </button>
        )
      })}
    </div>
  )
}

export default EffectPicker
