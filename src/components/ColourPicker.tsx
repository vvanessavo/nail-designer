// Picks the base colour for the nails: a colour area and hue slider from react-colorful,
// plus a box to type an exact hex code (e.g. one copied from a polish brand's website).

import { HexColorInput, HexColorPicker } from 'react-colorful'

type ColourPickerProps = {
  value: string // hex, e.g. "#f6dcd6"
  targetLabel: string // e.g. "all nails" or "the selected nail"
  onChange: (hex: string) => void
}

function ColourPicker({ value, targetLabel, onChange }: ColourPickerProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <HexColorPicker
        color={value}
        onChange={onChange}
      />
      <label className="flex items-center gap-2 text-sm text-stone-600">
        Hex
        <HexColorInput
          color={value}
          onChange={onChange}
          prefixed
          aria-label="Hex colour code"
          className="w-24 rounded-md border border-stone-300 px-2 py-1 font-mono text-sm uppercase text-stone-800"
        />
      </label>
      <p className="text-xs text-stone-500">Applies to {targetLabel}</p>
    </div>
  )
}

export default ColourPicker
