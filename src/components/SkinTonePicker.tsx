// A row of round swatches, fair to deep. Tapping one changes the hands' skin tone.

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
  onChange: (hex: string) => void
}

function SkinTonePicker({ value, onChange }: SkinTonePickerProps) {
  return (
    <fieldset className="flex flex-col items-center gap-2">
      {/* The tab already says "Skin tone", so the label is only for screen readers. */}
      <legend className="sr-only">Skin tone</legend>
      <div className="flex justify-center gap-2">
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
              style={{ backgroundColor: tone.hex }}
              className={`h-9 w-9 shrink-0 cursor-pointer rounded-full border border-black/10 transition ${
                isSelected ? 'ring-2 ring-rose-600 ring-offset-2 ring-offset-rose-50' : ''
              }`}
            />
          )
        })}
      </div>
    </fieldset>
  )
}

export default SkinTonePicker
