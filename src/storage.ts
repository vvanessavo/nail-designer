// Keeps designs in this browser (localStorage), so nothing leaves the device:
// - the current design, saved after every change and opened again on the next visit
// - "My designs": designs the user chose to keep, each with a name and a small picture
//
// The browser can refuse (private browsing, storage full), so every read and write is
// wrapped in try / catch and the app keeps working without it.

import { createNail, initialState, type Design, type Nail } from './state/nailState'

const CURRENT_KEY = 'nail-designer.v1.current'
const DESIGNS_KEY = 'nail-designer.v1.designs'
const RECENT_KEY = 'nail-designer.v1.recent-colours'

export type SavedDesign = {
  id: string
  name: string
  savedAt: number // Date.now() when it was last saved
  thumbnail: string // a small JPEG of the design, as a data URL
  design: Design
}

// Fills in anything a design saved by an older version of the app doesn't have yet
// (e.g. nail length, added later), so old designs still open.
function upgrade(value: unknown): Design | null {
  if (!value || typeof value !== 'object') return null
  const saved = value as Partial<Design>
  if (!Array.isArray(saved.nails) || saved.nails.length !== initialState.nails.length) return null
  return {
    skinTone: typeof saved.skinTone === 'string' ? saved.skinTone : initialState.skinTone,
    nails: saved.nails.map((nail: Partial<Nail>, id) => ({ ...createNail(id), ...nail, id })),
  }
}

function read(key: string): unknown {
  try {
    const text = localStorage.getItem(key)
    return text ? JSON.parse(text) : null
  } catch {
    return null
  }
}

function write(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export const loadCurrentDesign = (): Design | null => upgrade(read(CURRENT_KEY))
export const saveCurrentDesign = (design: Design): boolean => write(CURRENT_KEY, design)

export function loadSavedDesigns(): SavedDesign[] {
  const list = read(DESIGNS_KEY)
  if (!Array.isArray(list)) return []
  return list.flatMap((item) => {
    const design = upgrade(item?.design)
    return design ? [{ ...item, design } as SavedDesign] : []
  })
}

// The colours used most recently (newest first), shown at the start of every colour row.
export function loadRecentColors(): string[] {
  const list = read(RECENT_KEY)
  return Array.isArray(list) ? list.filter((item): item is string => typeof item === 'string') : []
}
export const saveRecentColors = (colors: string[]): boolean => write(RECENT_KEY, colors)

// Saves the whole list. Returns false if the browser refused (e.g. storage is full).
export const storeSavedDesigns = (designs: SavedDesign[]): boolean => write(DESIGNS_KEY, designs)
