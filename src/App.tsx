import type Konva from 'konva'
import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import ApplyToToggle from './components/ApplyToToggle'
import ColourPicker from './components/ColourPicker'
import FinishPicker from './components/FinishPicker'
import FrenchTipSwitch from './components/FrenchTipSwitch'
import TipThicknessSlider from './components/TipThicknessSlider'
import Hands from './components/Hands'
import ShapePicker from './components/ShapePicker'
import SkinTonePicker from './components/SkinTonePicker'
import StickerPanel from './components/StickerPanel'
import SaveButton from './components/SaveButton'
import Toolbar, { type ToolbarTab } from './components/Toolbar'
import UndoButton from './components/UndoButton'
import {
  historyReducer,
  initialHistory,
  isTargeted,
  type Action,
  type StickerChanges,
} from './state/nailState'
import { exportDesign } from './exportImage'
import type { StickerType } from './stickers'

// Stickers start in gold, which shows up on most polish colours.
const FIRST_STICKER_COLOR = '#D4AF37'

// A unique id for each sticker, so React and Konva can tell them apart.
function newStickerId(): string {
  return `sticker-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function App() {
  // useReducer keeps all the app's state in one object and changes it only through
  // actions, e.g. dispatch({ type: 'SELECT_NAIL', nailId: 3 }). The state sits inside an
  // undo history (see historyReducer), and `state` is its current design.
  const [history, dispatchHistory] = useReducer(historyReducer, initialHistory)
  const state = history.present
  // The Konva stage the hands are drawn on, used to export a picture of them.
  const stageRef = useRef<Konva.Stage>(null)
  const canUndo = history.past.length > 0
  // Every change is stamped with the time, so quick runs of the same change undo together.
  const dispatch = useCallback(
    (action: Action) => dispatchHistory({ type: 'DO', action, time: Date.now() }),
    [],
  )
  // The sticker picked in the Stickers tab and waiting to be placed. While one is picked,
  // tapping a nail places it instead of choosing that nail.
  const [pickedSticker, setPickedSticker] = useState<StickerType | null>(null)
  // Whether the Stickers tab is open. While it is, the hands are in "sticker mode": placed
  // stickers can be tapped to edit them, and nail taps don't choose nails.
  const [stickersTabOpen, setStickersTabOpen] = useState(false)
  // The placed sticker showing its move / resize / turn handles, if any.
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null)
  // The colour new stickers are placed in: the last colour chosen in the Stickers tab.
  const [stickerColor, setStickerColor] = useState(FIRST_STICKER_COLOR)

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
          color: stickerColor,
        },
      })
    } else if (stickersTabOpen) {
      // In sticker mode, tapping a nail (not a sticker) just puts the handles away.
      setSelectedStickerId(null)
    } else {
      dispatch({ type: 'SELECT_NAIL', nailId })
    }
  }

  // The sticker showing its handles, and the nail it's on.
  const selectedNail = state.nails.find((nail) =>
    nail.stickers.some((sticker) => sticker.id === selectedStickerId),
  )
  const selectedSticker = selectedNail?.stickers.find((sticker) => sticker.id === selectedStickerId)

  const deleteSelectedSticker = useCallback(() => {
    if (!selectedNail || !selectedSticker) return
    dispatch({ type: 'DELETE_STICKER', nailId: selectedNail.id, stickerId: selectedSticker.id })
    setSelectedStickerId(null)
  }, [dispatch, selectedNail, selectedSticker])

  const undo = useCallback(() => {
    dispatchHistory({ type: 'UNDO' })
    // The sticker showing handles might be one the undo takes away, so put the handles away.
    setSelectedStickerId(null)
  }, [])

  // Keyboard shortcuts on a computer (skipped while typing, e.g. in the hex colour box, where
  // the keys keep their usual meaning):
  // - Delete or Backspace removes the selected sticker
  // - Cmd+Z (Mac) or Ctrl+Z (Windows) undoes the last change
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement) return
      if (event.key === 'Delete' || event.key === 'Backspace') {
        deleteSelectedSticker()
      } else if (event.key.toLowerCase() === 'z' && (event.metaKey || event.ctrlKey) && !event.shiftKey) {
        event.preventDefault()
        undo()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [deleteSelectedSticker, undo])

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

  // Shown as on only if every target nail already has a tip.
  const targetsHaveTip = targetNails.length > 0 && targetNails.every((nail) => nail.hasFrenchTip)

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
          <FinishPicker
            // Highlight a finish only if every target nail already has it.
            value={
              firstTarget && targetNails.every((nail) => nail.finish === firstTarget.finish)
                ? firstTarget.finish
                : null
            }
            onChange={(finish) => dispatch({ type: 'SET_FINISH', finish })}
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
            on={targetsHaveTip}
            disabled={targetNails.length === 0}
            onChange={(on) => dispatch({ type: 'SET_FRENCH_TIP', on })}
          />
          {/* Tip colour and thickness, once the target nails have a tip. They show the first
              target nail's settings and change every target nail. */}
          {firstTarget && targetsHaveTip && (
            <>
              <TipThicknessSlider
                value={firstTarget.frenchTipThickness}
                onChange={(thickness) => dispatch({ type: 'SET_FRENCH_TIP_THICKNESS', thickness })}
              />
              <ColourPicker
                label="Tip colours"
                value={firstTarget.frenchTipColor}
                onChange={(color) => dispatch({ type: 'SET_FRENCH_TIP_COLOR', color })}
              />
            </>
          )}
        </div>
      ),
    },
    {
      id: 'stickers',
      label: 'Stickers',
      content: (
        <StickerPanel
          picked={pickedSticker}
          // With a sticker selected the colours show and change its colour; otherwise they
          // choose the colour for the next stickers placed.
          color={selectedSticker?.color ?? stickerColor}
          hasSelectedSticker={selectedSticker !== undefined}
          onPick={handlePickSticker}
          onOpenChange={handleStickersTabOpen}
          onColorChange={(color) => {
            setStickerColor(color)
            if (selectedNail && selectedSticker) {
              dispatch({
                type: 'UPDATE_STICKER',
                nailId: selectedNail.id,
                stickerId: selectedSticker.id,
                changes: { color },
              })
            }
          }}
          onDelete={deleteSelectedSticker}
        />
      ),
    },
  ]

  return (
    // The app fills exactly one screen (h-dvh): toolbar on top, hands in the space left
    // below it. min-h-0 lets that space shrink when a panel opens, and the hands shrink with it.
    // For phones: touch-manipulation stops a quick double tap (e.g. on + or Undo) from zooming
    // the whole page, and the tap-highlight setting removes the grey flash on tapped buttons.
    <div className="flex h-dvh touch-manipulation flex-col bg-blush text-stone-700 [-webkit-tap-highlight-color:transparent]">
      <Toolbar
        tabs={tabs}
        actions={
          <SaveButton
            onSave={() => {
              if (stageRef.current) exportDesign(stageRef.current)
            }}
          />
        }
      />
      <main className="flex min-h-0 flex-1 items-center justify-center p-4">
        {/* Same size as the hands area, so the undo button lines up with the zoom buttons. */}
        <div className="relative flex h-full w-full max-w-2xl justify-center">
          <Hands
            stageRef={stageRef}
            state={state}
            // In the Stickers tab, taps place or edit stickers, so the nail selection dots are hidden.
            showTargets={!stickersTabOpen}
            onSelectNail={handleNailTap}
            onTapBackground={() => setSelectedStickerId(null)}
            stickerEditing={stickerEditing}
          />
          <UndoButton
            disabled={!canUndo}
            onUndo={undo}
          />
        </div>
      </main>
    </div>
  )
}

export default App
