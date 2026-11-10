// The Stickers tab: pick a sticker, then tap nails to place it.
// The picked sticker stays picked so it can go on several nails; tap it again to put it down.
// A new sticker shows handles to move, resize and turn it, and tapping any placed sticker
// does the same. With a sticker selected, it can be recoloured, moved in front of or behind
// the other stickers on its nail, or deleted.

import { Fragment, useEffect } from 'react'
import { paint, STICKER_SIZE, STICKERS, TEXT_MAX_LENGTH, type StickerType } from '../stickers'
import type { TextFont } from '../state/nailState'
import ColourPicker, { type Preset } from './ColourPicker'

// Metallic colours that suit stickers, offered on top of the usual polish colours.
const STICKER_EXTRA_COLOURS: Preset[] = [
  { name: 'Gold', hex: '#D4AF37' },
  { name: 'Silver', hex: '#C0C0C0' },
]

type StickerPanelProps = {
  picked: StickerType | 'text' | null // the sticker (or text) waiting to be placed, if any
  color: string | null // the selected sticker's colour, or the colour for new stickers (null = original)
  isOriginalColor: boolean // the colour shown is the sticker's own original colour
  hasSelectedSticker: boolean // a placed sticker is showing its handles
  onPick: (type: StickerType | 'text' | null) => void
  onOpenChange: (open: boolean) => void // tells App when this tab opens and closes
  // Recolours the selected sticker and sets new stickers' colour (null = original colours).
  onColorChange: (color: string | null) => void
  onDelete: () => void // removes the selected sticker
  onLayer: (to: 'front' | 'back') => void // moves the selected sticker in front of or behind the others
  text: { text: string; font: TextFont } // the words in the text box, and their font
  recentColors: string[]
  onTextChange: (text: { text: string; font: TextFont }) => void
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
  onLayer,
  text,
  onTextChange,
  recentColors,
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

  const pickedLabel =
    picked === 'text' ? 'Text' : STICKERS.find((sticker) => sticker.type === picked)?.label

  return (
    <div className="flex flex-col items-center gap-3">
      {/* One row that scrolls sideways; p-1 leaves room for the ring around the picked one.
          Each preview shows the sticker in the colour it will be placed in. */}
      <div
        role="group"
        aria-label="Stickers"
        className="flex max-w-full gap-2 overflow-x-auto p-1"
      >
        {STICKERS.map(({ type, label, layers, defaultColor, group }, index) => {
          // A thin line between the gems and the decal stickers.
          const afterGems = index > 0 && STICKERS[index - 1].group === 'Gems' && group !== 'Gems'
          const isPicked = type === picked
          return (
            <Fragment key={type}>
              {afterGems && (
                <span
                  aria-hidden="true"
                  className="w-px shrink-0 self-stretch bg-stone-200"
                />
              )}
              <button
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
            </Fragment>
          )
        })}
      </div>
      {/* Text on a nail: type up to TEXT_MAX_LENGTH characters, choose a font, tap a nail. */}
      <div className="flex w-full max-w-xl items-center gap-2">
        <button
          type="button"
          onClick={() => onPick(picked === 'text' ? null : 'text')}
          aria-pressed={picked === 'text'}
          title="Text"
          aria-label="Text"
          className={`flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-xl border bg-white font-[Dancing_Script] text-xl font-bold text-stone-700 transition active:scale-95 ${
            picked === 'text' ? 'border-rose-600 ring-1 ring-rose-600' : 'border-stone-200 hover:border-stone-400'
          }`}
        >
          Aa
        </button>
        {/* text-base (16px): a smaller font makes iPhones zoom the page when the box is tapped. */}
        <input
          type="text"
          aria-label="Text for a nail"
          placeholder="Initials or a word"
          maxLength={TEXT_MAX_LENGTH}
          value={text.text}
          onChange={(event) => onTextChange({ ...text, text: event.target.value })}
          className="h-11 min-w-0 flex-1 rounded-xl border border-stone-200 bg-white px-3 text-base text-stone-800 placeholder:text-stone-400"
        />
        <div
          role="group"
          aria-label="Text font"
          className="flex shrink-0 rounded-full bg-stone-100 p-1"
        >
          {(['script', 'bold'] as const).map((font) => (
            <button
              key={font}
              type="button"
              aria-pressed={text.font === font}
              onClick={() => onTextChange({ ...text, font })}
              className={`cursor-pointer rounded-full px-2.5 py-1 text-sm transition ${
                font === 'script' ? 'font-[Dancing_Script] font-bold' : 'font-bold'
              } ${text.font === font ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'}`}
            >
              {font === 'script' ? 'Script' : 'Bold'}
            </button>
          ))}
        </div>
      </div>
      {/* min-h keeps room for the longest hint (3 lines on a phone, 2 on a wider screen), so the panel never changes height
          when a sticker is tapped (that would re-fit the hands and move the sticker away). */}
      <p className="min-h-12 text-center text-xs text-stone-500 sm:min-h-8">
        {picked === 'text'
          ? text.text.trim()
            ? 'Tap a nail to add your text. Tap placed text to move it.'
            : 'Type your text, then tap a nail to add it.'
          : pickedLabel
          ? hasSelectedSticker
            ? 'Drag it to move it, a corner to resize, the top handle to turn. Tap a nail to add another.'
            : `Tap a nail to add the ${pickedLabel.toLowerCase()}. Tap a placed sticker to move it.`
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
            recent={recentColors}
            extraPresets={STICKER_EXTRA_COLOURS}
            compact
          />
        </div>
        {/* Bring to front and send to back, shown only while a sticker is selected (they'd
            only take room from the colours otherwise). */}
        {hasSelectedSticker && (['front', 'back'] as const).map((to) => (
          <button
            key={to}
            type="button"
            onClick={() => onLayer(to)}
            aria-label={to === 'front' ? 'Bring to front' : 'Send to back'}
            title={to === 'front' ? 'Bring to front' : 'Send to back'}
            className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-stone-200 text-stone-600 transition hover:border-stone-400 active:bg-stone-100"
          >
            {/* Two overlapping squares, the front one filled: the one in front is on top. */}
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {to === 'front' ? (
                <>
                  <rect
                    x="9"
                    y="9"
                    width="11"
                    height="11"
                    rx="2"
                  />
                  <rect
                    x="4"
                    y="4"
                    width="11"
                    height="11"
                    rx="2"
                    fill="currentColor"
                  />
                </>
              ) : (
                <>
                  <rect
                    x="9"
                    y="9"
                    width="11"
                    height="11"
                    rx="2"
                    fill="currentColor"
                  />
                  <rect
                    x="4"
                    y="4"
                    width="11"
                    height="11"
                    rx="2"
                    fill="white"
                  />
                </>
              )}
            </svg>
          </button>
        ))}
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
