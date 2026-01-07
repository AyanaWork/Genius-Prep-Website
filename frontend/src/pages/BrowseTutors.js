import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import profileService from '../services/profile';
import authService from '../services/auth';
import StarRating from '../components/common/StarRating';

function BrowseTutors() {
  const navigate = useNavigate();
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    subject: '',
    moduleCode: '',  // ADD THIS
    availabilityStatus: 'active'
  });

  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    loadTutors();
  }, [filters]);

  const loadTutors = async () => {
    try {
      setLoading(true);
      const response = await profileService.getAllTutors(filters);
      setTutors(response.tutors || []);
    } catch (err) {
      setError('Failed to load tutors');
      console.error('Load tutors error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectFilter = (e) => {
    setFilters({ ...filters, subject: e.target.value });
  };

  // ADD THIS - Module code filter handler
  const handleModuleCodeFilter = (e) => {
    setFilters({ ...filters, moduleCode: e.target.value.toUpperCase() });
  };

  // ADD THIS - Clear all filters
  const clearFilters = () => {
    setFilters({
      subject: '',
      moduleCode: '',
      availabilityStatus: 'active'
    });
  };

  // ADD THIS - Get unique module codes from all tutors for suggestions
  const getAllModuleCodes = () => {
    const codes = new Set();
    tutors.forEach(tutor => {
      if (tutor.module_codes) {
        tutor.module_codes.forEach(code => codes.add(code));
      }
    });
    return Array.from(codes).sort();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => navigate('/')}
              className="text-2xl font-bold text-primary-800"
            >
              Genius Prep Tuition
            </button>
            <div className="flex items-center gap-4">
              {currentUser ? (
                <button
                  onClick={() => navigate(`/${currentUser.role}/dashboard`)}
                  className="text-gray-700 hover:text-primary-600 transition"
                >
                  Dashboard
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate('/login')}
                    className="text-gray-700 hover:text-primary-600 transition"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Header Section */}
      <div className="bg-gradient-to-br from-primary-900 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Your Perfect Tutor</h1>
          <p className="text-xl text-gray-200">
            Browse our verified tutors and find the perfect match for your learning needs
          </p>
        </div>
      </div>

      {/* Filters Section - UPDATED */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4 mb-4">
            {/* Subject Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Subject
              </label>
              <select
                value={filters.subject}
                onChange={handleSubjectFilter}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Subjects</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Physics">Physics</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Biology">Biology</option>
                <option value="English">English</option>
                <option value="Afrikaans">Afrikaans</option>
                <option value="History">History</option>
                <option value="Geography">Geography</option>
                <option value="Accounting">Accounting</option>
                <option value="Economics">Economics</option>
                <option value="Life Sciences">Life Sciences</option>
                <option value="Computer Science">Computer Science</option>
              </select>
            </div>

            {/* MODULE CODE FILTER - NEW */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Module Code
              </label>
              <input
                type="text"
                value={filters.moduleCode}
                onChange={handleModuleCodeFilter}
                placeholder="e.g., WTW114, MAT101"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 uppercase"
                maxLength={10}
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter university module code
              </p>
            </div>

            {/* Availability Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Availability
              </label>
              <select
                value={filters.availabilityStatus}
                onChange={(e) => setFilters({ ...filters, availabilityStatus: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Tutors</option>
                <option value="active">Available Now</option>
                <option value="inactive">Not Available</option>
              </select>
            </div>
          </div>

          {/* Active Filters Display & Clear Button - NEW */}
          {(filters.subject || filters.moduleCode || filters.availabilityStatus !== 'active') && (
            <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-700">Active filters:</span>
              <div className="flex flex-wrap gap-2">
                {filters.subject && (
                  <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                    Subject: {filters.subject}
                  </span>
                )}
                {filters.moduleCode && (
                  <span className="px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-sm font-mono font-semibold">
                    Module: {filters.moduleCode}
                  </span>
                )}
                {filters.availabilityStatus !== 'active' && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                    {filters.availabilityStatus === '' ? 'All statuses' : 'Not available'}
                  </span>
                )}
              </div>
              <button
                onClick={clearFilters}
                className="ml-auto text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {loading ? 'Loading...' : `${tutors.length} ${tutors.length === 1 ? 'tutor' : 'tutors'} found`}
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">Finding tutors...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Tutors Grid */}
        {!loading && tutors.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No tutors found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filters</p>
            <button
              onClick={clearFilters}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutors.map((tutor) => (
              <div
                key={tutor.id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden cursor-pointer"
                onClick={() => navigate(`/tutors/${tutor.id}`)}
              >
                {/* Card Header */}
                <div className="h-32 bg-gradient-to-br from-primary-500 to-primary-600 relative">
                  {tutor.is_elite && (
                    <div className="absolute top-3 right-3 px-3 py-1 bg-yellow-400 text-yellow-900 rounded-full text-xs font-bold">
                      ⭐ Elite
                    </div>
                  )}
                </div>

                {/* Profile Picture */}
                <div className="relative px-6 -mt-16">
                  {tutor.profile_picture_url ? (
                    <img
                      src={tutor.profile_picture_url}
                      alt={tutor.display_name}
                      className="w-24 h-24 rounded-full border-4 border-white object-cover mx-auto"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full border-4 border-white bg-primary-100 flex items-center justify-center mx-auto">
                      <span className="text-primary-600 font-bold text-2xl">
                        {tutor.display_name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-6 pt-4">
                  <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                    {tutor.display_name}
                  </h3>

                  {/* Rating */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <StarRating rating={parseFloat(tutor.average_rating || 0)} size="small" />
                    <span className="text-sm text-gray-600">
                      ({tutor.review_count || 0})
                    </span>
                  </div>

                  {/* Bio Preview */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 text-center">
                    {tutor.bio || 'Experienced tutor ready to help you succeed'}
                  </p>

                  {/* Subjects */}
                  <div className="flex flex-wrap gap-2 mb-4 justify-center">
                    {tutor.subjects && tutor.subjects.slice(0, 3).map((subject, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium"
                      >
                        {subject}
                      </span>
                    ))}
                    {tutor.subjects && tutor.subjects.length > 3 && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                        +{tutor.subjects.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* MODULE CODES - NEW DISPLAY */}
                  {tutor.module_codes && tutor.module_codes.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-600 mb-2 text-center">Module Codes:</p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {tutor.module_codes.slice(0, 3).map((code, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-secondary-50 text-secondary-700 rounded text-xs font-mono font-semibold border border-secondary-200"
                          >
                            {code}
                          </span>
                        ))}
                        {tutor.module_codes.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                            +{tutor.module_codes.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="text-center">
                      <div className="text-sm font-semibold text-gray-900">
                        {tutor.years_experience || 0} years
                      </div>
                      <div className="text-xs text-gray-500">Experience</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-semibold text-primary-600">
                        R{tutor.hourly_rate || 0}/hr
                      </div>
                      <div className="text-xs text-gray-500">Rate</div>
                    </div>
                    <div className="text-center">
                      <span className={`inline-block w-3 h-3 rounded-full ${
                        tutor.availability_status === 'active' ? 'bg-green-500' : 'bg-red-500'
                      }`}></span>
                      <div className="text-xs text-gray-500 mt-1">
                        {tutor.availability_status === 'active' ? 'Available' : 'Busy'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BrowseTutors;