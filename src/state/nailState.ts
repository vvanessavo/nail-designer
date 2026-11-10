// The app's state: what every nail looks like, the skin tone, and which nails are selected.
// Keep these types in sync with the data model in PRD.md.

export type Finish = 'matte' | 'shiny'
export type BaseEffect = 'plain' | 'ombre' | 'chrome' | 'pearl' | 'glitter'
export type NailShape = 'round' | 'square' | 'almond' | 'coffin' | 'stiletto' | 'squoval' | 'natural'

export type Sticker = {
  id: string
  type:
    | 'daisy'
    | 'blossom'
    | 'rose'
    | 'vine'
    | 'bow'
    | 'cherries'
    | 'strawberry'
    | 'butterfly'
    | 'smiley'
    | 'heart'
    | 'evil-eye'
    | 'moon'
    | 'twinkle'
    | 'swirl'
    | 'text' // words or initials; see `text` and `font`
  x: number // offset from the centre of the nail, in drawing units (0 = centred)
  y: number
  scale: number // 1 = the default size, about a third of the nail's width
  rotation: number // degrees, turning clockwise
  color: string // the sticker's main colour (details like a daisy's centre keep their own)
  text?: string // only for type 'text'
  font?: TextFont // only for type 'text'
}

export type TextFont = 'script' | 'bold'

// A line drawn on a nail. Points are x, y pairs relative to the middle of the nail (like a
// sticker's position), in the same units as the drawing.
export type Stroke = {
  id: string
  color: string
  width: number
  points: number[] // [x1, y1, x2, y2, ...]
}

export type Nail = {
  id: number // matches the SVG id: nail-0 ... nail-9
  shape: NailShape
  length: number // 1 = the shape's usual length, 0.5 = half as long, 2 = twice as long
  baseColor: string // hex
  baseEffect: BaseEffect
  effectColor: string // ombre: the colour it fades to at the tip; glitter: the glitter's colour
  finish: Finish
  hasFrenchTip: boolean
  frenchTipColor: string
  // How deep the tip is: the share of the free edge it covers in the middle of the nail.
  // 1 reaches the fingertip line; more goes past it. Kept between the two limits below.
  frenchTipThickness: number
  stickers: Sticker[]
  strokes: Stroke[] // freehand drawing, in the order drawn
}

export type AppState = {
  skinTone: string // hex
  nails: Nail[]
  selectedNailIds: number[]
  applyToAll: boolean // true: changes go on every nail; false: only on the selected nails
}

// The parts of a placed sticker that can be changed: moving, resizing, turning and recolouring.
export type StickerChanges = Partial<
  Pick<Sticker, 'x' | 'y' | 'scale' | 'rotation' | 'color' | 'text' | 'font'>
>

// Every change to the state is described as an action. The reducer below decides what each
// action does, so all state changes live in one place.
export type Action =
  | { type: 'SELECT_NAIL'; nailId: number }
  | { type: 'SET_SKIN_TONE'; skinTone: string }
  | { type: 'SET_SHAPE'; shape: NailShape }
  | { type: 'SET_LENGTH'; length: number }
  | { type: 'SET_BASE_COLOR'; color: string }
  | { type: 'SET_BASE_EFFECT'; effect: BaseEffect }
  | { type: 'SET_EFFECT_COLOR'; color: string }
  | { type: 'SET_FRENCH_TIP'; on: boolean }
  | { type: 'SET_FINISH'; finish: Finish }
  | { type: 'SET_FRENCH_TIP_COLOR'; color: string }
  | { type: 'SET_FRENCH_TIP_THICKNESS'; thickness: number }
  | { type: 'SET_APPLY_TO_ALL'; applyToAll: boolean }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'ADD_STICKER'; nailId: number; sticker: Sticker }
  | { type: 'UPDATE_STICKER'; nailId: number; stickerId: string; changes: StickerChanges }
  | { type: 'DELETE_STICKER'; nailId: number; stickerId: string }
  | { type: 'ADD_STROKE'; nailId: number; stroke: Stroke }
  | { type: 'DELETE_STROKE'; nailId: number; strokeId: string }
  | { type: 'CLEAR_STROKES' } // removes the drawing from every nail
  | { type: 'LOAD_DESIGN'; design: Design } // opens a saved design, or a fresh one
  // Copies one nail's whole design onto other nails. `stamp` (e.g. the time) makes the copied
  // stickers' ids unique.
  | { type: 'PASTE_DESIGN'; fromNailId: number; toNailIds: number[]; stamp: number }
  // Copies one hand's design onto the other hand as a mirror image.
  | { type: 'MIRROR_HAND'; from: 'left' | 'right'; stamp: number }

