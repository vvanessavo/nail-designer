// A slider for how deep the French tip reaches down the nail.
// A native range input works with mouse, touch and keyboard (arrow keys) out of the box.

import { MAX_TIP_THICKNESS, MIN_TIP_THICKNESS } from '../state/nailState'

type TipThicknessSliderProps = {
  value: number
  onChange: (thickness: number) => void
}

function TipThicknessSlider({ value, onChange }: TipThicknessSliderProps) {
  return (
    <label className="flex w-full max-w-72 flex-col gap-1 text-sm font-medium text-stone-700">
      Tip thickness
      <div className="flex items-center gap-3 text-xs font-normal text-stone-500">
        Thin
        <input
          type="range"
          min={MIN_TIP_THICKNESS}
          max={MAX_TIP_THICKNESS}
          step={0.05}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-11 min-w-0 flex-1 cursor-pointer accent-rose-600"
        />
        Thick
      </div>
    </label>
  )
}

export default TipThicknessSlider
