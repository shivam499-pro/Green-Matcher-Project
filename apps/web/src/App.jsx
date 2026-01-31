import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { I18nProvider } from './contexts/I18nContext';
import LanguageToggle from './components/common/LanguageToggle';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Recommendations from './pages/Recommendations';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import JobSeekerDashboard from './pages/JobSeekerDashboard';
import EmployerDashboard from './pages/EmployerDashboard';
import EmployerProfile from './pages/EmployerProfile';
import AdminDashboard from './pages/AdminDashboard';
import Careers from './pages/Careers';

function App() {
  return (
    <I18nProvider>
      <BrowserRouter>
        <div className="min-h-screen">
          {/* Language Toggle in Header */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
              <div className="flex items-center space-x-8">
                <h1 className="text-2xl font-bold text-primary-600">Green Matchers</h1>
                <span className="text-sm text-gray-500 hidden sm:inline">AI-Native Green Jobs Platform for India</span>
              </div>
              <LanguageToggle />
            </div>
          </header>

          <Routes>
            <Route path="/" element={<div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center max-w-2xl mx-auto px-4">
                <h1 className="text-5xl font-bold text-primary-600 mb-6">Green Matchers</h1>
                <p className="text-xl text-gray-600 mb-8">AI-Native Green Jobs Platform for India</p>
                <div className="space-y-4">
                  <a href="/jobs" className="block px-8 py-4 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition text-lg font-medium">
                    Browse Jobs
                  </a>
                  <a href="/careers" className="block px-8 py-4 bg-white text-primary-600 border-2 border-primary-500 rounded-xl hover:bg-gray-50 transition text-lg font-medium">
                    Explore Careers
                  </a>
                </div>
                <p className="text-sm text-gray-500 mt-8">
                  Powered by AI • Multi-language Support • SDG-Aligned
                </p>
              </div>
            </div>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/dashboard" element={<JobSeekerDashboard />} />
            <Route path="/employer-dashboard" element={<EmployerDashboard />} />
            <Route path="/employer-profile" element={<EmployerProfile />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/careers" element={<Careers />} />
          </Routes>
        </div>
      </BrowserRouter>
    </I18nProvider>
  )
}

export default App
