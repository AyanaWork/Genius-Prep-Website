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
import RequestTutor from './pages/RequestTutor';
import MyTutorRequests from './pages/MyTutorRequests';
import Documents from './pages/Documents';
import authService from './services/auth';
import GPADashboard from './pages/GPA/GPADashboard';
import TutorApprovalPanel from './pages/Admin/TutorApprovalPanel';
import AdminDashboard from './pages/Admin/AdminDashboard';
import UserManagement from './pages/Admin/UserManagement';
import SubscriptionPage from './pages/GPA/SubscriptionPage';
import PaymentSuccess from './pages/Payment/PaymentSuccess';
import PaymentCancel from './pages/Payment/PaymentCancel';
import TermsAndConditions from './pages/Legal/TermsAndConditions';
import PrivacyPolicy from './pages/Legal/PrivacyPolicy';
import RefundPolicy from './pages/Legal/RefundPolicy';
import PricingAndLegal from './pages/Legal/PricingAndLegal';
import AdminBookings from './pages/Admin/AdminBookings';
import Layout from './components/layouts/Layout';

function ProtectedRoute({ children, allowedRole }) {
  const user = authService.getCurrentUser();
  if (!authService.isLoggedIn()) return <Navigate to="/login" />;
  if (allowedRole && user.role !== allowedRole) return <Navigate to={`/${user.role}/dashboard`} />;
  return children;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<Layout />}>
          <Route path="/tutors" element={<BrowseTutors />} />
          <Route path="/tutors/:id" element={<PublicTutorProfile />} />
          <Route path="/request-tutor" element={<RequestTutor />} />
          <Route path="/my-requests" element={
            <ProtectedRoute>
              <MyTutorRequests />
            </ProtectedRoute>
          } />
          <Route path="/documents" element={
            <ProtectedRoute>
              <Documents />
            </ProtectedRoute>
          } />

          <Route path="/student/dashboard" element={
            <ProtectedRoute allowedRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="/student/profile/edit" element={
            <ProtectedRoute allowedRole="student">
              <StudentProfileForm />
            </ProtectedRoute>
          } />

          <Route path="/tutor/dashboard" element={
            <ProtectedRoute allowedRole="tutor">
              <TutorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/tutor/profile/edit" element={
            <ProtectedRoute allowedRole="tutor">
              <TutorProfileForm />
            </ProtectedRoute>
          } />

          <Route path="/gpa" element={
            <ProtectedRoute>
              <GPADashboard />
            </ProtectedRoute>
          } />

          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRole="admin">
              <UserManagement />
            </ProtectedRoute>
          } />
          <Route path="/admin/bookings" element={
            <ProtectedRoute allowedRole="admin">
              <AdminBookings />
            </ProtectedRoute>
          } />
          <Route path="/admin/tutors" element={<TutorApprovalPanel />} />
        </Route>

        <Route path="/subscription" element={<SubscriptionPage />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/cancel" element={<PaymentCancel />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/refund-policy" element={<RefundPolicy />} />
        <Route path="/pricing-legal" element={<PricingAndLegal />} />

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
