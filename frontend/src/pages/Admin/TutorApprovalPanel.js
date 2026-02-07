import React, { useState, useEffect } from 'react';
import api from '../../services/api';

function TutorApprovalPanel() {
  const [pendingTutors, setPendingTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchPendingTutors();
  }, []);

  const fetchPendingTutors = async () => {
    try {
      const response = await api.get('/admin/tutors/pending');
      setPendingTutors(response.data.tutors);
    } catch (err) {
      console.error('Failed to fetch pending tutors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (tutorId) => {
    if (!window.confirm('Approve this tutor?')) return;

    try {
      await api.put(`/admin/tutors/${tutorId}/approve`);
      alert('Tutor approved successfully!');
      fetchPendingTutors();
      setSelectedTutor(null);
    } catch (err) {
      alert('Failed to approve tutor');
    }
  };

  const handleReject = async (tutorId) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      await api.put(`/admin/tutors/${tutorId}/reject`, {
        reason: rejectionReason
      });
      alert('Tutor rejected');
      fetchPendingTutors();
      setSelectedTutor(null);
      setRejectionReason('');
    } catch (err) {
      alert('Failed to reject tutor');
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        Loading pending tutors...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">
        Tutor Approval Panel
      </h1>

      {pendingTutors.length === 0 ? (
        <div className="bg-gray-50 p-8 rounded-lg text-center">
          <p className="text-gray-600">
            No pending tutor applications
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {pendingTutors.map((tutor) => (
            <div
              key={tutor.id}
              className="bg-white border rounded-xl p-6 shadow-sm"
            >
              {/* Header Section */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold">
                    {tutor.first_name} {tutor.last_name}
                  </h3>
                  <p className="text-gray-600">{tutor.email}</p>
                  <p className="text-sm text-gray-500">
                    Applied:{' '}
                    {new Date(tutor.created_at).toLocaleDateString()}
                  </p>
                </div>

                <img
                  src={tutor.profile_picture || '/images/tutor.png'}
                  alt={tutor.first_name}
                  className="w-20 h-20 rounded-full object-cover"
                />
              </div>

              {/* Tutor Details */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700">
                    Subjects
                  </p>
                  <p className="text-sm">
                    {tutor.subjects || 'Not specified'}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700">
                    Experience
                  </p>
                  <p className="text-sm">
                    {tutor.experience || 'Not specified'}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700">
                    Qualifications
                  </p>
                  <p className="text-sm">
                    {tutor.qualifications || 'Not specified'}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700">
                    Hourly Rate
                  </p>
                  <p className="text-sm">
                    R{tutor.hourly_rate || 'Not set'}
                  </p>
                </div>
              </div>

              {/* Bio */}
              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Bio
                </p>
                <p className="text-sm text-gray-600">
                  {tutor.bio || 'No bio provided'}
                </p>
              </div>

              {/* Documents */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    ID Document
                  </p>
                  {tutor.id_document_url ? (
                    <a
                      href={tutor.id_document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View ID Document →
                    </a>
                  ) : (
                    <p className="text-sm text-red-600">
                      Not uploaded
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">
                    Academic Transcript
                  </p>
                  {tutor.transcript_url ? (
                    <a
                      href={tutor.transcript_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View Transcript →
                    </a>
                  ) : (
                    <p className="text-sm text-red-600">
                      Not uploaded
                    </p>
                  )}
                </div>
              </div>

              {/* Action Section */}
              {selectedTutor === tutor.id ? (
                <div className="space-y-3">
                  <textarea
                    value={rejectionReason}
                    onChange={(e) =>
                      setRejectionReason(e.target.value)
                    }
                    placeholder="Reason for rejection..."
                    className="w-full px-4 py-2 border rounded-lg"
                    rows={3}
                  />

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleReject(tutor.id)}
                      className="flex-1 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
                    >
                      Confirm Rejection
                    </button>

                    <button
                      onClick={() => {
                        setSelectedTutor(null);
                        setRejectionReason('');
                      }}
                      className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(tutor.id)}
                    className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold"
                  >
                    ✓ Approve Tutor
                  </button>

                  <button
                    onClick={() => setSelectedTutor(tutor.id)}
                    className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-semibold"
                  >
                    ✗ Reject Tutor
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TutorApprovalPanel;