const NAIL_COUNT = 10

// Shortest and longest a nail can be (see Nail.length), and the Short / Medium / Long presets.
export const MIN_LENGTH = 0.5
export const MAX_LENGTH = 2
export const LENGTH_PRESETS = [
  { label: 'Short', length: 0.6 },
  { label: 'Medium', length: 1 },
  { label: 'Long', length: 1.5 },
]

// Thinnest and thickest a French tip can be (see frenchTipThickness).
export const MIN_TIP_THICKNESS = 0.3
export const MAX_TIP_THICKNESS = 1.3

export function createNail(id: number): Nail {
  return {
    id,
    shape: 'round',
    length: 1,
    baseColor: '#F6DCD6', // natural pink
    baseEffect: 'plain',
    effectColor: '#FFFFFF',
    finish: 'shiny',
    hasFrenchTip: false,
    frenchTipColor: '#FFFFFF',
    frenchTipThickness: 0.8,
    stickers: [],
    strokes: [],
  }
}

export const initialState: AppState = {
  skinTone: '#E8B896',
  nails: Array.from({ length: NAIL_COUNT }, (_, id) => createNail(id)),
  selectedNailIds: [],
  applyToAll: true,
}

// A nail's everyday name, e.g. nail 2 is the "left middle finger". Nails are numbered left to
// right on screen: left pinky (0) to left thumb (4), then right thumb (5) to right pinky (9).
const FINGER_NAMES = ['pinky', 'ring finger', 'middle finger', 'index finger', 'thumb']
export function nailName(nailId: number): string {
  return nailId < 5 ? `left ${FINGER_NAMES[nailId]}` : `right ${FINGER_NAMES[9 - nailId]}`
}

// Whether a change (shape, colour...) will apply to this nail: every nail in "All nails"
// mode, otherwise only the selected ones.
export function isTargeted(state: AppState, nailId: number): boolean {
  return state.applyToAll || state.selectedNailIds.includes(nailId)
}

// A copy of `from`'s whole design for the nail `toId`: everything about the design, but the
// nail keeps its own number, and each copied sticker gets its own id.
function copyDesignOnto(from: Nail, toId: number, stamp: number): Nail {
  return {
    ...from,
    id: toId,
    stickers: from.stickers.map((sticker) => ({ ...sticker, id: `${sticker.id}~${toId}~${stamp}` })),
  }
}

