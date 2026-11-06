// A two-way switch: send changes to each nail on its own, or to all nails at once.
// Shown at the top of the Shape and Colour tabs.

type ApplyToToggleProps = {
  applyToAll: boolean
  hasSelection: boolean // whether a nail has been tapped yet
  onChange: (applyToAll: boolean) => void
}

const OPTIONS = [
  { applyToAll: false, label: 'Each nail' },
  { applyToAll: true, label: 'All nails' },
]

function ApplyToToggle({ applyToAll, hasSelection, onChange }: ApplyToToggleProps) {
  return (
    <div className="flex flex-col items-center gap-1">
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
              className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-medium transition ${
                isActive ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              {option.label}
            </button>
          )
        })}
      </div>
      {!applyToAll && !hasSelection && (
        <p className="text-xs text-stone-500">Tap a nail to choose it</p>
      )}
    </div>
  )
}

export default ApplyToToggle
