import { useReducer } from 'react'
import ApplyToToggle from './components/ApplyToToggle'
import ColourPicker from './components/ColourPicker'
import Hands from './components/Hands'
import ShapePicker from './components/ShapePicker'
import SkinTonePicker from './components/SkinTonePicker'
import Toolbar, { type ToolbarTab } from './components/Toolbar'
import { initialState, isTargeted, nailReducer } from './state/nailState'

function App() {
  // useReducer keeps all the app's state in one object and changes it only through
  // actions, e.g. dispatch({ type: 'SELECT_NAIL', nailId: 3 }).
  const [state, dispatch] = useReducer(nailReducer, initialState)

  // The nails a change will apply to: all of them, or only the selected ones.
  const targetNails = state.nails.filter((nail) => isTargeted(state, nail.id))
  const firstTarget = targetNails.at(0)
  // Highlight a shape only if every target nail already has it.
  const targetShape =
    firstTarget && targetNails.every((nail) => nail.shape === firstTarget.shape)
      ? firstTarget.shape
      : null

  // The "Each nail / All nails" switch, shown at the top of the Shape and Colour tabs.
  const applyToToggle = (
    <ApplyToToggle
      applyToAll={state.applyToAll}
      hasSelection={state.selectedNailIds.length > 0}
      onChange={(applyToAll) => dispatch({ type: 'SET_APPLY_TO_ALL', applyToAll })}
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
  ]

  return (
    <div className="flex min-h-screen flex-col bg-rose-50">
      <Toolbar tabs={tabs} />
      <main className="flex flex-1 items-center justify-center p-4">
        <Hands
          state={state}
          onSelectNail={(nailId) => dispatch({ type: 'SELECT_NAIL', nailId })}
        />
      </main>
    </div>
  )
}

export default App