// Takes the current state and an action, and returns the new state.
// It never changes the old state; it builds a new object instead.
export function nailReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SELECT_NAIL':
      // In "All nails" mode, tapping a nail means you want to work on that nail on its own:
      // switch to "Each nail" with just that nail chosen.
      if (state.applyToAll) {
        return { ...state, selectedNailIds: [action.nailId], applyToAll: false }
      }
      // In "Each nail" mode, a tap adds the nail to the selection, or removes it if it was
      // already chosen. That's how you pick several nails.
      return {
        ...state,
        selectedNailIds: state.selectedNailIds.includes(action.nailId)
          ? state.selectedNailIds.filter((id) => id !== action.nailId)
          : [...state.selectedNailIds, action.nailId],
      }
    case 'CLEAR_SELECTION':
      return { ...state, selectedNailIds: [] }
    case 'ADD_STICKER':
      return {
        ...state,
        nails: state.nails.map((nail) =>
          nail.id === action.nailId
            ? { ...nail, stickers: [...nail.stickers, action.sticker] }
            : nail,
        ),
      }
    case 'UPDATE_STICKER':
      return {
        ...state,
        nails: state.nails.map((nail) =>
          nail.id === action.nailId
            ? {
                ...nail,
                stickers: nail.stickers.map((sticker) =>
                  sticker.id === action.stickerId ? { ...sticker, ...action.changes } : sticker,
                ),
              }
            : nail,
        ),
      }
    case 'DELETE_STICKER':
      return {
        ...state,
        nails: state.nails.map((nail) =>
          nail.id === action.nailId
            ? { ...nail, stickers: nail.stickers.filter((sticker) => sticker.id !== action.stickerId) }
            : nail,
        ),
      }
    case 'LOAD_DESIGN':
      return { ...state, ...action.design, selectedNailIds: [] }
    case 'ADD_STROKE':
      return {
        ...state,
        nails: state.nails.map((nail) =>
          nail.id === action.nailId ? { ...nail, strokes: [...nail.strokes, action.stroke] } : nail,
        ),
      }
    case 'DELETE_STROKE':
      return {
        ...state,
        nails: state.nails.map((nail) =>
          nail.id === action.nailId
            ? { ...nail, strokes: nail.strokes.filter((stroke) => stroke.id !== action.strokeId) }
            : nail,
        ),
      }
    case 'CLEAR_STROKES':
      return { ...state, nails: state.nails.map((nail) => ({ ...nail, strokes: [] })) }
    case 'PASTE_DESIGN': {
      const from = state.nails.find((nail) => nail.id === action.fromNailId)
      if (!from) return state
      return {
        ...state,
        nails: state.nails.map((nail) =>
          action.toNailIds.includes(nail.id) && nail.id !== from.id
            ? copyDesignOnto(from, nail.id, action.stamp)
            : nail,
        ),
      }
    }
    case 'MIRROR_HAND':
      // Finger i on the left hand matches finger 9 - i on the right (pinky to pinky, thumb
      // to thumb). The right hand is drawn as a mirror image of the left, so copying the
      // design as it is gives a mirror image: stickers, drawings and text land on the same
      // side (thumb side stays thumb side).
      return {
        ...state,
        nails: state.nails.map((nail) => {
          const onTargetHand = action.from === 'left' ? nail.id >= 5 : nail.id < 5
          return onTargetHand ? copyDesignOnto(state.nails[9 - nail.id], nail.id, action.stamp) : nail
        }),
      }
    case 'SET_APPLY_TO_ALL':
      return { ...state, applyToAll: action.applyToAll }
    case 'SET_SKIN_TONE':
      return { ...state, skinTone: action.skinTone }
    case 'SET_SHAPE':
      return {
        ...state,
        nails: state.nails.map((nail) =>
          isTargeted(state, nail.id) ? { ...nail, shape: action.shape } : nail,
        ),
      }
    case 'SET_LENGTH': {
      const length = Math.max(MIN_LENGTH, Math.min(MAX_LENGTH, action.length))
      return {
        ...state,
        nails: state.nails.map((nail) => (isTargeted(state, nail.id) ? { ...nail, length } : nail)),
      }
    }
    case 'SET_BASE_COLOR':
      return {
        ...state,
        nails: state.nails.map((nail) =>
          isTargeted(state, nail.id) ? { ...nail, baseColor: action.color } : nail,
        ),
      }
    case 'SET_FRENCH_TIP':
      return {
        ...state,
        nails: state.nails.map((nail) =>
          isTargeted(state, nail.id) ? { ...nail, hasFrenchTip: action.on } : nail,
        ),
      }
    case 'SET_BASE_EFFECT':
      return {
        ...state,
        nails: state.nails.map((nail) =>
          isTargeted(state, nail.id) ? { ...nail, baseEffect: action.effect } : nail,
        ),
      }
    case 'SET_EFFECT_COLOR':
      return {
        ...state,
        nails: state.nails.map((nail) =>
          isTargeted(state, nail.id) ? { ...nail, effectColor: action.color } : nail,
        ),
      }
    case 'SET_FINISH':
      return {
        ...state,
        nails: state.nails.map((nail) =>
          isTargeted(state, nail.id) ? { ...nail, finish: action.finish } : nail,
        ),
      }
    case 'SET_FRENCH_TIP_COLOR':
      return {
        ...state,
        nails: state.nails.map((nail) =>
          isTargeted(state, nail.id) ? { ...nail, frenchTipColor: action.color } : nail,
        ),
      }
    case 'SET_FRENCH_TIP_THICKNESS': {
      const thickness = Math.max(MIN_TIP_THICKNESS, Math.min(MAX_TIP_THICKNESS, action.thickness))
      return {
        ...state,
        nails: state.nails.map((nail) =>
          isTargeted(state, nail.id) ? { ...nail, frenchTipThickness: thickness } : nail,
        ),
      }
    }
  }
}

