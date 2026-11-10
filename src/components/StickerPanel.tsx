// The Stickers tab: pick a sticker, then tap nails to place it.
// The picked sticker stays picked so it can go on several nails; tap it again to put it down.
// With nothing picked, tapping a placed sticker shows handles to move, resize and turn it.

import { useEffect } from 'react'
import { paint, STICKER_SIZE, STICKERS, type StickerType } from '../stickers'
import ColourPicker, { type Preset } from './ColourPicker'

// Metallic colours that suit stickers, offered on top of the usual polish colours.
const STICKER_EXTRA_COLOURS: Preset[] = [
  { name: 'Gold', hex: '#D4AF37' },
  { name: 'Silver', hex: '#C0C0C0' },
]

type StickerPanelProps = {
  picked: StickerType | null // the sticker waiting to be placed, if any
  color: string | null // the selected sticker's colour, or the colour for new stickers (null = original)
  isOriginalColor: boolean // the colour shown is the sticker's own original colour
  hasSelectedSticker: boolean // a placed sticker is showing its handles
  onPick: (type: StickerType | null) => void
  onOpenChange: (open: boolean) => void // tells App when this tab opens and closes
  // Recolours the selected sticker and sets new stickers' colour (null = original colours).
  onColorChange: (color: string | null) => void
  onDelete: () => void // removes the selected sticker
}

function StickerPanel({
  picked,
  color,
  isOriginalColor,
  hasSelectedSticker,
  onPick,
  onOpenChange,
  onColorChange,
  onDelete,
}: StickerPanelProps) {
  // Tell App the Stickers tab is open. When this panel closes (the tab is closed or another
  // tab opens), put any picked sticker down, so tapping a nail goes back to choosing nails.
  useEffect(() => {
    onOpenChange(true)
    return () => {
      onOpenChange(false)
      onPick(null)
    }
  }, [onOpenChange, onPick])

  const pickedLabel = STICKERS.find((sticker) => sticker.type === picked)?.label

  return (
    <div className="flex flex-col items-center gap-4">
      {/* One row that scrolls sideways; p-1 leaves room for the ring around the picked one.
          Each preview shows the sticker in the colour it will be placed in. */}
      <div
        role="group"
        aria-label="Stickers"
        className="flex max-w-full gap-2 overflow-x-auto p-1"
      >
        {STICKERS.map(({ type, label, layers, defaultColor }) => {
          const isPicked = type === picked
          return (
            <button
              key={type}
              type="button"
              onClick={() => onPick(isPicked ? null : type)}
              aria-pressed={isPicked}
              aria-label={label}
              title={label}
              className={`flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-xl border bg-white transition active:scale-95 ${
                isPicked
                  ? 'border-rose-600 ring-1 ring-rose-600'
                  : 'border-stone-200 hover:border-stone-400'
              }`}
            >
              <svg
                viewBox={`0 0 ${STICKER_SIZE} ${STICKER_SIZE}`}
                className="h-8 w-8"
                aria-hidden="true"
              >
                {layers.map((layer, index) => (
                  <path
                    key={index}
                    d={layer.d}
                    fill={paint(layer.fill, (!isOriginalColor && color) || defaultColor) ?? 'none'}
                    stroke={paint(layer.stroke, (!isOriginalColor && color) || defaultColor)}
                    strokeWidth={layer.strokeWidth}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={layer.opacity}
                  />
                ))}
              </svg>
            </button>
          )
        })}
      </div>
      {/* min-h keeps room for 3 lines whatever the hint says, so the panel never changes height
          when a sticker is tapped (that would re-fit the hands and move the sticker away). */}
      <p className="min-h-12 text-center text-xs text-stone-500">
        {pickedLabel
          ? `Tap a nail to add the ${pickedLabel.toLowerCase()}. Tap the ${pickedLabel.toLowerCase()} again when you're done.`
          : hasSelectedSticker
            ? 'Drag the sticker to move it. Drag a corner to resize it, or the top handle to turn it.'
            : 'Choose a sticker, then tap a nail. Pick a colour first to change it. Tap a sticker on a nail to edit it.'}
      </p>
      {/* Colour (for the selected sticker, or for new ones) and delete (greyed out until a
          sticker is tapped). Always shown, for the same reason: the panel keeps its height. */}
      <div className="flex w-full max-w-xl items-start gap-2 border-t border-stone-100 pt-3">
        {/* Back to the sticker's own colours (a white daisy, a pink bow...). */}
        <button
          type="button"
          onClick={() => onColorChange(null)}
          aria-pressed={isOriginalColor}
          title="Each sticker's original colours"
          className={`mt-1.5 h-9 shrink-0 cursor-pointer rounded-full border px-3 text-xs font-semibold transition ${
            isOriginalColor
              ? 'border-rose-600 text-rose-700 ring-1 ring-rose-600'
              : 'border-stone-200 text-stone-600 hover:border-stone-400'
          }`}
        >
          Original
        </button>
        <div className="min-w-0 flex-1">
          <ColourPicker
            label="Sticker colours"
            value={isOriginalColor ? '' : (color ?? '')}
            onChange={onColorChange}
            extraPresets={STICKER_EXTRA_COLOURS}
            compact
          />
        </div>
        <button
          type="button"
          onClick={onDelete}
          disabled={!hasSelectedSticker}
          aria-label="Delete sticker"
          title="Delete sticker"
          className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-rose-200 text-rose-700 transition enabled:hover:bg-rose-50 enabled:active:bg-rose-100 disabled:cursor-default disabled:opacity-40"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
          </svg>
        </button>
      </div>
    </div>
  )
}

export default StickerPanel
