import { useReducer } from 'react'
import Hands from './components/Hands'
import { initialState, nailReducer } from './state/nailState'

function App() {
  // useReducer keeps all the app's state in one object and changes it only through
  // actions, e.g. dispatch({ type: 'SELECT_NAIL', nailId: 3 }).
  const [state, dispatch] = useReducer(nailReducer, initialState)

  return (
    <div className="flex min-h-screen items-center justify-center bg-rose-50 p-4">
      <Hands
        state={state}
        onSelectNail={(nailId) => dispatch({ type: 'SELECT_NAIL', nailId })}
      />
    </div>
  )
}

export default App
