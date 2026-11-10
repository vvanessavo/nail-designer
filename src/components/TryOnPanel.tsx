// The Try on tab: choose a photo of your hand, say which hand it is, then place the nails on
// it (in the canvas below, see TryOn.tsx) and save the picture. The photo stays on this device.

import { useEffect, useRef } from 'react'

export type TryOnHand = 'left' | 'right'

type TryOnPanelProps = {
  hasPhoto: boolean
  hand: TryOnHand
  onPhoto: (file: File) => void
  onHandChange: (hand: TryOnHand) => void
  onSave: () => void
  onOpenChange: (open: boolean) => void // tells App when this tab opens and closes
}

function TryOnPanel({ hasPhoto, hand, onPhoto, onHandChange, onSave, onOpenChange }: TryOnPanelProps) {
  // Tell App the Try on tab is open, so it shows the photo instead of the hands.
  useEffect(() => {
    onOpenChange(true)
    return () => onOpenChange(false)
  }, [onOpenChange])

  const fileInput = useRef<HTMLInputElement>(null)

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex flex-wrap items-center justify-center gap-3">
        {/* The real file picker is hidden; this button opens it. On a phone it also offers the camera. */}
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) onPhoto(file)
            event.target.value = '' // so choosing the same photo again still counts
          }}
        />
        <button
          type="button"
          onClick={() => fileInput.current?.click()}
          className="h-10 cursor-pointer rounded-full bg-rose-600 px-4 text-sm font-semibold text-white transition hover:bg-rose-700 active:bg-rose-800"
        >
          {hasPhoto ? 'Change photo' : 'Choose a photo of your hand'}
        </button>
        <div
          role="group"
          aria-label="Which hand is in the photo"
          className="flex items-center rounded-full bg-stone-100 p-1"
        >
          {(['left', 'right'] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={hand === option}
              onClick={() => onHandChange(option)}
              className={`cursor-pointer rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                hand === option ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {option === 'left' ? 'Left hand' : 'Right hand'}
            </button>
          ))}
        </div>
        {hasPhoto && (
          <button
            type="button"
            onClick={onSave}
            className="h-10 cursor-pointer rounded-full border border-rose-200 px-4 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 active:bg-rose-100"
          >
            Save picture
          </button>
        )}
      </div>
      <p className="text-center text-xs text-stone-500">
        {hasPhoto
          ? 'Drag each nail onto a fingernail. Tap a nail to resize or turn it.'
          : 'Back of your hand, fingers spread, in good light. Your photo stays on this device.'}
      </p>
    </div>
  )
}

export default TryOnPanel
