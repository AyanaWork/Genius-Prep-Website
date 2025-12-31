import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home'; 
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import TutorDashboard from './pages/tutor/TutorDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import TutorProfileForm from './pages/tutor/TutorProfileForm';
import StudentProfileForm from './pages/student/StudentProfileForm';
import authService from './services/auth';

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
      </Routes>
    </Router>
  );
}

export default App;