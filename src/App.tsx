import { useReducer } from 'react'
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

  // The nails a change will apply to: the selected ones, or all of them if none are selected.
  const targetNails = state.nails.filter((nail) => isTargeted(state, nail.id))
  const targetLabel = state.selectedNailIds.length === 0 ? 'all nails' : 'the selected nail'
  // Highlight a shape only if every target nail already has it.
  const targetShape = targetNails.every((nail) => nail.shape === targetNails[0].shape)
    ? targetNails[0].shape
    : null

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
        <ShapePicker
          value={targetShape}
          targetLabel={targetLabel}
          onChange={(shape) => dispatch({ type: 'SET_SHAPE', shape })}
        />
      ),
    },
    {
      id: 'colour',
      label: 'Colour',
      content: (
        <ColourPicker
          value={targetNails[0].baseColor}
          targetLabel={targetLabel}
          onChange={(color) => dispatch({ type: 'SET_BASE_COLOR', color })}
        />
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
