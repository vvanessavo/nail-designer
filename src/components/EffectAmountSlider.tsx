// The slider for effects that have a "how much": where a cat-eye band sits, how big an aura
// glow is, or how strong jelly polish is. The labels come from EFFECT_AMOUNT_LABELS.

type EffectAmountSliderProps = {
  labels: { name: string; low: string; high: string }
  value: number // 0 to 1
  onChange: (amount: number) => void
}

function EffectAmountSlider({ labels, value, onChange }: EffectAmountSliderProps) {
  return (
    <label className="flex w-full max-w-72 flex-col gap-1 text-sm font-semibold text-stone-700">
      {labels.name}
      <div className="flex items-center gap-3 text-xs font-normal text-stone-500">
        {labels.low}
        <input
          type="range"
          aria-label={labels.name}
          min={0}
          max={1}
          step={0.05}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-11 min-w-0 flex-1 cursor-pointer accent-rose-600"
        />
        {labels.high}
      </div>
    </label>
  )
}

export default EffectAmountSlider
