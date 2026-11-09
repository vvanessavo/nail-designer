// The Stickers tab: pick a sticker, then tap nails to place it.
// The picked sticker stays picked so it can go on several nails; tap it again to put it down.
// With nothing picked, tapping a placed sticker shows handles to move, resize and turn it.

import { useEffect } from 'react'
import { STICKER_SIZE, STICKERS, type StickerType } from '../stickers'
import ColourPicker, { type Preset } from './ColourPicker'

// Metallic colours that suit stickers, offered on top of the usual polish colours.
const STICKER_EXTRA_COLOURS: Preset[] = [
  { name: 'Gold', hex: '#D4AF37' },
  { name: 'Silver', hex: '#C0C0C0' },
]

type StickerPanelProps = {
  picked: StickerType | null // the sticker waiting to be placed, if any
  color: string // the selected sticker's colour, or the colour for new stickers
  hasSelectedSticker: boolean // a placed sticker is showing its handles
  onPick: (type: StickerType | null) => void
  onOpenChange: (open: boolean) => void // tells App when this tab opens and closes
  onColorChange: (color: string) => void // recolours the selected sticker, and sets new stickers' colour
  onDelete: () => void // removes the selected sticker
}

function StickerPanel({
  picked,
  color,
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
    <div className="flex flex-col items-center gap-3">
      <div
        role="group"
        aria-label="Stickers"
        className="grid grid-cols-6 gap-2"
      >
        {STICKERS.map(({ type, label, path }) => {
          const isPicked = type === picked
          return (
            <button
              key={type}
              type="button"
              onClick={() => onPick(isPicked ? null : type)}
              aria-pressed={isPicked}
              aria-label={label}
              title={label}
              className={`flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border bg-white transition ${
                isPicked
                  ? 'border-rose-600 ring-1 ring-rose-600'
                  : 'border-stone-200 hover:border-stone-400'
              }`}
            >
              <svg
                viewBox={`0 0 ${STICKER_SIZE} ${STICKER_SIZE}`}
                className="h-6 w-6 text-stone-700"
                aria-hidden="true"
              >
                <path
                  d={path}
                  fill="currentColor"
                />
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
            : 'Choose a colour and a sticker, then tap a nail. Tap a sticker on a nail to change it.'}
      </p>
      {/* Colour (for the selected sticker, or for new ones) and delete (greyed out until a
          sticker is tapped). Always shown, for the same reason: the panel keeps its height. */}
      <div className="flex w-full max-w-xl items-start gap-2 border-t border-stone-100 pt-2">
        <div className="min-w-0 flex-1">
          <ColourPicker
            label="Sticker colours"
            value={color}
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
          className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-rose-200 text-rose-700 hover:bg-rose-50 disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent"
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
