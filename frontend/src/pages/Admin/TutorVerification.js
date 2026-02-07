import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function TutorVerification() {
  const navigate = useNavigate();
  const [pendingTutors, setPendingTutors] = useState([]);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionNotes, setActionNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadTutors(),
        loadStats()
      ]);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTutors = async () => {
    try {
      const endpoint = filter === 'all' 
        ? '/api/admin/tutors/all'
        : `/api/admin/tutors/all?status=${filter}`;
      
      const response = await axios.get(endpoint);
      setPendingTutors(response.data.tutors);
    } catch (error) {
      console.error('Failed to load tutors:', error);
      alert('Failed to load tutors. Please try again.');
    }
  };

  const loadStats = async () => {
    try {
      const response = await axios.get('/api/admin/tutors/verification-stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleApprove = async (tutorProfileId) => {
    if (!window.confirm('Are you sure you want to approve this tutor?')) {
      return;
    }

    try {
      setProcessing(true);
      await axios.post(`/api/admin/tutors/${tutorProfileId}/approve`, {
        notes: actionNotes
      });
      
      alert('Tutor approved successfully! They can now accept students.');
      await loadData();
      setSelectedTutor(null);
      setActionNotes('');
    } catch (error) {
      console.error('Failed to approve tutor:', error);
      alert('Failed to approve tutor. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (tutorProfileId) => {
    if (!actionNotes || actionNotes.trim() === '') {
      alert('Please provide a reason for rejection. The tutor will see this feedback.');
      return;
    }

    if (!window.confirm('Are you sure you want to reject this tutor application?')) {
      return;
    }

    try {
      setProcessing(true);
      await axios.post(`/api/admin/tutors/${tutorProfileId}/reject`, {
        reason: actionNotes
      });
      
      alert('Tutor application rejected. They will be notified with your feedback.');
      await loadData();
      setSelectedTutor(null);
      setActionNotes('');
    } catch (error) {
      console.error('Failed to reject tutor:', error);
      alert('Failed to reject tutor. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badges[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tutor verifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center text-primary-600 hover:text-primary-700 mb-4 font-medium"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Admin Dashboard
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tutor Verification</h1>
          <p className="text-gray-600">Review and approve tutor applications</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-gray-900 mb-1">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Tutors</div>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow p-6 border border-yellow-200">
            <div className="text-3xl font-bold text-yellow-800 mb-1">{stats.pending}</div>
            <div className="text-sm text-yellow-700">Pending Review</div>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-6 border border-green-200">
            <div className="text-3xl font-bold text-green-800 mb-1">{stats.approved}</div>
            <div className="text-sm text-green-700">Approved</div>
          </div>
          <div className="bg-red-50 rounded-lg shadow p-6 border border-red-200">
            <div className="text-3xl font-bold text-red-800 mb-1">{stats.rejected}</div>
            <div className="text-sm text-red-700">Rejected</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {['pending', 'approved', 'rejected', 'all'].map((filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setFilter(filterOption)}
                  className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${
                    filter === filterOption
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Tutors List */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">
              {filter === 'all' ? 'All Tutors' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Tutors`} 
              {' '}({pendingTutors.length})
            </h2>
            
            {pendingTutors.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-500">No {filter !== 'all' && filter} tutors found</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {pendingTutors.map(tutor => (
                  <div 
                    key={tutor.id}
                    onClick={() => setSelectedTutor(tutor)}
                    className={`p-4 border rounded-lg cursor-pointer transition ${
                      selectedTutor?.id === tutor.id 
                        ? 'border-primary-500 bg-primary-50 shadow-md' 
                        : 'border-gray-200 hover:border-primary-300 hover:shadow'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{tutor.display_name}</h3>
                        <p className="text-sm text-gray-600">{tutor.email}</p>
                      </div>
                      <div>
                        {getStatusBadge(tutor.verification_status)}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        {new Date(tutor.registration_date).toLocaleDateString()}
                      </span>
                      <span>R{tutor.hourly_rate || 0}/hr</span>
                      {tutor.subjects && tutor.subjects.length > 0 && (
                        <span>{tutor.subjects.length} subjects</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tutor Details & Review Panel */}
          <div className="bg-white rounded-xl shadow-md p-6">
            {selectedTutor ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Review Application</h2>
                  {getStatusBadge(selectedTutor.verification_status)}
                </div>
                
                <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
                  {/* Profile Picture */}
                  {selectedTutor.profile_picture_url && (
                    <div>
                      <label className="block font-semibold text-gray-700 mb-2">Profile Picture:</label>
                      <img 
                        src={selectedTutor.profile_picture_url} 
                        alt={selectedTutor.display_name}
                        className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                      />
                    </div>
                  )}
                  
                  {/* Basic Info */}
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Name:</label>
                    <p className="text-gray-900">{selectedTutor.display_name}</p>
                  </div>
                  
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Email:</label>
                    <p className="text-gray-900">{selectedTutor.email}</p>
                  </div>
                  
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Registration Date:</label>
                    <p className="text-gray-900">
                      {new Date(selectedTutor.registration_date).toLocaleDateString('en-ZA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  
                  {/* Bio */}
                  {selectedTutor.bio && (
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Bio:</label>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded whitespace-pre-line">
                        {selectedTutor.bio}
                      </p>
                    </div>
                  )}
                  
                  {/* Qualifications */}
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Qualifications:</label>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded whitespace-pre-line">
                      {selectedTutor.qualifications || 'Not provided'}
                    </p>
                  </div>
                  
                  {/* Subjects */}
                  <div>
                    <label className="block font-semibold text-gray-700 mb-2">Subjects:</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedTutor.subjects && selectedTutor.subjects.length > 0 ? (
                        selectedTutor.subjects.map((subject, idx) => (
                          <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            {subject}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-500">No subjects listed</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Experience and Rate */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Experience:</label>
                      <p className="text-gray-900">{selectedTutor.years_experience || 0} years</p>
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Hourly Rate:</label>
                      <p className="text-gray-900">R{selectedTutor.hourly_rate || 0}</p>
                    </div>
                  </div>
                  
                  {/* Teaching Mode & Location */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Teaching Mode:</label>
                      <p className="text-gray-900 capitalize">{selectedTutor.teaching_mode || 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="block font-semibold text-gray-700 mb-1">Location:</label>
                      <p className="text-gray-900">{selectedTutor.location || 'Not specified'}</p>
                    </div>
                  </div>
                  
                  {/* Documents - MOST IMPORTANT */}
                  <div className="border-t-2 border-gray-200 pt-6">
                    <h3 className="font-bold text-lg mb-4 text-gray-900">Verification Documents</h3>
                    
                    {/* ID Document */}
                    <div className="mb-4">
                      <label className="block font-semibold text-gray-700 mb-2">ID Document:</label>
                      {selectedTutor.id_document_url ? (
                        <a 
                          href={selectedTutor.id_document_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View ID Document
                        </a>
                      ) : (
                        <p className="text-red-600 font-medium bg-red-50 px-4 py-2 rounded">
                          ⚠️ ID document not uploaded
                        </p>
                      )}
                    </div>
                    
                    {/* Academic Transcripts */}
                    <div>
                      <label className="block font-semibold text-gray-700 mb-2">Academic Transcripts:</label>
                      {selectedTutor.transcript_url ? (
                        <a 
                          href={selectedTutor.transcript_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View Academic Transcripts
                        </a>
                      ) : (
                        <p className="text-red-600 font-medium bg-red-50 px-4 py-2 rounded">
                          ⚠️ Academic transcripts not uploaded
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Previous Admin Notes (if exists) */}
                  {selectedTutor.admin_notes && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <label className="block font-semibold text-yellow-800 mb-2">Previous Admin Notes:</label>
                      <p className="text-yellow-700">{selectedTutor.admin_notes}</p>
                    </div>
                  )}
                  
                  {/* Action Section - Only for pending tutors */}
                  {selectedTutor.verification_status === 'pending' && (
                    <>
                      <div className="border-t-2 border-gray-200 pt-6">
                        <label className="block font-semibold text-gray-700 mb-2">
                          Admin Notes / Feedback:
                        </label>
                        <textarea
                          value={actionNotes}
                          onChange={(e) => setActionNotes(e.target.value)}
                          rows={4}
                          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          placeholder="Add notes about this verification (optional for approval, required for rejection)..."
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          If rejecting, the tutor will see this feedback.
                        </p>
                      </div>
                      
                      <div className="flex gap-3 pt-4">
                        <button
                          onClick={() => handleApprove(selectedTutor.id)}
                          disabled={processing || !selectedTutor.id_document_url || !selectedTutor.transcript_url}
                          className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          {processing ? (
                            <>
                              <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Processing...
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Approve Tutor
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleReject(selectedTutor.id)}
                          disabled={processing}
                          className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          {processing ? (
                            <>
                              <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Processing...
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                              Reject Application
                            </>
                          )}
                        </button>
                      </div>
                      
                      {(!selectedTutor.id_document_url || !selectedTutor.transcript_url) && (
                        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                          <p className="text-sm text-red-700 font-medium">
                            ⚠️ Cannot approve: Missing required documents
                          </p>
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* Info for already processed tutors */}
                  {selectedTutor.verification_status !== 'pending' && (
                    <div className={`p-4 rounded-lg ${
                      selectedTutor.verification_status === 'approved' 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-red-50 border border-red-200'
                    }`}>
                      <p className={`font-medium ${
                        selectedTutor.verification_status === 'approved' 
                          ? 'text-green-800' 
                          : 'text-red-800'
                      }`}>
                        This tutor has already been {selectedTutor.verification_status}.
                      </p>
                      {selectedTutor.verified_at && (
                        <p className="text-sm mt-1 text-gray-600">
                          Processed on {new Date(selectedTutor.verified_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-20 text-gray-500">
                <svg className="w-20 h-20 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <p className="text-lg font-medium">Select a tutor to review</p>
                <p className="text-sm mt-2">Click on a tutor from the list to view their application details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TutorVerification;