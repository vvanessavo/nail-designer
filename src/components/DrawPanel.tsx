// The Draw tab: pick a pen (or the eraser), a colour, a thickness and how sheer the ink is,
// then draw on a nail with a finger or the mouse. Every line is one undo step.

import { useEffect, type ReactElement } from 'react'
import type { PenType } from '../state/nailState'
import ColourPicker from './ColourPicker'

export type DrawSettings = {
  tool: 'pen' | 'eraser'
  pen: PenType
  color: string
  width: number
  opacity: number // ink: MIN_OPACITY (sheer) to 1 (solid)
}

// The most see-through the ink can be.
const MIN_OPACITY = 0.15

// The pens, each with a little picture of the line it draws (on a 24 x 12 grid).
const PENS: { pen: PenType; label: string; preview: ReactElement }[] = [
  {
    pen: 'fine',
    label: 'Fine liner',
    preview: (
      <path
        d="M2 9 C8 2 14 11 22 3"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    ),
  },
  {
    pen: 'fountain',
    label: 'Fountain pen',
    // Thick going one way, hairline going the other.
    preview: <path d="M2 10 L9 3 L11 3.6 L4 10.6 Z M10 3 L16 10 L16.6 9.5 L10.6 2.5 Z M16 10 L22 3 L23.4 3.8 L17.4 10.8 Z" fill="currentColor" />,
  },
  {
    pen: 'brush',
    label: 'Brush',
    // Full at the start, tapering to a point.
    preview: <path d="M3 6 C3 3.5 6 3.5 9 4.5 C14 6 18 7 23 6.5 C18 8 14 9 9 8.5 C6 8.2 3 8.5 3 6 Z" fill="currentColor" />,
  },
  {
    pen: 'dots',
    label: 'Dotting tool',
    preview: (
      <g fill="currentColor">
        <circle cx="4" cy="6" r="2" />
        <circle cx="10" cy="6" r="2" />
        <circle cx="16" cy="6" r="2" />
        <circle cx="22" cy="6" r="2" />
      </g>
    ),
  },
]

// Thinnest and thickest pen, in drawing units (a nail is about 15 to 20 units wide).
const MIN_WIDTH = 0.3
const MAX_WIDTH = 3

type DrawPanelProps = {
  settings: DrawSettings
  hasDrawing: boolean // any nail has a drawing (for "Clear all drawings")
  onChange: (settings: DrawSettings) => void
  onClearAll: () => void
  linesOverStickers: boolean // lines in front of stickers (false: behind)
  onLinesOverStickersChange: (on: boolean) => void
  onOpenChange: (open: boolean) => void // tells App when this tab opens and closes
  recentColors: string[]
}

function DrawPanel({
  settings,
  hasDrawing,
  onChange,
  onClearAll,
  onOpenChange,
  recentColors,
  linesOverStickers,
  onLinesOverStickersChange,
}: DrawPanelProps) {
  // Tell App the Draw tab is open, so taps on nails draw instead of choosing nails.
  useEffect(() => {
    onOpenChange(true)
    return () => onOpenChange(false)
  }, [onOpenChange])

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <div
          role="group"
          aria-label="Drawing tool"
          className="flex max-w-full gap-1 overflow-x-auto rounded-full bg-stone-100 p-1"
        >
          {PENS.map(({ pen, label, preview }) => {
            const isActive = settings.tool === 'pen' && settings.pen === pen
            return (
              <button
                key={pen}
                type="button"
                aria-pressed={isActive}
                onClick={() => onChange({ ...settings, tool: 'pen', pen })}
                className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                  isActive ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 12"
                  className="h-3 w-6"
                >
                  {preview}
                </svg>
                {label}
              </button>
            )
          })}
          <button
            type="button"
            aria-pressed={settings.tool === 'eraser'}
            onClick={() => onChange({ ...settings, tool: 'eraser' })}
            className={`shrink-0 cursor-pointer rounded-full px-3 py-1.5 text-sm font-semibold transition ${
              settings.tool === 'eraser' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Eraser
          </button>
        </div>
      </div>
      <p className="flex flex-wrap items-center justify-center gap-x-2 text-center text-xs text-stone-500">
        {settings.tool === 'pen' ? 'Draw on a nail. Tap for a dot. Zoom in for detail.' : 'Touch a line to remove it.'}
        {hasDrawing && (
          <button
            type="button"
            onClick={onClearAll}
            className="cursor-pointer font-semibold text-rose-700 underline underline-offset-2"
          >
            Clear all drawings
          </button>
        )}
      </p>
      {/* Thickness and ink side by side, or one above the other on a narrow phone. */}
      <div className="flex w-full flex-col items-center gap-x-6 sm:flex-row sm:justify-center">
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
      <label className="flex w-full max-w-72 items-center gap-3 text-xs text-stone-500">
        Sheer
        <input
          type="range"
          aria-label="Ink sheerness"
          min={MIN_OPACITY}
          max={1}
          step={0.05}
          value={settings.opacity}
          onChange={(event) => onChange({ ...settings, tool: 'pen', opacity: Number(event.target.value) })}
          className="h-11 min-w-0 flex-1 cursor-pointer accent-rose-600"
        />
        Solid
      </label>
      </div>
      {/* Whether lines sit behind the stickers on a nail, or in front of them. */}
      <div
        role="group"
        aria-label="Lines and stickers"
        className="flex items-center rounded-full bg-stone-100 p-1"
      >
        <span className="px-2 text-xs font-semibold text-stone-500">Lines go</span>
        {[false, true].map((over) => (
          <button
            key={String(over)}
            type="button"
            aria-pressed={linesOverStickers === over}
            onClick={() => onLinesOverStickersChange(over)}
            className={`cursor-pointer rounded-full px-3 py-1.5 text-sm font-semibold transition ${
              linesOverStickers === over ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            {over ? 'Over stickers' : 'Under stickers'}
          </button>
        ))}
      </div>
      <ColourPicker
        label="Pen colours"
        value={settings.color}
        onChange={(color) => onChange({ ...settings, color, tool: 'pen' })}
        recent={recentColors}
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
