// The bar shown over the hands while copying a nail's design: says which nail is being
// copied, and offers "Paste to all" and "Done".

type CopyBarProps = {
  fromName: string // e.g. "left middle finger"
  onPasteAll: () => void
  onDone: () => void
}

function CopyBar({ fromName, onPasteAll, onDone }: CopyBarProps) {
  return (
    <div
      role="status"
      className="absolute top-0 left-1/2 z-10 flex w-max max-w-full -translate-x-1/2 flex-wrap items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-white/95 px-3 py-2 text-sm text-stone-700 shadow-sm"
    >
      <span>
        Copying the <strong className="font-semibold">{fromName}</strong>. Tap nails to paste it.
      </span>
      <span className="flex gap-2">
        <button
          type="button"
          onClick={onPasteAll}
          className="h-9 cursor-pointer rounded-full border border-rose-200 px-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 active:bg-rose-100"
        >
          Paste to all
        </button>
        <button
          type="button"
          onClick={onDone}
          className="h-9 cursor-pointer rounded-full bg-rose-600 px-4 text-sm font-bold text-white transition hover:bg-rose-700 active:bg-rose-800"
        >
          Done
        </button>
      </span>
    </div>
  )
}

export default CopyBar
