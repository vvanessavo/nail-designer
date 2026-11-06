// Picks the base colour for the nails: a grid of preset polish colours, plus a "Custom"
// button that opens a full colour picker (react-colorful) and a box for an exact hex code.

import { useState } from 'react'
import { HexColorInput, HexColorPicker } from 'react-colorful'

type Preset = {
  name: string
  hex: string
}

// Popular polish colours, from soft neutrals to bold darks.
const PRESETS: Preset[] = [
  { name: 'Natural', hex: '#F6DCD6' }, // the nails' starting colour
  { name: 'Nude', hex: '#E8C4B0' },
  { name: 'Ballet pink', hex: '#F4C2C2' },
  { name: 'Milky white', hex: '#F5F0EB' },
  { name: 'Hot pink', hex: '#E0457B' },
  { name: 'Coral', hex: '#F27D6B' },
  { name: 'Classic red', hex: '#B0123A' },
  { name: 'Cherry', hex: '#7A0C1E' },
  { name: 'Lilac', hex: '#C3A6D8' },
  { name: 'Sky blue', hex: '#9CC6E8' },
  { name: 'Sage', hex: '#A3B79A' },
  { name: 'Navy', hex: '#1F2A4D' },
  { name: 'Black', hex: '#1C1C1C' },
]

const SWATCH = 'h-9 w-9 shrink-0 cursor-pointer rounded-full border border-black/10 transition'
const SELECTED_RING = 'ring-2 ring-rose-600 ring-offset-2 ring-offset-white'

type ColourPickerProps = {
  value: string // hex, e.g. "#f6dcd6"
  onChange: (hex: string) => void
}

function ColourPicker({ value, onChange }: ColourPickerProps) {
  // Whether the full custom picker is open.
  const [showCustom, setShowCustom] = useState(false)
  const isPreset = PRESETS.some((preset) => preset.hex.toLowerCase() === value.toLowerCase())

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        role="group"
        aria-label="Polish colours"
        className="grid grid-cols-7 gap-2"
      >
        {PRESETS.map((preset) => {
          const isSelected = preset.hex.toLowerCase() === value.toLowerCase()
          return (
            <button
              key={preset.hex}
              type="button"
              onClick={() => onChange(preset.hex)}
              aria-label={preset.name}
              aria-pressed={isSelected}
              title={preset.name}
              style={{ backgroundColor: preset.hex }}
              className={`${SWATCH} ${isSelected ? SELECTED_RING : ''}`}
            />
          )
        })}
        {/* A rainbow swatch that opens the custom picker. It's ringed when the nails
            have a colour that isn't one of the presets. */}
        <button
          type="button"
          onClick={() => setShowCustom(!showCustom)}
          aria-label="Custom colour"
          aria-expanded={showCustom}
          title="Custom colour"
          className={`${SWATCH} bg-[conic-gradient(red,yellow,lime,cyan,blue,magenta,red)] ${
            !isPreset || showCustom ? SELECTED_RING : ''
          }`}
        />
      </div>

      {showCustom && (
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
        </div>
      )}
    </div>
  )
}

export default ColourPicker
