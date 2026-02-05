import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/common/Navigation';
import ProtectedRoute from './components/common/ProtectedRoute';
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
import ApplicantView from './pages/ApplicantView';

/**
 * Green Matchers - Main App Component
 * Handles routing with protected routes based on user roles
 */
function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <Navigation />
 
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/careers" element={<Careers />} />
          
          {/* Job Seeker Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute requiredRole="USER">
                <JobSeekerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute requiredRole="USER">
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/recommendations" 
            element={
              <ProtectedRoute requiredRole="USER">
                <Recommendations />
              </ProtectedRoute>
            } 
          />
          
          {/* Employer Protected Routes */}
          <Route 
            path="/employer-dashboard" 
            element={
              <ProtectedRoute requiredRole="EMPLOYER">
                <EmployerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/employer-profile" 
            element={
              <ProtectedRoute requiredRole="EMPLOYER">
                <EmployerProfile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/applicants/:jobId" 
            element={
              <ProtectedRoute requiredRole="EMPLOYER">
                <ApplicantView />
              </ProtectedRoute>
            } 
          />
          
          {/* Admin Protected Routes */}
          <Route 
            path="/admin-dashboard" 
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <Analytics />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
