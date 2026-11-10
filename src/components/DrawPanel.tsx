// The Draw tab: pick Pen or Eraser, a colour and a thickness, then draw on a nail with a
// finger or the mouse. Every line is one undo step.

import { useEffect } from 'react'
import ColourPicker from './ColourPicker'

export type DrawSettings = {
  tool: 'pen' | 'eraser'
  color: string
  width: number
}

// Thinnest and thickest pen, in drawing units (a nail is about 15 to 20 units wide).
const MIN_WIDTH = 0.3
const MAX_WIDTH = 3

type DrawPanelProps = {
  settings: DrawSettings
  hasDrawing: boolean // any nail has a drawing (for "Clear all drawings")
  onChange: (settings: DrawSettings) => void
  onClearAll: () => void
  onOpenChange: (open: boolean) => void // tells App when this tab opens and closes
}

function DrawPanel({ settings, hasDrawing, onChange, onClearAll, onOpenChange }: DrawPanelProps) {
  // Tell App the Draw tab is open, so taps on nails draw instead of choosing nails.
  useEffect(() => {
    onOpenChange(true)
    return () => onOpenChange(false)
  }, [onOpenChange])

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <div
          role="group"
          aria-label="Drawing tool"
          className="flex rounded-full bg-stone-100 p-1"
        >
          {(['pen', 'eraser'] as const).map((tool) => (
            <button
              key={tool}
              type="button"
              aria-pressed={settings.tool === tool}
              onClick={() => onChange({ ...settings, tool })}
              className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                settings.tool === tool ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {tool === 'pen' ? 'Pen' : 'Eraser'}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onClearAll}
          disabled={!hasDrawing}
          className="h-9 cursor-pointer rounded-full border border-rose-200 px-3 text-sm font-semibold text-rose-700 transition enabled:hover:bg-rose-50 enabled:active:bg-rose-100 disabled:cursor-default disabled:opacity-40"
        >
          Clear all drawings
        </button>
      </div>
      <p className="text-center text-xs text-stone-500">
        {settings.tool === 'pen'
          ? 'Draw on a nail with your finger or mouse. Tap for a dot. Zoom in for fine detail.'
          : 'Touch a line to remove it.'}
      </p>
      <label className="flex w-full max-w-72 items-center gap-3 text-xs text-stone-500">
        Thin
        <input
          type="range"
          aria-label="Pen thickness"
          min={MIN_WIDTH}
          max={MAX_WIDTH}
          step={0.1}
          value={settings.width}
          onChange={(event) => onChange({ ...settings, width: Number(event.target.value) })}
          className="h-11 min-w-0 flex-1 cursor-pointer accent-rose-600"
        />
        Thick
      </label>
      <ColourPicker
        label="Pen colours"
        value={settings.color}
        onChange={(color) => onChange({ ...settings, color, tool: 'pen' })}
        extraPresets={[
          { name: 'Gold', hex: '#D4AF37' },
          { name: 'Silver', hex: '#C0C0C0' },
        ]}
        compact
      />
    </div>
  )
}

export default DrawPanel
