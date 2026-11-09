// The on-screen undo button, in the bottom-left corner of the hands area (opposite the zoom
// buttons). It's the touch-screen version of Cmd+Z / Ctrl+Z.

type UndoButtonProps = {
  disabled: boolean // nothing to undo yet
  onUndo: () => void
}

function UndoButton({ disabled, onUndo }: UndoButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onUndo}
      title="Undo (Cmd+Z / Ctrl+Z)"
      className="absolute bottom-0 left-0 flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-stone-200 bg-white/90 px-3 text-sm text-stone-700 shadow-sm disabled:cursor-default disabled:text-stone-300"
    >
      {/* A curved arrow pointing back. */}
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
      Undo
    </button>
  )
}

export default UndoButton
