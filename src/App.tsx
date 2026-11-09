import { useCallback, useReducer, useState } from 'react'
import ApplyToToggle from './components/ApplyToToggle'
import ColourPicker from './components/ColourPicker'
import FrenchTipSwitch from './components/FrenchTipSwitch'
import Hands from './components/Hands'
import ShapePicker from './components/ShapePicker'
import SkinTonePicker from './components/SkinTonePicker'
import StickerPanel from './components/StickerPanel'
import Toolbar, { type ToolbarTab } from './components/Toolbar'
import { initialState, isTargeted, nailReducer, type StickerChanges } from './state/nailState'
import type { StickerType } from './stickers'

// New stickers start in gold, which shows up on most polish colours.
const STICKER_COLOR = '#D4AF37'

// A unique id for each sticker, so React and Konva can tell them apart.
function newStickerId(): string {
  return `sticker-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function App() {
  // useReducer keeps all the app's state in one object and changes it only through
  // actions, e.g. dispatch({ type: 'SELECT_NAIL', nailId: 3 }).
  const [state, dispatch] = useReducer(nailReducer, initialState)
  // The sticker picked in the Stickers tab and waiting to be placed. While one is picked,
  // tapping a nail places it instead of choosing that nail.
  const [pickedSticker, setPickedSticker] = useState<StickerType | null>(null)
  // Whether the Stickers tab is open. While it is, the hands are in "sticker mode": placed
  // stickers can be tapped to edit them, and nail taps don't choose nails.
  const [stickersTabOpen, setStickersTabOpen] = useState(false)
  // The placed sticker showing its move / resize / turn handles, if any.
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null)

  // useCallback keeps these functions the same between renders, because StickerPanel
  // runs an effect that depends on them.
  const handlePickSticker = useCallback((type: StickerType | null) => {
    setPickedSticker(type)
    if (type) setSelectedStickerId(null) // placing new stickers, so stop editing one
  }, [])
  const handleStickersTabOpen = useCallback((open: boolean) => {
    setStickersTabOpen(open)
    if (!open) setSelectedStickerId(null)
  }, [])

  const handleNailTap = (nailId: number) => {
    if (pickedSticker) {
      dispatch({
        type: 'ADD_STICKER',
        nailId,
        sticker: {
          id: newStickerId(),
          type: pickedSticker,
          x: 0,
          y: 0,
          scale: 1,
          rotation: 0,
          color: STICKER_COLOR,
        },
      })
    } else if (stickersTabOpen) {
      // In sticker mode, tapping a nail (not a sticker) just puts the handles away.
      setSelectedStickerId(null)
    } else {
      dispatch({ type: 'SELECT_NAIL', nailId })
    }
  }

  // Stickers can be edited while the Stickers tab is open and no sticker is picked to place.
  const stickerEditing =
    stickersTabOpen && pickedSticker === null
      ? {
          selectedId: selectedStickerId,
          onSelect: setSelectedStickerId,
          onChange: (nailId: number, stickerId: string, changes: StickerChanges) =>
            dispatch({ type: 'UPDATE_STICKER', nailId, stickerId, changes }),
        }
      : null

  // The nails a change will apply to: all of them, or only the selected ones.
  const targetNails = state.nails.filter((nail) => isTargeted(state, nail.id))
  const firstTarget = targetNails.at(0)
  // Highlight a shape only if every target nail already has it.
  const targetShape =
    firstTarget && targetNails.every((nail) => nail.shape === firstTarget.shape)
      ? firstTarget.shape
      : null

  // The "Each nail / All nails" switch, shown at the top of the Shape, Colour and French tip tabs.
  const applyToToggle = (
    <ApplyToToggle
      applyToAll={state.applyToAll}
      selectedCount={state.selectedNailIds.length}
      onChange={(applyToAll) => dispatch({ type: 'SET_APPLY_TO_ALL', applyToAll })}
      onClear={() => dispatch({ type: 'CLEAR_SELECTION' })}
    />
  )

  // One entry per tab in the toolbar. New features (shape, colour, stickers...) go here.
  const tabs: ToolbarTab[] = [
    {
      id: 'skin-tone',
      label: 'Skin tone',
      content: (
        <SkinTonePicker
          value={state.skinTone}
          onChange={(skinTone) => dispatch({ type: 'SET_SKIN_TONE', skinTone })}
        />
      ),
    },
    {
      id: 'shape',
      label: 'Shape',
      content: (
        <div className="flex flex-col items-center gap-4">
          {applyToToggle}
          <ShapePicker
            value={targetShape}
            onChange={(shape) => dispatch({ type: 'SET_SHAPE', shape })}
          />
        </div>
      ),
    },
    {
      id: 'colour',
      label: 'Colour',
      content: (
        <div className="flex flex-col items-center gap-4">
          {applyToToggle}
          <ColourPicker
            value={(firstTarget ?? state.nails[0]).baseColor}
            onChange={(color) => dispatch({ type: 'SET_BASE_COLOR', color })}
          />
        </div>
      ),
    },
    {
      id: 'french-tip',
      label: 'French tip',
      content: (
        <div className="flex flex-col items-center gap-4">
          {applyToToggle}
          <FrenchTipSwitch
            // Shown as on only if every target nail already has a tip.
            on={targetNails.length > 0 && targetNails.every((nail) => nail.hasFrenchTip)}
            disabled={targetNails.length === 0}
            onChange={(on) => dispatch({ type: 'SET_FRENCH_TIP', on })}
          />
        </div>
      ),
    },
    {
      id: 'stickers',
      label: 'Stickers',
      content: (
        <StickerPanel
          picked={pickedSticker}
          hasSelectedSticker={selectedStickerId !== null}
          onPick={handlePickSticker}
          onOpenChange={handleStickersTabOpen}
        />
      ),
    },
  ]

  return (
    // The app fills exactly one screen (h-dvh): toolbar on top, hands in the space left
    // below it. min-h-0 lets that space shrink when a panel opens, and the hands shrink with it.
    <div className="flex h-dvh flex-col bg-rose-50">
      <Toolbar tabs={tabs} />
      <main className="flex min-h-0 flex-1 items-center justify-center p-4">
        <Hands
          state={state}
          // In the Stickers tab, taps place or edit stickers, so the nail selection dots are hidden.
          showTargets={!stickersTabOpen}
          onSelectNail={handleNailTap}
          onTapBackground={() => setSelectedStickerId(null)}
          stickerEditing={stickerEditing}
        />
      </main>
    </div>
  )
}

export default App
