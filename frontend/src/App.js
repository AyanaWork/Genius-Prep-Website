import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import TutorDashboard from './pages/tutor/TutorDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import authService from './services/auth';
import TutorProfileForm from './pages/tutor/TutorProfileForm';
import StudentProfileForm from './pages/student/StudentProfileForm';

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

// Home page component
function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-white shadow-sm fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-primary">Genius Prep</span>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 text-gray-700 hover:text-primary"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-16 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
              Excel in Your Studies with
              <span className="text-primary"> Expert Tutors</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Connect with qualified tutors, access AI-powered study tools, 
              and achieve academic excellence from primary school to university level.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => navigate('/register')}
                className="px-8 py-4 bg-primary text-white rounded-lg text-lg font-semibold hover:bg-primary/90 transform hover:scale-105 transition"
              >
                Find a Tutor
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-8 py-4 bg-white text-primary border-2 border-primary rounded-lg text-lg font-semibold hover:bg-gray-50 transform hover:scale-105 transition"
              >
                Become a Tutor
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-xl text-gray-600">
              Comprehensive educational support for every learning need
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 bg-gray-50 rounded-xl hover:shadow-lg transition">
              <div className="text-5xl mb-4">📚</div>
              <h3 className="text-xl font-bold mb-3">Academic Tutoring</h3>
              <p className="text-gray-600">
                One-on-one and group sessions for all subjects from primary to university level, 
                both online and in-person.
              </p>
            </div>

            <div className="p-6 bg-gray-50 rounded-xl hover:shadow-lg transition">
              <div className="text-5xl mb-4">🏠</div>
              <h3 className="text-xl font-bold mb-3">Homeschool Support</h3>
              <p className="text-gray-600">
                Comprehensive support for NSC, IEB, and Cambridge curricula including 
                AS and A levels.
              </p>
            </div>

            <div className="p-6 bg-gray-50 rounded-xl hover:shadow-lg transition">
              <div className="text-5xl mb-4">✈️</div>
              <h3 className="text-xl font-bold mb-3">Relocation Tutoring</h3>
              <p className="text-gray-600">
                Smooth curriculum transitions from CAPS to IGCSE, IB, A-levels, 
                and AP systems.
              </p>
            </div>

            <div className="p-6 bg-gray-50 rounded-xl hover:shadow-lg transition">
              <div className="text-5xl mb-4">📝</div>
              <h3 className="text-xl font-bold mb-3">Exam Preparation</h3>
              <p className="text-gray-600">
                Specialised prep for NBT, SAT, and other standardized tests to 
                maximise your scores.
              </p>
            </div>

            <div className="p-6 bg-gray-50 rounded-xl hover:shadow-lg transition">
              <div className="text-5xl mb-4">🤖</div>
              <h3 className="text-xl font-bold mb-3">AI-Powered GPA</h3>
              <p className="text-gray-600">
                Genius Prep Accelerator generates notes, tests, and memos to 
                boost your academic performance.
              </p>
            </div>

            <div className="p-6 bg-gray-50 rounded-xl hover:shadow-lg transition">
              <div className="text-5xl mb-4">💼</div>
              <h3 className="text-xl font-bold mb-3">Upskilling Courses</h3>
              <p className="text-gray-600">
                Professional development in AI, machine learning, coding, 
                automation, and Microsoft tools.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Universities Section */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Nationwide Coverage
            </h2>
            <p className="text-xl text-gray-600">
              Supporting students at all major South African institutions
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-gray-700">
            <span className="px-4 py-2 bg-white rounded-lg shadow">UCT</span>
            <span className="px-4 py-2 bg-white rounded-lg shadow">Wits</span>
            <span className="px-4 py-2 bg-white rounded-lg shadow">UP</span>
            <span className="px-4 py-2 bg-white rounded-lg shadow">Stellenbosch</span>
            <span className="px-4 py-2 bg-white rounded-lg shadow">UWC</span>
            <span className="px-4 py-2 bg-white rounded-lg shadow">UKZN</span>
            <span className="px-4 py-2 bg-white rounded-lg shadow">UFS</span>
            <span className="px-4 py-2 bg-white rounded-lg shadow">UNISA</span>
            <span className="px-4 py-2 bg-white rounded-lg shadow">IIE</span>
            <span className="px-4 py-2 bg-white rounded-lg shadow">Milpark</span>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of students achieving academic excellence with Genius Prep
          </p>
          <button
            onClick={() => navigate('/register')}
            className="px-10 py-4 bg-white text-primary rounded-lg text-lg font-semibold hover:bg-gray-100 transform hover:scale-105 transition"
          >
            Get Started Today
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Genius Prep Tuition</h3>
              <p className="text-gray-400">
                Empowering students across South Africa with quality education 
                and personalised tutoring.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Contact</h3>
              <p className="text-gray-400">Phone: 071 961 7185</p>
              <p className="text-gray-400">Email: hello@geniuspreptuition.co.za</p>
              <p className="text-gray-400">Location: Pretoria, South Africa</p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => navigate('/register')} className="hover:text-white">Register</button></li>
                <li><button onClick={() => navigate('/login')} className="hover:text-white">Login</button></li>
                <li><a href="https://youtube.com/@geniuspreptuition" target="_blank" rel="noopener noreferrer" className="hover:text-white">YouTube</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2025 Genius Prep Tuition (PTY) LTD. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
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