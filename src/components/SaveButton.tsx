// The button that saves the design as a picture. Sits at the right end of the toolbar.

type SaveButtonProps = {
  onSave: () => void
}

function SaveButton({ onSave }: SaveButtonProps) {
  return (
    <button
      type="button"
      onClick={onSave}
      title="Save your design as a picture (PNG)"
      className="flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full bg-rose-600 px-3 text-sm font-medium text-white shadow-sm hover:bg-rose-700"
    >
      {/* An arrow pointing down into a tray: "download". */}
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
        <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
      </svg>
      Save
    </button>
  )
}

export default SaveButton
