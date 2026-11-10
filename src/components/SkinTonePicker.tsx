// The Skin tone tab: round swatches from fair to deep, an undertone switch (warm, neutral,
// cool) that shifts every tone, and a grayscale switch that draws the hand in grey so the
// nails stand out. The swatches show the chosen undertone.

import { handColour } from '../colour'
import type { Undertone } from '../state/nailState'

const UNDERTONES: { undertone: Undertone; label: string }[] = [
  { undertone: 'warm', label: 'Warm' },
  { undertone: 'neutral', label: 'Neutral' },
  { undertone: 'cool', label: 'Cool' },
]

type SkinTone = {
  name: string
  hex: string
}

const SKIN_TONES: SkinTone[] = [
  { name: 'Fair', hex: '#F3D5C0' },
  { name: 'Light', hex: '#E8B896' },
  { name: 'Light medium', hex: '#D9A27A' },
  { name: 'Medium', hex: '#C68A5E' },
  { name: 'Tan', hex: '#A86B45' },
  { name: 'Brown', hex: '#8D5524' },
  { name: 'Dark', hex: '#6B3F22' },
  { name: 'Deep', hex: '#4A2A17' },
]

type SkinTonePickerProps = {
  value: string
  undertone: Undertone
  grayscale: boolean
  onChange: (hex: string) => void
  onUndertoneChange: (undertone: Undertone) => void
  onGrayscaleChange: (on: boolean) => void
}

function SkinTonePicker({
  value,
  undertone,
  grayscale,
  onChange,
  onUndertoneChange,
  onGrayscaleChange,
}: SkinTonePickerProps) {
  return (
    <fieldset className="flex flex-col items-center gap-3">
      {/* The tab already says "Skin tone", so the label is only for screen readers. */}
      <legend className="sr-only">Skin tone</legend>
      {/* 2 rows of 4 on phones, 1 row of 8 from 640px wide. */}
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
        {SKIN_TONES.map((tone) => {
          const isSelected = tone.hex === value
          return (
            <button
              key={tone.hex}
              type="button"
              onClick={() => onChange(tone.hex)}
              aria-label={tone.name}
              aria-pressed={isSelected}
              title={tone.name}
              style={{ backgroundColor: handColour(tone.hex, undertone, false) }}
              className={`h-9 w-9 shrink-0 cursor-pointer rounded-full border border-black/10 transition hover:scale-110 active:scale-95 ${
                isSelected ? 'ring-2 ring-rose-600 ring-offset-2 ring-offset-rose-50' : ''
              }`}
            />
          )
        })}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <div
          role="group"
          aria-label="Undertone"
          className="flex items-center rounded-full bg-stone-100 p-1"
        >
          <span className="px-2 text-xs font-semibold text-stone-500">Undertone</span>
          {UNDERTONES.map((option) => {
            const isActive = option.undertone === undertone
            return (
              <button
                key={option.undertone}
                type="button"
                aria-pressed={isActive}
                onClick={() => onUndertoneChange(option.undertone)}
                className={`cursor-pointer rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                  isActive ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {option.label}
              </button>
            )
          })}
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={grayscale}
          onClick={() => onGrayscaleChange(!grayscale)}
          className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-2 text-sm font-semibold text-stone-700"
        >
          Grayscale hand
          {/* The track, with a knob that slides right when the switch is on. */}
          <span
            aria-hidden="true"
            className={`relative h-7 w-12 rounded-full transition ${grayscale ? 'bg-rose-600' : 'bg-stone-300'}`}
          >
            <span
              className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow transition ${grayscale ? 'translate-x-5' : ''}`}
            />
          </span>
        </button>
      </div>
    </fieldset>
  )
}

export default SkinTonePicker
