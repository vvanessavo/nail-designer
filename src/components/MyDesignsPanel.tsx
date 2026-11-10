// The My designs tab: start from a ready-made look, keep the current design under a name,
// and open, rename or delete designs kept earlier. Everything stays in this browser
// (see src/storage.ts).

import { useState } from 'react'
import { STARTERS } from '../starters'
import type { SavedDesign } from '../storage'
import NailPreview from './NailPreview'

type MyDesignsPanelProps = {
  designs: SavedDesign[]
  storageWorks: boolean // false if the browser refused to save (private browsing, storage full)
  onAdd: (name: string) => void
  onOpen: (id: string) => void
  onRename: (id: string, name: string) => void
  onDelete: (id: string) => void
  onNew: () => void
  onStarter: (starterId: string) => void
}

function MyDesignsPanel({
  designs,
  storageWorks,
  onAdd,
  onOpen,
  onRename,
  onDelete,
  onNew,
  onStarter,
}: MyDesignsPanelProps) {
  const [name, setName] = useState('')

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Ready-made looks: one row that scrolls sideways. */}
      <div className="flex w-full max-w-md flex-col gap-2">
        <span className="text-sm font-semibold text-stone-700">Start from a look</span>
        <div
          role="group"
          aria-label="Starter designs"
          className="flex max-w-full gap-2 overflow-x-auto p-1"
        >
          {STARTERS.map((starter) => (
            <button
              key={starter.id}
              type="button"
              onClick={() => onStarter(starter.id)}
              className="flex w-28 shrink-0 cursor-pointer flex-col items-center gap-1 rounded-xl border border-stone-200 bg-white p-2 text-xs font-semibold text-stone-700 transition hover:border-stone-400 active:scale-95"
            >
              <NailPreview nails={starter.nails} />
              {starter.name}
            </button>
          ))}
        </div>
      </div>
      <form
        className="flex w-full max-w-md gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          onAdd(name.trim() || `Design ${designs.length + 1}`)
          setName('')
        }}
      >
        {/* text-base (16px): a smaller font makes iPhones zoom the page when the box is tapped. */}
        <input
          type="text"
          aria-label="Design name"
          placeholder={`Design ${designs.length + 1}`}
          maxLength={40}
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="h-11 min-w-0 flex-1 rounded-xl border border-stone-200 bg-white px-3 text-base text-stone-800 placeholder:text-stone-400"
        />
        <button
          type="submit"
          className="h-11 shrink-0 cursor-pointer rounded-xl bg-rose-600 px-4 text-sm font-bold text-white transition hover:bg-rose-700 active:bg-rose-800"
        >
          Add to My designs
        </button>
      </form>

      {!storageWorks && (
        <p className="text-center text-xs text-rose-700">
          This browser isn't letting the app save (private browsing, or storage is full), so designs
          will be lost when you close the page.
        </p>
      )}

      <div className="flex w-full max-w-md items-center justify-between gap-2">
        <span className="text-sm font-semibold text-stone-700">
          {designs.length === 0 ? 'No saved designs yet' : `${designs.length} saved`}
        </span>
        <button
          type="button"
          onClick={onNew}
          className="h-9 cursor-pointer rounded-full border border-stone-200 px-3 text-sm font-semibold text-stone-700 transition hover:border-stone-400 active:bg-stone-100"
        >
          New design
        </button>
      </div>

      {designs.length > 0 && (
        <ul className="grid w-full max-w-md grid-cols-2 gap-3 sm:grid-cols-3">
          {designs.map((saved) => (
            <li
              key={saved.id}
              className="flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white"
            >
              <button
                type="button"
                onClick={() => onOpen(saved.id)}
                aria-label={`Open ${saved.name}`}
                className="cursor-pointer"
              >
                <img
                  src={saved.thumbnail}
                  alt=""
                  className="aspect-[3/2] w-full object-cover"
                />
              </button>
              <div className="flex flex-col gap-1 p-2">
                <span className="truncate text-sm font-semibold text-stone-800">{saved.name}</span>
                <span className="text-xs text-stone-500">
                  {new Date(saved.savedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => onOpen(saved.id)}
                    className="h-8 flex-1 cursor-pointer rounded-lg bg-rose-600 text-xs font-bold text-white transition hover:bg-rose-700"
                  >
                    Open
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const newName = window.prompt('New name for this design', saved.name)
                      if (newName?.trim()) onRename(saved.id, newName.trim())
                    }}
                    className="h-8 cursor-pointer rounded-lg border border-stone-200 px-2 text-xs font-semibold text-stone-600 transition hover:border-stone-400"
                  >
                    Rename
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${saved.name}`}
                    onClick={() => {
                      if (window.confirm(`Delete "${saved.name}"? This can't be undone.`)) onDelete(saved.id)
                    }}
                    className="h-8 w-8 cursor-pointer rounded-lg border border-rose-200 text-rose-700 transition hover:bg-rose-50"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default MyDesignsPanel
