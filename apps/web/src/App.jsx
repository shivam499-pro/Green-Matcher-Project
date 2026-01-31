import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-primary-600 mb-4">Green Matchers</h1>
            <p className="text-gray-600 mb-8">AI-Native Green Jobs Platform for India</p>
            <div className="space-y-4">
              <a href="/jobs" className="block px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition">
                Browse Jobs
              </a>
              <a href="/careers" className="block px-6 py-3 bg-white text-primary-600 border-2 border-primary-500 rounded-lg hover:bg-gray-50 transition">
                Explore Careers
              </a>
            </div>
            <p className="text-sm text-gray-500 mt-8">
              Powered by AI • Multi-language Support • SDG-Aligned
            </p>
          </div>
        </div>} />
        <Route path="/jobs" element={<div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Jobs</h1>
            <p className="text-gray-600">Browse green job opportunities</p>
            <a href="/" className="text-primary-600 hover:underline">← Back to Home</a>
          </div>
        </div>} />
        <Route path="/careers" element={<div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Careers</h1>
            <p className="text-gray-600">Explore green career paths</p>
            <a href="/" className="text-primary-600 hover:underline">← Back to Home</a>
          </div>
        </div>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
