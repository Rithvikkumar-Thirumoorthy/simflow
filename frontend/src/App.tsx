import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          SimplrFlow
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Computer Vision Annotation Platform
        </p>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-700 mb-4">Development Mode</p>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => setCount((count) => count + 1)}
          >
            count is {count}
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
