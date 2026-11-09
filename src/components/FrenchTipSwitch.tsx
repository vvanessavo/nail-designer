// An on / off switch that adds or removes the French tip on the target nails.

type FrenchTipSwitchProps = {
  on: boolean
  disabled: boolean // no nails to apply it to (Each nail mode with nothing chosen)
  onChange: (on: boolean) => void
}

function FrenchTipSwitch({ on, disabled, onChange }: FrenchTipSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={() => onChange(!on)}
      className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-2 text-sm font-semibold text-stone-700 disabled:cursor-default disabled:opacity-40"
    >
      French tip
      {/* The track, with a knob that slides right when the switch is on. */}
      <span
        aria-hidden="true"
        className={`relative h-7 w-12 rounded-full transition ${on ? 'bg-rose-600' : 'bg-stone-300'}`}
      >
        <span
          className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow transition ${on ? 'translate-x-5' : ''}`}
        />
      </span>
    </button>
  )
}

export default FrenchTipSwitch
