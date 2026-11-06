// The app's state: what every nail looks like, the skin tone, and which nails are selected.
// Keep these types in sync with the data model in PRD.md.

export type Finish = 'matte' | 'shiny'
export type NailShape = 'round' | 'square' | 'almond' | 'coffin'

export type Sticker = {
  id: string
  type: 'heart' | 'star' | 'dot' | 'sparkle' | 'line' | 'flower'
  x: number
  y: number
  scale: number
  color: string
}

export type Nail = {
  id: number // matches the SVG id: nail-0 ... nail-9
  shape: NailShape
  baseColor: string // hex
  finish: Finish
  hasFrenchTip: boolean
  frenchTipColor: string
  stickers: Sticker[]
}

export type AppState = {
  skinTone: string // hex
  nails: Nail[]
  selectedNailIds: number[]
}

// Every change to the state is described as an action. The reducer below decides what each
// action does, so all state changes live in one place.
export type Action =
  | { type: 'SELECT_NAIL'; nailId: number }
  | { type: 'SET_SKIN_TONE'; skinTone: string }
  | { type: 'SET_SHAPE'; shape: NailShape }
  | { type: 'SET_BASE_COLOR'; color: string }

const NAIL_COUNT = 10

function createNail(id: number): Nail {
  return {
    id,
    shape: 'round',
    baseColor: '#F6DCD6', // natural pink
    finish: 'shiny',
    hasFrenchTip: false,
    frenchTipColor: '#FFFFFF',
    stickers: [],
  }
}

export const initialState: AppState = {
  skinTone: '#E8B896',
  nails: Array.from({ length: NAIL_COUNT }, (_, id) => createNail(id)),
  selectedNailIds: [],
}

// Changes apply to the selected nails, or to every nail when none are selected.
export function isTargeted(state: AppState, nailId: number): boolean {
  return state.selectedNailIds.length === 0 || state.selectedNailIds.includes(nailId)
}

// Takes the current state and an action, and returns the new state.
// It never changes the old state; it builds a new object instead.
export function nailReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SELECT_NAIL':
      // One nail at a time for now. Selecting several nails comes in E2.
      return { ...state, selectedNailIds: [action.nailId] }
    case 'SET_SKIN_TONE':
      return { ...state, skinTone: action.skinTone }
    case 'SET_SHAPE':
      return {
        ...state,
        nails: state.nails.map((nail) =>
          isTargeted(state, nail.id) ? { ...nail, shape: action.shape } : nail,
        ),
      }
    case 'SET_BASE_COLOR':
      return {
        ...state,
        nails: state.nails.map((nail) =>
          isTargeted(state, nail.id) ? { ...nail, baseColor: action.color } : nail,
        ),
      }
  }
}
