// A two-way switch: send changes to each nail on its own, or to all nails at once.
// Shown at the top of the Shape and Colour tabs. In "Each nail" mode it also says how many
// nails are chosen and offers a Clear link.

type ApplyToToggleProps = {
  applyToAll: boolean
  selectedCount: number // how many nails are chosen
  onChange: (applyToAll: boolean) => void
  onClear: () => void
  onCopyDesign?: () => void // offered when exactly one nail is chosen
  onMirror?: (from: 'left' | 'right') => void // copies one hand onto the other
}

const OPTIONS = [
  { applyToAll: false, label: 'Each nail' },
  { applyToAll: true, label: 'All nails' },
]

function ApplyToToggle({
  applyToAll,
  selectedCount,
  onChange,
  onClear,
  onCopyDesign,
  onMirror,
}: ApplyToToggleProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      {/* The switch, with the mirror links beside it (below it on a narrow phone). */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        <div
          role="group"
          aria-label="Apply changes to"
          className="flex rounded-full bg-stone-100 p-1"
        >
          {OPTIONS.map((option) => {
            const isActive = option.applyToAll === applyToAll
            return (
              <button
                key={option.label}
                type="button"
                aria-pressed={isActive}
                onClick={() => onChange(option.applyToAll)}
                className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                  isActive ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {option.label}
              </button>
            )
          })}
        </div>
        {/* Mirror: copy one hand's whole design onto the other, as a mirror image. */}
        {onMirror && (
          <p className="flex flex-wrap items-center justify-center gap-x-2 text-xs text-stone-500">
            Mirror:
            <button
              type="button"
              onClick={() => onMirror('left')}
              className="cursor-pointer font-semibold text-rose-700 underline underline-offset-2"
            >
              left hand to right
            </button>
            ·
            <button
              type="button"
              onClick={() => onMirror('right')}
              className="cursor-pointer font-semibold text-rose-700 underline underline-offset-2"
            >
              right hand to left
            </button>
          </p>
        )}
      </div>
      {/* Always shown, and always room for two lines, so the panel keeps its height when you
          switch modes or choose nails. (A taller panel would shrink the hands and move them
          under your finger.) */}
      <p className="flex min-h-8 flex-wrap items-center justify-center gap-x-2 text-center text-xs text-stone-500">
        {applyToAll
          ? 'Changes go to every nail. Tap a nail to work on it alone.'
          : selectedCount === 0
          ? 'Tap nails to choose them'
          : `${selectedCount} ${selectedCount === 1 ? 'nail' : 'nails'} chosen · tap a nail again to remove it`}
        {!applyToAll && selectedCount > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="cursor-pointer font-semibold text-rose-700 underline underline-offset-2"
          >
            Clear
          </button>
        )}
        {!applyToAll && selectedCount === 1 && onCopyDesign && (
          <button
            type="button"
            onClick={onCopyDesign}
            className="cursor-pointer font-semibold text-rose-700 underline underline-offset-2"
          >
            Copy design
          </button>
        )}
      </p>
    </div>
  )
}

export default ApplyToToggle
