import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/common/Navigation';
import Landing from './pages/Landing';
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
import Analytics from './pages/Analytics';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        {/* Navigation */}
        <Navigation />
 
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/dashboard" element={<JobSeekerDashboard />} />
          <Route path="/employer-dashboard" element={<EmployerDashboard />} />
          <Route path="/employer-profile" element={<EmployerProfile />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/careers" element={<Careers />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
