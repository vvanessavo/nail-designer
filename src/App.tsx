import { useState } from 'react'
import Hands from './components/Hands'

function App() {
  // Which nail is selected (0 to 9), or null when none is.
  const [selectedNail, setSelectedNail] = useState<number | null>(null)

  return (
    <div className="flex min-h-screen items-center justify-center bg-rose-50 p-4">
      <Hands
        selectedNail={selectedNail}
        onSelectNail={setSelectedNail}
      />
    </div>
  )
}

export default App
