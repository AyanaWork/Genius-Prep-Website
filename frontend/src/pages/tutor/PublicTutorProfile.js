import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import profileService from '../../services/profile';
import reviewService from '../../services/review';
import bookingService from '../../services/booking';
import authService from '../../services/auth';
import StarRating from '../../components/common/StarRating';
import ReviewForm from '../../components/reviews/ReviewForm';
import ReviewsList from '../../components/reviews/ReviewsList';
import BookingForm from '../../components/bookings/BookingForm';

function PublicTutorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const isStudent = currentUser?.role === 'student';

  const [tutor, setTutor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ totalReviews: 0, averageRating: 0 });
  const [reviewsLoading, setReviewsLoading] = useState(false);


  useEffect(() => {
    loadTutorProfile();
    if (isStudent) {
      checkCanReview();
    }
  }, [id, isStudent]);

  const loadTutorProfile = async () => {
    try {
      setLoading(true);
      const response = await profileService.getTutorById(id);
      setTutor(response.tutor);
    } catch (err) {
      setError('Failed to load tutor profile');
      console.error('Load tutor error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadReviews = async () => {
      try {
        setReviewsLoading(true);
        const response = await reviewService.getTutorReviews(id);
        setReviews(response.reviews || []);
        setReviewStats(response.stats || { totalReviews: 0, averageRating: 0 });
      } catch (err) {
        console.error('Load reviews error:', err);
        // Don't show error - just set empty arrays
        setReviews([]);
        setReviewStats({ totalReviews: 0, averageRating: 0 });
      } finally {
        setReviewsLoading(false);
      }
    };

    if (id) {
      loadReviews();
    }
  }, [id]);

  const checkCanReview = async () => {
    try {
      const response = await reviewService.canReview(id);
      setCanReview(response.canReview);
      if (response.existingReview) {
        setEditingReview(response.existingReview);
      }
    } catch (err) {
      console.error('Check can review error:', err);
    }
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      if (editingReview) {
        await reviewService.updateReview(editingReview.id, reviewData);
      } else {
        await reviewService.createReview(reviewData);
      }
      setShowReviewForm(false);
      setEditingReview(null);
      await loadTutorProfile();
      await checkCanReview();
    } catch (err) {
      throw err;
    }
  };

  const handleRequestTutor = () => {
    if (!currentUser) {
      // Not logged in - redirect to login/register
      if (window.confirm('You need to be logged in to request a tutor. Would you like to register or login?')) {
        navigate('/register');
      }
      return;
    }

    if (currentUser.role !== 'student') {
      alert('Only students can request tutoring sessions. Please switch to a student account.');
      return;
    }

    // Show booking form
    setShowBookingForm(true);
  };

  const handleBookingSubmit = async (bookingData) => {
    try {
      await bookingService.createBooking(bookingData);
      setShowBookingForm(false);
      alert('Booking request sent successfully! The tutor will review your request.');
      // Optionally navigate to bookings page
      navigate('/student/dashboard');
    } catch (err) {
      throw err;
    }
  };

  if (loading) {
      return (
        <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
          <div className="text-center"><div className="inline-block w-12 h-12 border-4 border-[#00CC99] border-t-transparent rounded-full animate-spin"></div><p className="mt-4 text-gray-400">Loading tutor profile...</p></div>
        </div>
      );
    }

  if (error || !tutor) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="text-center"><div className="text-6xl mb-4">😕</div><h2 className="text-2xl font-bold mb-2">Tutor Not Found</h2><button onClick={() => navigate('/')} className="px-6 py-3 bg-[#00CC99] text-[#0f172a] rounded-xl font-bold">Back to Home</button></div>
      </div>
    );
  }

    return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f172a]/80 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-6 py-3 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="text-2xl font-bold text-[#00CC99] tracking-tight">GENIUS ACCELERATOR</button>
          <div className="flex items-center gap-6">
            {currentUser ? (
              <button onClick={() => navigate(`/${currentUser.role}/dashboard`)} className="text-sm text-white/70 hover:text-[#00CC99] transition">Dashboard</button>
            ) : (
              <>
                <button onClick={() => navigate('/login')} className="text-sm text-white/70 hover:text-[#00CC99] transition">Sign In</button>
                <button onClick={() => navigate('/register')} className="px-6 py-2 bg-[#00CC99] text-[#0f172a] rounded-full font-bold text-sm">Get Started</button>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="pt-24 pb-16 px-6 container mx-auto">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left sidebar */}
          <div className="lg:col-span-1">
            <div className="glass-card rounded-3xl p-6 sticky top-24">
              <div className="text-center mb-6">
                {tutor.profile_picture_url ? (
                  <img src={tutor.profile_picture_url} alt={tutor.display_name} className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-[#00CC99]" />
                ) : (
                  <div className="w-32 h-32 rounded-full mx-auto bg-[#00CC99]/20 flex items-center justify-center border-2 border-[#00CC99]">
                    <span className="text-4xl font-bold text-[#00CC99]">{tutor.display_name?.charAt(0).toUpperCase()}</span>
                  </div>
                )}
                {tutor.is_elite && (
                  <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">⭐ Elite Tutor</div>
                )}
              </div>
              <h1 className="text-2xl font-bold text-center mb-2">{tutor.display_name}</h1>
              <div className="flex justify-center gap-2 mb-6">
                <StarRating rating={parseFloat(tutor.average_rating || 0)} size="medium" />
                <span className="text-sm text-gray-400">({tutor.review_count || 0} reviews)</span>
              </div>
              <div className="text-center mb-6">
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm ${tutor.availability_status === 'active' ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-red-500/20 text-red-400 border border-red-500/50'}`}>
                  {tutor.availability_status === 'active' ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-[#0f172a]/5 rounded-xl p-3 text-center"><div className="text-2xl font-bold text-[#00CC99]">{tutor.years_experience || 0}</div><div className="text-xs text-gray-400">Years Exp.</div></div>
                <div className="bg-[#0f172a]/5 rounded-xl p-3 text-center"><div className="text-2xl font-bold text-[#00CC99]">R{tutor.hourly_rate || 0}</div><div className="text-xs text-gray-400">Per Hour</div></div>
              </div>
              {showBookingForm ? (
                <BookingForm tutorId={tutor.id} tutorName={`${tutor.first_name} ${tutor.last_name}`} hourlyRate={tutor.hourly_rate} onSubmit={handleBookingSubmit} onCancel={() => setShowBookingForm(false)} />
              ) : (
                <>
                  <button onClick={handleRequestTutor} disabled={tutor.availability_status !== 'active'} className="w-full py-3 bg-[#00CC99] text-[#0f172a] rounded-xl font-bold hover:scale-105 transition disabled:opacity-50">Request Tutor</button>
                  {tutor.availability_status !== 'active' && <p className="text-sm text-gray-400 text-center mt-2">Currently unavailable</p>}
                </>
              )}
              {isStudent && canReview && !showReviewForm && (
                <button onClick={() => setShowReviewForm(true)} className="w-full mt-4 py-3 glass-card rounded-xl font-semibold hover:border-[#00CC99]/50 transition">{editingReview ? 'Edit Your Review' : 'Write a Review'}</button>
              )}
            </div>
          </div>

          {/* Right content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-card rounded-3xl p-8"><h2 className="text-2xl font-bold mb-4">About</h2><p className="text-gray-300 whitespace-pre-line">{tutor.bio || 'No bio available.'}</p></div>
            {tutor.qualifications && <div className="glass-card rounded-3xl p-8"><h2 className="text-2xl font-bold mb-4">Qualifications</h2><p className="text-gray-300">{tutor.qualifications}</p></div>}
            <div className="glass-card rounded-3xl p-8"><h2 className="text-2xl font-bold mb-4">Subjects</h2><div className="flex flex-wrap gap-2">{tutor.subjects?.map((s, i) => <span key={i} className="px-4 py-2 bg-[#00CC99]/10 rounded-lg text-sm border border-[#00CC99]/30">{s}</span>)}</div></div>
            {tutor.module_codes?.length > 0 && <div className="glass-card rounded-3xl p-8"><h2 className="text-2xl font-bold mb-4">University Modules</h2><div className="flex flex-wrap gap-2">{tutor.module_codes.map((c, i) => <span key={i} className="px-3 py-1 bg-blue-500/20 rounded-md font-mono text-sm">{c}</span>)}</div></div>}
            {(tutor.teaching_mode || tutor.location) && <div className="glass-card rounded-3xl p-8"><h2 className="text-2xl font-bold mb-4">Teaching Details</h2><div className="space-y-3">{tutor.teaching_mode && <div><span className="text-2xl mr-2">💻</span> {tutor.teaching_mode}</div>}{tutor.location && <div><span className="text-2xl mr-2">📍</span> {tutor.location}</div>}</div></div>}

            {showReviewForm && (
              <div className="glass-card rounded-3xl p-8">
                <h2 className="text-2xl font-bold mb-6">{editingReview ? 'Edit Your Review' : 'Write a Review'}</h2>
                <ReviewForm tutorId={tutor.id} initialData={editingReview} onSubmit={handleReviewSubmit} onCancel={() => { setShowReviewForm(false); setEditingReview(null); }} />
              </div>
            )}

            <div className="glass-card rounded-3xl p-8">
              <h2 className="text-2xl font-bold mb-6">Student Reviews</h2>
              {reviewsLoading ? <div className="text-center py-8"><div className="inline-block w-8 h-8 border-4 border-[#00CC99] border-t-transparent rounded-full animate-spin"></div></div> : reviews.length === 0 ? <div className="text-center py-8 text-gray-400">No reviews yet. Be the first!</div> : <ReviewsList reviews={reviews} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PublicTutorProfile;