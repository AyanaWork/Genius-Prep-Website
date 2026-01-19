import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/auth';
import api from '../../services/api';

function AdminPanel() {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTutors: 0,
    totalStudents: 0,
    totalBookings: 0,
    totalReviews: 0,
    activeSubscriptions: 0
  });
  
  const [users, setUsers] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, users, tutors, subscriptions

  // Redirect if not admin
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') {
      navigate('/');
      return;
    }
    loadAdminData();
  }, [currentUser, navigate]);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      
      // Load statistics
      const statsResponse = await api.get('/admin/stats');
      setStats(statsResponse.data);
      
      // Load users list
      const usersResponse = await api.get('/admin/users');
      setUsers(usersResponse.data.users || []);
      
      // Load tutors
      const tutorsResponse = await api.get('/admin/tutors');
      setTutors(tutorsResponse.data.tutors || []);
      
      // Load subscriptions
      const subsResponse = await api.get('/admin/subscriptions');
      setSubscriptions(subsResponse.data.subscriptions || []);
      
    } catch (err) {
      console.error('Load admin data error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleElite = async (tutorId, currentStatus) => {
    try {
      await api.patch(`/admin/tutors/${tutorId}/elite`, { isElite: !currentStatus });
      await loadAdminData();
      alert(`Tutor ${!currentStatus ? 'marked as' : 'removed from'} elite status`);
    } catch (err) {
      alert('Failed to update elite status');
    }
  };

  const handleActivateSubscription = async (userId, subscriptionType) => {
    if (!window.confirm(`Activate ${subscriptionType} subscription for this user?`)) {
      return;
    }

    try {
      await api.post('/admin/subscriptions/activate', {
        userId,
        subscriptionType,
        paymentReference: 'ADMIN_ACTIVATION'
      });
      await loadAdminData();
      alert('Subscription activated successfully!');
    } catch (err) {
      alert('Failed to activate subscription');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-primary-800">🛠️ Admin Panel - Genius Prep</h1>
            <button
              onClick={() => navigate('/')}
              className="text-gray-700 hover:text-primary-600 transition"
            >
              Back to Site
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 border-b border-gray-200">
          {['overview', 'users', 'tutors', 'subscriptions'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-medium transition ${
                activeTab === tab
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-gray-900">Platform Statistics</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="text-4xl mb-2">👥</div>
                <div className="text-3xl font-bold text-primary-600">{stats.totalUsers}</div>
                <div className="text-gray-600">Total Users</div>
                <div className="mt-2 text-sm text-gray-500">
                  {stats.totalTutors} Tutors • {stats.totalStudents} Students
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="text-4xl mb-2">📚</div>
                <div className="text-3xl font-bold text-secondary-600">{stats.totalBookings}</div>
                <div className="text-gray-600">Total Bookings</div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="text-4xl mb-2">⭐</div>
                <div className="text-3xl font-bold text-yellow-600">{stats.totalReviews}</div>
                <div className="text-gray-600">Total Reviews</div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="text-4xl mb-2">🤖</div>
                <div className="text-3xl font-bold text-purple-600">{stats.activeSubscriptions}</div>
                <div className="text-gray-600">Active GPA Subscriptions</div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="text-4xl mb-2">💰</div>
                <div className="text-3xl font-bold text-green-600">
                  R{(stats.activeSubscriptions * 575).toLocaleString()}
                </div>
                <div className="text-gray-600">Est. Monthly Revenue</div>
                <div className="mt-2 text-xs text-gray-500">Average subscription value</div>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">All Users ({users.length})</h2>
            
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'tutor' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tutors Tab */}
        {activeTab === 'tutors' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">All Tutors ({tutors.length})</h2>
            
            <div className="grid gap-4">
              {tutors.map((tutor) => (
                <div key={tutor.id} className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      {tutor.profile_picture_url ? (
                        <img
                          src={tutor.profile_picture_url}
                          alt={tutor.display_name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-600 font-bold text-xl">
                            {tutor.display_name?.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-gray-900">{tutor.display_name}</h3>
                          {tutor.is_elite && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">
                              ⭐ Elite
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{tutor.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-600">
                            ⭐ {tutor.average_rating || '0.0'} ({tutor.review_count || 0} reviews)
                          </span>
                          <span className="text-sm text-gray-600">
                            • R{tutor.hourly_rate}/hr
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleToggleElite(tutor.id, tutor.is_elite)}
                      className={`px-4 py-2 rounded-lg font-semibold transition ${
                        tutor.is_elite
                          ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tutor.is_elite ? 'Remove Elite' : 'Make Elite'}
                    </button>
                  </div>

                  {tutor.subjects && tutor.subjects.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {tutor.subjects.map((subject, idx) => (
                        <span key={idx} className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs">
                          {subject}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Subscriptions Tab */}
        {activeTab === 'subscriptions' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">GPA Subscriptions ({subscriptions.length})</h2>
              <button
                onClick={() => {
                  const userId = prompt('Enter User ID to activate subscription:');
                  const type = prompt('Enter type (annual/semester):');
                  if (userId && type) {
                    handleActivateSubscription(parseInt(userId), type);
                  }
                }}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
              >
                + Activate Subscription
              </button>
            </div>
            
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">End Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {subscriptions.map((sub) => (
                    <tr key={sub.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sub.user_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          sub.subscription_type === 'annual' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {sub.subscription_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">R{sub.amount}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          sub.is_active && new Date(sub.end_date) > new Date()
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {sub.is_active && new Date(sub.end_date) > new Date() ? 'Active' : 'Expired'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(sub.start_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(sub.end_date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;