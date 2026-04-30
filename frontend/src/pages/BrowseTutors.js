import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import profileService from '../services/profile';
import StarRating from '../components/common/StarRating';

const SUBJECT_OPTIONS = [
  '', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Afrikaans',
  'History', 'Geography', 'Accounting', 'Economics', 'Life Sciences',
  'Computer Science', 'Business Studies', 'Engineering Mathematics',
  'Statistics', 'Law', 'Psychology', 'Sociology', 'Political Science',
  'Philosophy', 'Programming', 'Data Science', 'Finance', 'Marketing'
];

const SORT_OPTIONS = [
  { value: 'elite', label: 'Recommended' },
  { value: 'rating', label: 'Highest rated' },
  { value: 'rate_asc', label: 'Price: Low to High' },
  { value: 'rate_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' }
];

function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

function BrowseTutors() {
  const navigate = useNavigate();
  const [tutors, setTutors] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput, 300);

  const [filters, setFilters] = useState({
    subject: '',
    availabilityStatus: 'active',
    sort: 'elite'
  });

  const [moduleCodes, setModuleCodes] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchBoxRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    profileService.getModuleCodes()
      .then((res) => setModuleCodes(res.moduleCodes || []))
      .catch(() => setModuleCodes([]));
  }, []);

  useEffect(() => { setPage(1); }, [filters.subject, filters.availabilityStatus, filters.sort, debouncedSearch]);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const apiFilters = { ...filters, page, limit: 24 };
        if (debouncedSearch.trim()) apiFilters.q = debouncedSearch.trim();
        const response = await profileService.getAllTutors(apiFilters);
        setTutors(response.tutors || []);
        setTotal(response.total ?? response.count ?? (response.tutors?.length || 0));
        setTotalPages(response.totalPages || 1);
      } catch (err) {
        setError('Failed to load tutors. Please try again.');
        console.error('Load tutors error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [filters, debouncedSearch, page]);

  const codeSuggestions = useMemo(() => {
    const term = searchInput.trim().toUpperCase();
    if (!term) return [];
    return moduleCodes.filter((code) => code.includes(term)).slice(0, 8);
  }, [searchInput, moduleCodes]);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <div className="pt-24 pb-8 px-6 text-center">
        <h1 className="text-4xl md:text-5xl font-black mb-4 leading-[1.15] pb-2 bg-gradient-to-r from-[#00CC99] to-emerald-400 bg-clip-text text-transparent">
          Find Your Perfect Tutor
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Search by module code (e.g. <span className="text-[#00CC99] font-semibold">FRK300</span>),
          subject, or tutor name.
        </p>
      </div>

      <div className="container mx-auto px-6 pb-16">
        <div className="glass-card rounded-2xl p-6 mb-6">
          <div className="relative mb-4" ref={searchBoxRef}>
            <label className="block text-sm font-semibold text-white/80 mb-2">Search by module code, subject, or tutor name</label>
            <div className="relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => { setSearchInput(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="e.g. FRK300, Mathematics, Sarah..."
                className="w-full pl-11 pr-10 py-3 bg-[#1e293b] border border-[#334155] rounded-xl focus:border-[#00CC99] focus:outline-none text-white placeholder-gray-500"
              />
              <svg className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
              </svg>
              {searchInput && (
                <button type="button" onClick={() => setSearchInput('')} className="absolute right-3 top-3.5 text-gray-400 hover:text-white">×</button>
              )}
            </div>
            {showSuggestions && codeSuggestions.length > 0 && (
              <div className="absolute z-20 mt-1 w-full bg-[#1e293b] border border-[#334155] rounded-xl shadow-xl overflow-hidden">
                <div className="px-4 py-2 text-xs text-gray-400 border-b border-[#334155]">Module codes</div>
                {codeSuggestions.map((code) => (
                  <button key={code} type="button" onClick={() => { setSearchInput(code); setShowSuggestions(false); }} className="w-full text-left px-4 py-2 hover:bg-[#00CC99]/10 transition text-white">
                    <span className="font-semibold text-[#00CC99]">{code}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">Subject</label>
              <select value={filters.subject} onChange={(e) => setFilters({ ...filters, subject: e.target.value })} className="w-full px-4 py-3 bg-[#1e293b] border border-[#334155] rounded-xl focus:border-[#00CC99] focus:outline-none text-white">
                {SUBJECT_OPTIONS.map((s) => <option key={s} value={s}>{s || 'All Subjects'}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">Availability</label>
              <select value={filters.availabilityStatus} onChange={(e) => setFilters({ ...filters, availabilityStatus: e.target.value })} className="w-full px-4 py-3 bg-[#1e293b] border border-[#334155] rounded-xl focus:border-[#00CC99] focus:outline-none text-white">
                <option value="">All Tutors</option>
                <option value="active">Available Now</option>
                <option value="inactive">Not Available</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">Sort</label>
              <select value={filters.sort} onChange={(e) => setFilters({ ...filters, sort: e.target.value })} className="w-full px-4 py-3 bg-[#1e293b] border border-[#334155] rounded-xl focus:border-[#00CC99] focus:outline-none text-white">
                {SORT_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-[#00CC99]/10 to-emerald-500/5 border border-[#00CC99]/20 rounded-2xl px-6 py-4">
          <div>
            <p className="font-semibold text-white">Not sure who fits your needs?</p>
            <p className="text-sm text-gray-400">Tell us what you're looking for and our team will hand-pick a shortlist.</p>
          </div>
          <button onClick={() => navigate('/request-tutor')} className="px-6 py-3 bg-[#00CC99] text-[#0f172a] rounded-xl font-bold hover:scale-105 transition whitespace-nowrap">Request a Tutor →</button>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <p className="text-gray-400">{loading ? 'Loading...' : `${total} ${total === 1 ? 'tutor' : 'tutors'} found`}</p>
        </div>

        {error && <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6">{error}</div>}

        {loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass-card rounded-2xl overflow-hidden animate-pulse">
                <div className="h-32 bg-[#1e293b]" />
                <div className="p-6 space-y-3">
                  <div className="w-24 h-24 mx-auto -mt-16 rounded-full bg-[#1e293b]" />
                  <div className="h-5 bg-[#1e293b] rounded w-3/4 mx-auto" />
                  <div className="h-4 bg-[#1e293b] rounded w-1/2 mx-auto" />
                  <div className="h-12 bg-[#1e293b] rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && tutors.length === 0 && (
          <div className="glass-card rounded-2xl p-12 text-center">
            <h3 className="text-xl font-bold mb-2">No tutors found</h3>
            <p className="text-gray-400 mb-6">Try a different module code, subject, or clear your filters.</p>
            <button onClick={() => navigate('/request-tutor')} className="px-6 py-3 bg-[#00CC99] text-[#0f172a] rounded-xl font-bold">Request a Tutor instead</button>
          </div>
        )}

        {!loading && tutors.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutors.map((tutor) => (
              <div key={tutor.id} className="glass-card rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:border-[#00CC99]/40" onClick={() => navigate(`/tutors/${tutor.id}`)}>
                <div className="h-32 bg-gradient-to-r from-[#00CC99]/20 to-emerald-500/20 relative">
                  {tutor.is_elite && <div className="absolute top-3 right-3 px-3 py-1 bg-yellow-500/80 text-yellow-900 rounded-full text-xs font-bold">★ Elite</div>}
                </div>
                <div className="relative px-6 -mt-16">
                  {tutor.profile_picture_url ? (
                    <img src={tutor.profile_picture_url} alt={tutor.display_name} className="w-24 h-24 rounded-full border-4 border-[#0f172a] object-cover mx-auto" />
                  ) : (
                    <div className="w-24 h-24 rounded-full border-4 border-[#0f172a] bg-[#00CC99]/20 flex items-center justify-center mx-auto">
                      <span className="text-[#00CC99] font-bold text-2xl">{tutor.display_name?.charAt(0).toUpperCase()}</span>
                    </div>
                  )}
                </div>
                <div className="p-6 pt-4">
                  <h3 className="text-xl font-bold text-center mb-2">{tutor.display_name}</h3>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <StarRating rating={parseFloat(tutor.average_rating || 0)} size="small" />
                    <span className="text-sm text-gray-400">({tutor.review_count || 0})</span>
                  </div>
                  {tutor.module_codes && tutor.module_codes.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3 justify-center">
                      {tutor.module_codes.slice(0, 3).map((code) => (
                        <span key={code} className="px-2 py-0.5 bg-yellow-500/10 text-yellow-300 rounded-md text-xs font-mono font-semibold border border-yellow-500/20">{code}</span>
                      ))}
                      {tutor.module_codes.length > 3 && <span className="px-2 py-0.5 text-gray-400 text-xs">+{tutor.module_codes.length - 3}</span>}
                    </div>
                  )}
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2 text-center">{tutor.bio || 'Experienced tutor ready to help you succeed'}</p>
                  <div className="flex flex-wrap gap-2 mb-4 justify-center">
                    {tutor.subjects && tutor.subjects.slice(0, 3).map((subject, i) => (
                      <span key={i} className="px-3 py-1 bg-[#00CC99]/10 text-[#00CC99] rounded-full text-xs font-medium border border-[#00CC99]/20">{subject}</span>
                    ))}
                    {tutor.subjects && tutor.subjects.length > 3 && <span className="px-3 py-1 bg-[#0f172a]/5 text-gray-400 rounded-full text-xs font-medium">+{tutor.subjects.length - 3} more</span>}
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="text-center">
                      <div className="text-sm font-semibold text-white">{tutor.years_experience || 0} years</div>
                      <div className="text-xs text-gray-400">Experience</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-semibold text-[#00CC99]">R{tutor.hourly_rate || 0}/hr</div>
                      <div className="text-xs text-gray-400">Rate</div>
                    </div>
                    <div className="text-center">
                      <span className={`inline-block w-3 h-3 rounded-full ${tutor.availability_status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <div className="text-xs text-gray-400 mt-1">{tutor.availability_status === 'active' ? 'Available' : 'Busy'}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 rounded-lg glass-card text-white disabled:opacity-30 disabled:cursor-not-allowed">← Prev</button>
            <span className="px-4 py-2 text-gray-400">Page <span className="text-white font-semibold">{page}</span> of {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-4 py-2 rounded-lg glass-card text-white disabled:opacity-30 disabled:cursor-not-allowed">Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default BrowseTutors;