// ---------------------------------------------------------------------------------------------
// Undo and redo history
//
// The app keeps a list of earlier designs ("past") next to the current state ("present").
// Every design change saves the design before it; UNDO puts the last saved design back and
// keeps the current one in "future", so REDO can bring it back. A new change clears "future".

// Changing which nails are chosen isn't a design change, so it isn't saved or undone.
const NOT_UNDOABLE: Action['type'][] = ['SELECT_NAIL', 'CLEAR_SELECTION', 'SET_APPLY_TO_ALL']
// Changes of the same kind that come quicker than this (dragging the colour picker or the
// thickness slider) are saved as one step, so one undo takes back the whole drag.
const MERGE_WITHIN_MS = 600
// Big one-off changes are always their own undo step, however quickly they follow each other.
const NEVER_MERGED: Action['type'][] = ['LOAD_DESIGN', 'CLEAR_STROKES']
// How many steps back undo can go.
const MAX_UNDO_STEPS = 50

// The parts of the state that undo puts back. The nail selection stays as it is.
export type Design = Pick<AppState, 'skinTone' | 'nails'>

export type History = {
  past: Design[]
  present: AppState
  future: Design[] // designs that were undone, the most recently undone last
  lastChange: { key: string; time: number } | null // the most recent saved change
}

export type HistoryAction =
  | { type: 'DO'; action: Action; time: number } // time: when it happened (Date.now())
  | { type: 'UNDO' }
  | { type: 'REDO' }

export const initialHistory: History = { past: [], present: initialState, future: [], lastChange: null }

const designOf = (state: AppState): Design => ({ skinTone: state.skinTone, nails: state.nails })

// Two changes with the same key, close together, count as one undo step: same action,
// and for stickers the same sticker. Each paste of a copied design is its own step.
function changeKey(action: Action): string {
  if (action.type === 'PASTE_DESIGN' || action.type === 'MIRROR_HAND') {
    return `${action.type}:${action.stamp}` // never merged
  }
  if (action.type === 'ADD_STROKE') return `${action.type}:${action.stroke.id}` // one line, one step
  return 'stickerId' in action ? `${action.type}:${action.stickerId}` : action.type
}

export function historyReducer(history: History, historyAction: HistoryAction): History {
  const { past, present, future, lastChange } = history

  if (historyAction.type === 'UNDO') {
    const previous = past.at(-1)
    if (!previous) return history
    return {
      past: past.slice(0, -1),
      present: { ...present, ...previous },
      future: [...future, designOf(present)],
      lastChange: null, // the next change always starts a new step
    }
  }

  if (historyAction.type === 'REDO') {
    const next = future.at(-1)
    if (!next) return history
    return {
      past: [...past, designOf(present)],
      present: { ...present, ...next },
      future: future.slice(0, -1),
      lastChange: null,
    }
  }

  const { action, time } = historyAction
  const next = nailReducer(present, action)
  if (NOT_UNDOABLE.includes(action.type)) return { ...history, present: next }

  const key = changeKey(action)
  const continuesLastChange =
    !NEVER_MERGED.includes(action.type) &&
    lastChange !== null &&
    lastChange.key === key &&
    time - lastChange.time < MERGE_WITHIN_MS
  return {
    // Save the design from before this change, unless it continues the last one
    // (that one already saved the design from before it started).
    past: continuesLastChange
      ? past
      : [...past, designOf(present)].slice(-MAX_UNDO_STEPS),
    present: next,
    future: [], // a new change can't be redone into
    lastChange: { key, time },
  }
}
