import { useReducer } from 'react'
import Hands from './components/Hands'
import SkinTonePicker from './components/SkinTonePicker'
import Toolbar, { type ToolbarTab } from './components/Toolbar'
import { initialState, nailReducer } from './state/nailState'

function App() {
  // useReducer keeps all the app's state in one object and changes it only through
  // actions, e.g. dispatch({ type: 'SELECT_NAIL', nailId: 3 }).
  const [state, dispatch] = useReducer(nailReducer, initialState)

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
