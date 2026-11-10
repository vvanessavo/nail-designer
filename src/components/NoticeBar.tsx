// A short message over the hands, e.g. "Link copied", with an optional action and a close
// button. Used for share links.

type NoticeBarProps = {
  message: string
  actionLabel?: string
  onAction?: () => void
  onClose: () => void
}

function NoticeBar({ message, actionLabel, onAction, onClose }: NoticeBarProps) {
  return (
    <div
      role="status"
      className="absolute top-0 left-1/2 z-10 flex w-max max-w-full -translate-x-1/2 flex-wrap items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-white/95 px-3 py-2 text-sm text-stone-700 shadow-sm"
    >
      <span>{message}</span>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="h-9 cursor-pointer rounded-full bg-rose-600 px-3 text-sm font-bold text-white transition hover:bg-rose-700 active:bg-rose-800"
        >
          {actionLabel}
        </button>
      )}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="h-9 w-9 cursor-pointer rounded-full text-stone-500 transition hover:bg-stone-100"
      >
        ✕
      </button>
    </div>
  )
}

export default NoticeBar
