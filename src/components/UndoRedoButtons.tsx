// The on-screen Undo and Redo buttons, in the bottom-left corner of the hands area (opposite
// the zoom buttons). They're the touch-screen version of Cmd+Z and Cmd+Shift+Z.

type UndoRedoButtonsProps = {
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
}

const BUTTON =
  'flex h-11 cursor-pointer items-center gap-2 text-sm font-semibold transition enabled:hover:bg-rose-50 enabled:active:bg-rose-100 disabled:cursor-default disabled:text-stone-300'

function UndoRedoButtons({ canUndo, canRedo, onUndo, onRedo }: UndoRedoButtonsProps) {
  // A curved arrow pointing back; Redo uses the same arrow flipped.
  const arrow = (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 14 4 9l5-5" />
      <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
    </svg>
  )
  return (
    <div className="absolute bottom-0 left-0 flex overflow-hidden rounded-xl border border-stone-200 bg-white/90 text-stone-700 shadow-sm">
      <button
        type="button"
        disabled={!canUndo}
        onClick={onUndo}
        title="Undo (Cmd+Z / Ctrl+Z)"
        className={`${BUTTON} px-3`}
      >
        {arrow}
        Undo
      </button>
      <button
        type="button"
        disabled={!canRedo}
        onClick={onRedo}
        aria-label="Redo"
        title="Redo (Cmd+Shift+Z / Ctrl+Y)"
        className={`${BUTTON} w-11 justify-center border-l border-stone-200 [&>svg]:-scale-x-100`}
      >
        {arrow}
      </button>
    </div>
  )
}

export default UndoRedoButtons
