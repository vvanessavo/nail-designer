// A ribbon-style toolbar, like Word or Canva: a row of tabs across the top.
// Clicking a tab opens its panel of options underneath; clicking it again closes it.
// To add a feature, add one entry to the `tabs` list passed in from App.

import { useState, type ReactNode } from 'react'

export type ToolbarTab = {
  id: string
  label: string
  content: ReactNode // the options shown when this tab is open
}

type ToolbarProps = {
  tabs: ToolbarTab[]
  actions?: ReactNode // buttons at the right end of the tab row that are always there, e.g. Save
}

function Toolbar({ tabs, actions }: ToolbarProps) {
  // Which tab is open, or null when every panel is closed.
  const [openTabId, setOpenTabId] = useState<string | null>(null)
  const openTab = tabs.find((tab) => tab.id === openTabId)

  return (
    <header className="sticky top-0 z-10 w-full border-b border-rose-100 bg-white/90 shadow-sm backdrop-blur">
      {/* The tabs on the left, then any always-there buttons (like Save) on the right. */}
      <div className="mx-auto flex max-w-2xl items-center gap-2 pr-2">
        {/* overflow-x-auto lets the tabs scroll sideways on a phone once there are many. */}
        <div
          role="tablist"
          aria-label="Design tools"
          className="flex min-w-0 flex-1 gap-1 overflow-x-auto px-2"
        >
          {tabs.map((tab) => {
            const isOpen = tab.id === openTabId
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={isOpen}
                aria-expanded={isOpen}
                aria-controls={`panel-${tab.id}`}
                onClick={() => setOpenTabId(isOpen ? null : tab.id)}
                className={`shrink-0 cursor-pointer border-b-2 px-4 py-3 text-sm font-medium transition ${
                  isOpen
                    ? 'border-rose-600 text-rose-700'
                    : 'border-transparent text-stone-600 hover:text-stone-900'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
        {actions}
      </div>

      {openTab && (
        <div
          id={`panel-${openTab.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${openTab.id}`}
          // Capped at 45% of the screen height (scrolls inside if taller), so the hands
          // always stay visible below the toolbar.
          className="mx-auto max-h-[45dvh] max-w-2xl overflow-y-auto border-t border-rose-100 px-4 py-4"
        >
          {openTab.content}
        </div>
      )}
    </header>
  )
}

export default Toolbar
