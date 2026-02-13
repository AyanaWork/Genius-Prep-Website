import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pending');
  const [tutors, setTutors] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // Load pending tutors or all tutors based on tab
      let tutorsResponse;
      if (activeTab === 'pending') {
        tutorsResponse = await axios.get(`${API_URL}/admin/tutors/pending`, config);
      } else {
        tutorsResponse = await axios.get(`${API_URL}/admin/tutors`, config);
      }
      
      let tutorsData = tutorsResponse.data.tutors || [];
      
      // Filter based on active tab if needed
      if (activeTab === 'approved') {
        tutorsData = tutorsData.filter(t => t.approval_status === 'approved');
      } else if (activeTab === 'rejected') {
        tutorsData = tutorsData.filter(t => t.approval_status === 'rejected');
      }
      
      setTutors(tutorsData);

      // Load platform stats
      const statsResponse = await axios.get(`${API_URL}/admin/stats`, config);
      setStats(statsResponse.data);
    } catch (err) {
      console.error('Load data error:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const viewTutorDetails = async (tutorId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/admin/tutors/${tutorId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setSelectedTutor(response.data.tutor);
      setShowModal(true);
    } catch (err) {
      console.error('View tutor details error:', err);
      alert('Failed to load tutor details: ' + (err.response?.data?.error || err.message));
    }
  };

  const changeStatusToApproved = async (tutorId) => {
    if (!window.confirm('Change status to APPROVED?')) return;

    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/admin/tutors/${tutorId}/approve`,
        { adminNotes: 'Status changed' },
        { headers: { Authorization: `Bearer ${token}` }}
      );

      alert('Status changed to APPROVED');
      setShowModal(false);
      loadData();
    } catch (err) {
      alert('Failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const changeStatusToRejected = async (tutorId) => {
    const reason = prompt('Reason for rejection:');
    if (!reason) return;

    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${API_URL}/admin/tutors/${tutorId}/reject`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` }}
      );

      alert('Status changed to REJECTED');
      setShowModal(false);
      loadData();
    } catch (err) {
      alert('Failed: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedTutor(null);
    setRejectReason('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage tutor applications and platform</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Total Students</div>
              <div className="text-3xl font-bold text-primary-600">{stats.totalStudents || 0}</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Approved Tutors</div>
              <div className="text-3xl font-bold text-green-600">{stats.totalTutors || 0}</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Total Bookings</div>
              <div className="text-3xl font-bold text-yellow-600">{stats.totalBookings || 0}</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600 mb-1">Total Users</div>
              <div className="text-3xl font-bold text-blue-600">{stats.totalUsers || 0}</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('pending')}
              className={`flex-1 py-4 px-6 font-semibold transition ${
                activeTab === 'pending'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Pending Applications
            </button>
            <button
              onClick={() => setActiveTab('approved')}
              className={`flex-1 py-4 px-6 font-semibold transition ${
                activeTab === 'approved'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Approved Tutors
            </button>
            <button
              onClick={() => setActiveTab('rejected')}
              className={`flex-1 py-4 px-6 font-semibold transition ${
                activeTab === 'rejected'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Rejected Applications
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                <p className="text-gray-600 mt-4">Loading...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">{error}</p>
              </div>
            ) : tutors.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No tutors found in this category</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {tutors.map((tutor) => (
                  <div key={tutor.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-primary-300 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-600 font-semibold text-xl">
                            {(tutor.first_name || tutor.display_name || tutor.email)?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">
                            {tutor.display_name || 'No Name'}
                          </h3>
                          <p className="text-sm text-gray-600">{tutor.email}</p>
                          <p className="text-sm text-gray-700 mt-2">
                            <strong>Subjects:</strong> {Array.isArray(tutor.subjects) ? tutor.subjects.join(', ') : tutor.subjects || 'None'}
                          </p>
                          <p className="text-sm text-gray-700">
                            <strong>Hourly Rate:</strong> R{tutor.hourly_rate || 'N/A'}
                          </p>
                          <p className="text-sm">
                            <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                              tutor.approval_status === 'approved' ? 'bg-green-100 text-green-800' :
                              tutor.approval_status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {tutor.approval_status || 'pending'}
                            </span>
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => viewTutorDetails(tutor.id)}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tutor Details Modal */}
      {showModal && selectedTutor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8">
            <div className="flex items-start justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Tutor Application Details</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Profile Picture */}
              <div className="flex items-center gap-4">
                {selectedTutor.profile_image ? (
                  <img
                    src={selectedTutor.profile_image}
                    alt={selectedTutor.display_name}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-600 font-semibold text-3xl">
                      {(selectedTutor.display_name || selectedTutor.email)?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedTutor.display_name}
                  </h3>
                  <p className="text-gray-600">{selectedTutor.email}</p>
                  <p className="text-sm mt-1">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      selectedTutor.approval_status === 'approved' ? 'bg-green-100 text-green-800' :
                      selectedTutor.approval_status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {selectedTutor.approval_status || 'pending'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subjects</label>
                  <p className="text-gray-900">
                    {Array.isArray(selectedTutor.subjects) ? selectedTutor.subjects.join(', ') : selectedTutor.subjects || 'None'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate</label>
                  <p className="text-gray-900">R{selectedTutor.hourly_rate || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <p className="text-gray-900">{selectedTutor.location || 'Not specified'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                  <p className="text-gray-900">{selectedTutor.experience_years || '0'} years</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <p className="text-gray-900">{selectedTutor.bio || 'No bio provided'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qualifications</label>
                <p className="text-gray-900">{selectedTutor.qualifications || 'None listed'}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                <p className="text-gray-900">
                  {Array.isArray(selectedTutor.availability) ? selectedTutor.availability.join(', ') : selectedTutor.availability || 'Not specified'}
                </p>
              </div>

              {/* Documents */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-bold text-gray-900 mb-4">Verification Documents</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ID Document</label>
                    {selectedTutor.id_document_url ? (
                      <a
                        href={selectedTutor.id_document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition"
                      >
                        <span>📄</span>
                        View ID Document
                      </a>
                    ) : (
                      <p className="text-red-600 text-sm">Not uploaded</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Academic Transcripts</label>
                    {selectedTutor.transcript_url ? (
                      <a
                        href={selectedTutor.transcript_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition"
                      >
                        <span>📄</span>
                        View Academic Transcripts
                      </a>
                    ) : (
                      <p className="text-red-600 text-sm">Not uploaded</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Rejection Reason (if rejected) */}
              {selectedTutor.approval_status === 'rejected' && selectedTutor.rejection_reason && (
                <div className="border-t border-gray-200 pt-6">
                  <h4 className="font-bold text-red-600 mb-2">Rejection Reason</h4>
                  <p className="text-gray-900 bg-red-50 p-4 rounded-lg">{selectedTutor.rejection_reason}</p>
                </div>
              )}

              {/* Change Status Section */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-bold text-gray-900 mb-4">Change Status</h4>

                {selectedTutor.approval_status !== 'approved' && (
                  <button
                    onClick={() => changeStatusToApproved(selectedTutor.id)}
                    disabled={actionLoading}
                    className="w-full py-3 px-6 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-50 mb-3"
                  >
                    {actionLoading ? 'Processing...' : 'Change to APPROVED'}
                  </button>
                )}

                {selectedTutor.approval_status !== 'rejected' && (
                  <button
                    onClick={() => changeStatusToRejected(selectedTutor.id)}
                    disabled={actionLoading}
                    className="w-full py-3 px-6 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition disabled:opacity-50"
                  >
                    {actionLoading ? 'Processing...' : 'Change to REJECTED'}
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;