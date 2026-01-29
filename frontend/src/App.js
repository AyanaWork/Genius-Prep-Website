import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home'; 
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import TutorDashboard from './pages/tutor/TutorDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import TutorProfileForm from './pages/tutor/TutorProfileForm';
import StudentProfileForm from './pages/student/StudentProfileForm'; 
import PublicTutorProfile from './pages/tutor/PublicTutorProfile';
import BrowseTutors from './pages/BrowseTutors';
import authService from './services/auth';
import GPADashboard from './pages/GPA/GPADashboard';
import AdminPanel from './pages/Admin/AdminPanel';
import SubscriptionPage from './pages/GPA/SubscriptionPage';
import PaymentSuccess from './pages/Payment/PaymentSuccess';
import PaymentCancel from './pages/Payment/PaymentCancel';

// Protected Route Component
function ProtectedRoute({ children, allowedRole }) {
  const user = authService.getCurrentUser();
  
  if (!authService.isLoggedIn()) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={`/${user.role}/dashboard`} />;
  }
  
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/tutors" element={<BrowseTutors />} /> 
        <Route path="/tutors/:id" element={<PublicTutorProfile />} />
        
        <Route 
          path="/tutor/dashboard" 
          element={
            <ProtectedRoute allowedRole="tutor">
              <TutorDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/student/dashboard" 
          element={
            <ProtectedRoute allowedRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/tutor/profile/edit" 
          element={
            <ProtectedRoute allowedRole="tutor">
              <TutorProfileForm />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/student/profile/edit" 
          element={
            <ProtectedRoute allowedRole="student">
              <StudentProfileForm />
            </ProtectedRoute>
          } 
        />

        <Route path="*" element={<Navigate to="/" />} />

        {/* GPA Route (both students and tutors can access) */}
        <Route
          path="/gpa"
          element={
            <ProtectedRoute>
              <GPADashboard />
            </ProtectedRoute>
          }
        />
        
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/subscription" element={<SubscriptionPage />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />

      </Routes>
    </Router>
  );
}

export default App;