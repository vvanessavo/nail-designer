// The Stickers tab: pick a sticker, then tap nails to place it.
// The picked sticker stays picked so it can go on several nails; tap it again to put it down.

import { useEffect } from 'react'
import { STICKER_SIZE, STICKERS, type StickerType } from '../stickers'

type StickerPanelProps = {
  picked: StickerType | null // the sticker waiting to be placed, if any
  onPick: (type: StickerType | null) => void
}

function StickerPanel({ picked, onPick }: StickerPanelProps) {
  // When this panel closes (the tab is closed or another tab opens), put the sticker down,
  // so tapping a nail goes back to choosing nails instead of placing stickers.
  useEffect(() => () => onPick(null), [onPick])

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
      <p className="text-center text-xs text-stone-500">
        {pickedLabel
          ? `Tap a nail to add the ${pickedLabel.toLowerCase()}. Tap the ${pickedLabel.toLowerCase()} again when you're done.`
          : 'Choose a sticker, then tap a nail'}
      </p>
    </div>
  )
}

export default StickerPanel
