// Picks a colour (the nails' base colour, or the French tip's): a grid of preset polish colours, plus a "Custom"
// button that opens a full colour picker (react-colorful) and a box for an exact hex code.

import { useState } from 'react'
import { HexColorInput, HexColorPicker } from 'react-colorful'

export type Preset = {
  name: string
  hex: string
}

// Every colour of the rainbow, plus brown, black and white. "Natural" is the nails'
// starting colour, so a fresh design shows a preset as chosen rather than "Custom".
const PRESETS: Preset[] = [
  { name: 'Natural', hex: '#F6DCD6' },
  { name: 'Red', hex: '#D7263D' },
  { name: 'Orange', hex: '#F28C28' },
  { name: 'Yellow', hex: '#F6D13A' },
  { name: 'Green', hex: '#3BAA5C' },
  { name: 'Blue', hex: '#2F6FDE' },
  { name: 'Indigo', hex: '#3F3A9E' },
  { name: 'Violet', hex: '#8E44AD' },
  { name: 'Brown', hex: '#7B4A2D' },
  { name: 'Black', hex: '#1C1C1C' },
  { name: 'White', hex: '#FFFFFF' },
]

const SWATCH =
  'h-9 w-9 shrink-0 cursor-pointer rounded-full border border-black/10 transition enabled:hover:scale-110 enabled:active:scale-95 disabled:cursor-default'
const SELECTED_RING = 'ring-2 ring-rose-600 ring-offset-2 ring-offset-white'

type ColourPickerProps = {
  value: string // hex, e.g. "#f6dcd6"; empty = nothing chosen
  onChange: (hex: string) => void
  label?: string // what screen readers call the group of swatches
  extraPresets?: Preset[] // more swatches before the standard ones, e.g. gold for stickers
  compact?: boolean // one row of swatches that scrolls sideways, instead of a grid
  disabled?: boolean // greyed out with nothing chosen (e.g. no sticker selected)
}

function ColourPicker({
  value,
  onChange,
  label = 'Polish colours',
  extraPresets = [],
  compact = false,
  disabled = false,
}: ColourPickerProps) {
  // Whether the full custom picker is open.
  const [showCustom, setShowCustom] = useState(false)
  const presets = [...extraPresets, ...PRESETS]
  const isPreset = presets.some((preset) => preset.hex.toLowerCase() === value.toLowerCase())
  const customOpen = showCustom && !disabled

  return (
    <div className={`flex max-w-full min-w-0 flex-col items-center ${compact ? 'gap-2' : 'gap-4'}`}>
      <div
        role="group"
        aria-label={label}
        // In a sideways-scrolling row, p-1 leaves room for the ring around the chosen swatch.
        className={`gap-2 ${compact ? 'flex max-w-full overflow-x-auto p-1.5' : 'grid grid-cols-6'} ${
          disabled ? 'opacity-40' : ''
        }`}
      >
        {presets.map((preset) => {
          const isSelected = !disabled && preset.hex.toLowerCase() === value.toLowerCase()
          return (
            <button
              key={preset.hex}
              type="button"
              disabled={disabled}
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
          disabled={disabled}
          onClick={() => setShowCustom(!showCustom)}
          aria-label="Custom colour"
          aria-expanded={customOpen}
          title="Custom colour"
          className={`${SWATCH} bg-[conic-gradient(red,yellow,lime,cyan,blue,magenta,red)] ${
            !disabled && ((value !== '' && !isPreset) || showCustom) ? SELECTED_RING : ''
          }`}
        />
      </div>

      {customOpen && (
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
