// The Save button at the right end of the toolbar. It opens a small menu: save just the
// picture, or the picture with the nail recipe underneath (for showing a nail artist).

import { useEffect, useRef, useState } from 'react'

type SaveButtonProps = {
  onSave: (withRecipe: boolean) => void
}

const ITEM =
  'flex w-full cursor-pointer flex-col items-start rounded-lg px-3 py-2 text-left hover:bg-rose-50 active:bg-rose-100'

function SaveButton({ onSave }: SaveButtonProps) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close the menu when tapping anywhere else, or pressing Escape.
  useEffect(() => {
    if (!open) return
    const closeOutside = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('pointerdown', closeOutside)
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      window.removeEventListener('pointerdown', closeOutside)
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  const choose = (withRecipe: boolean) => {
    setOpen(false)
    onSave(withRecipe)
  }

  return (
    <div
      ref={menuRef}
      className="relative shrink-0"
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="menu"
        aria-expanded={open}
        title="Save your design as a picture (PNG)"
        className="flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-rose-600 px-3 text-sm font-bold text-white shadow-sm transition hover:bg-rose-700 active:bg-rose-800"
      >
        {/* An arrow pointing down into a tray: "download". */}
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
        </svg>
        Save
      </button>
      {open && (
        <div
          role="menu"
          className="absolute top-full right-0 z-20 mt-2 w-60 rounded-xl border border-stone-200 bg-white p-1 text-sm shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            onClick={() => choose(false)}
            className={ITEM}
          >
            <span className="font-semibold text-stone-800">Picture</span>
            <span className="text-xs text-stone-500">Just your nails, to keep or share</span>
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => choose(true)}
            className={ITEM}
          >
            <span className="font-semibold text-stone-800">Picture + recipe</span>
            <span className="text-xs text-stone-500">With a list of what's on each nail, for your nail artist</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default SaveButton
