import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import tutorRequestService from '../services/tutorRequest';
import companyLogo from '../assets/logos/GA_1.jpeg';

const SUBJECT_OPTIONS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Afrikaans',
  'History', 'Geography', 'Accounting', 'Economics', 'Life Sciences',
  'Computer Science', 'Business Studies', 'Statistics', 'Law', 'Psychology',
  'Programming', 'Finance'
];

const EDUCATION_LEVELS = [
  '', 'Primary School', 'Grade 8-9', 'Grade 10-12',
  'University - 1st Year', 'University - 2nd Year', 'University - 3rd Year',
  'University - 4th Year', 'Postgraduate', 'Adult / Upskilling'
];

const REQUESTER_TYPES = [
  { value: 'student', label: 'Student', icon: '🎓' },
  { value: 'parent', label: 'Parent', icon: '👪' },
  { value: 'bursary', label: 'Bursary / Organisation', icon: '🏢' }
];

const FORMATS = [
  { value: 'online', label: 'Online' },
  { value: 'in-person', label: 'In-person' },
  { value: 'hybrid', label: 'Hybrid' }
];

function RequestTutor() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [data, setData] = useState({
    requesterType: 'student',
    fullName: '',
    email: '',
    phoneNumber: '',
    organisation: '',
    educationLevel: '',
    institution: '',
    subjects: [],
    moduleCodesRaw: '',
    budgetPerHour: '',
    preferredFormat: 'online',
    location: '',
    numberOfStudents: 1,
    notes: ''
  });

  const update = (key, value) => setData((d) => ({ ...d, [key]: value }));
  const toggleSubject = (s) => setData((d) => ({
    ...d,
    subjects: d.subjects.includes(s) ? d.subjects.filter((x) => x !== s) : [...d.subjects, s]
  }));

  const validateStep = (s) => {
    if (s === 1) {
      if (!REQUESTER_TYPES.some((r) => r.value === data.requesterType)) return 'Pick who you are';
      if (data.fullName.trim().length < 2) return 'Please enter your full name';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return 'Enter a valid email';
      if (!/^[+0-9 ()\-]{6,20}$/.test(data.phoneNumber)) return 'Enter a valid phone number';
      if (data.requesterType === 'bursary' && !data.organisation.trim()) {
        return 'Please tell us your organisation name';
      }
    }
    if (s === 2) {
      if (data.subjects.length === 0 && !data.moduleCodesRaw.trim()) {
        return 'Add at least one subject or module code so we can match you';
      }
    }
    return null;
  };

  const next = () => {
    const err = validateStep(step);
    if (err) return setError(err);
    setError('');
    setStep((s) => s + 1);
  };
  const back = () => { setError(''); setStep((s) => s - 1); };

  const submit = async () => {
    const err = validateStep(1) || validateStep(2);
    if (err) return setError(err);
    setSubmitting(true);
    setError('');
    try {
      const moduleCodes = data.moduleCodesRaw.split(',').map((c) => c.trim()).filter(Boolean);
      await tutorRequestService.create({
        requesterType: data.requesterType,
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        organisation: data.organisation || undefined,
        educationLevel: data.educationLevel || undefined,
        institution: data.institution || undefined,
        subjects: data.subjects,
        moduleCodes,
        budgetPerHour: data.budgetPerHour ? Number(data.budgetPerHour) : undefined,
        preferredFormat: data.preferredFormat || undefined,
        location: data.location || undefined,
        numberOfStudents: Number(data.numberOfStudents) || 1,
        notes: data.notes || undefined
      });
      setSubmitted(true);
    } catch (err2) {
      setError(err2.response?.data?.error || 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center px-4 pt-24 pb-12">
        <div className="max-w-md w-full glass-card rounded-3xl p-10 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-center leading-[1.15] pb-2 bg-gradient-to-r from-[#00CC99] to-emerald-400 bg-clip-text text-transparent">Request received!</h1>
          <p className="text-gray-400 mb-6">
            Our team will review your request and reach out to{' '}
            <span className="text-[#00CC99]">{data.email}</span> with a shortlist of tutors.
          </p>
          <div className="flex flex-col gap-3">
            <button onClick={() => navigate('/tutors')} className="w-full py-3 bg-[#00CC99] text-[#0f172a] rounded-xl font-bold hover:scale-105 transition">Browse tutors while you wait</button>
            <button onClick={() => navigate('/')} className="w-full py-3 glass-card rounded-xl text-white">Back to home</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-24 pb-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          {/* <div className="flex items-center justify-center gap-3 mb-4">
            <img src={companyLogo} alt="Logo" className="h-12 w-auto object-contain" />
            <div className="flex flex-col leading-none text-left">
              <span className="text-[#00CC99] font-black text-xl tracking-tighter">GENIUS</span>
              <span className="text-white/90 font-light text-xs tracking-[0.2em]">ACCELERATOR</span>
            </div>
          </div> */}
          <h1 className="text-3xl md:text-4xl font-black mb-2 text-center leading-[1.15] pb-2 bg-gradient-to-r from-[#00CC99] to-emerald-400 bg-clip-text text-transparent">Request a Tutor</h1>
          <p className="text-gray-400">Fill in a few details and our team will hand-pick a shortlist for you.</p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className={`h-2 w-12 rounded-full transition ${n <= step ? 'bg-[#00CC99]' : 'bg-white/10'}`} />
          ))}
        </div>

        <div className="glass-card rounded-3xl p-8">
          {error && <div className="mb-4 bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-xl">{error}</div>}

          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-bold mb-2">Who are you?</h2>
              <div>
                <label className="block text-sm font-semibold mb-3">I am a:</label>
                <div className="grid grid-cols-3 gap-3">
                  {REQUESTER_TYPES.map((t) => (
                    <button key={t.value} type="button" onClick={() => update('requesterType', t.value)} className={`py-4 rounded-xl text-center transition ${data.requesterType === t.value ? 'bg-[#00CC99] text-[#0f172a] font-bold' : 'bg-[#0f172a]/40 hover:bg-[#0f172a]/60 text-white'}`}>
                      <div className="text-2xl mb-1">{t.icon}</div>
                      <div className="text-sm">{t.label}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Full name *</label>
                  <input type="text" value={data.fullName} onChange={(e) => update('fullName', e.target.value)} className="w-full px-4 py-3 bg-[#0f172a]/40 border border-white/10 rounded-xl focus:border-[#00CC99] focus:outline-none text-white" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Email *</label>
                  <input type="email" value={data.email} onChange={(e) => update('email', e.target.value)} className="w-full px-4 py-3 bg-[#0f172a]/40 border border-white/10 rounded-xl focus:border-[#00CC99] focus:outline-none text-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Phone number *</label>
                <input type="tel" value={data.phoneNumber} onChange={(e) => update('phoneNumber', e.target.value)} className="w-full px-4 py-3 bg-[#0f172a]/40 border border-white/10 rounded-xl focus:border-[#00CC99] focus:outline-none text-white" placeholder="+27 82 123 4567" />
              </div>
              {data.requesterType === 'bursary' && (
                <div>
                  <label className="block text-sm font-semibold mb-2">Organisation name *</label>
                  <input type="text" value={data.organisation} onChange={(e) => update('organisation', e.target.value)} className="w-full px-4 py-3 bg-[#0f172a]/40 border border-white/10 rounded-xl focus:border-[#00CC99] focus:outline-none text-white" placeholder="e.g. Acme Bursary Trust" />
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-bold mb-2">What do you need help with?</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Education level</label>
                  <select value={data.educationLevel} onChange={(e) => update('educationLevel', e.target.value)} className="w-full px-4 py-3 bg-[#0f172a]/40 border border-white/10 rounded-xl focus:border-[#00CC99] focus:outline-none text-white">
                    {EDUCATION_LEVELS.map((l) => <option key={l} value={l}>{l || 'Select…'}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Institution</label>
                  <input type="text" value={data.institution} onChange={(e) => update('institution', e.target.value)} className="w-full px-4 py-3 bg-[#0f172a]/40 border border-white/10 rounded-xl focus:border-[#00CC99] focus:outline-none text-white" placeholder="e.g. University of Pretoria" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Module codes</label>
                <input type="text" value={data.moduleCodesRaw} onChange={(e) => update('moduleCodesRaw', e.target.value)} className="w-full px-4 py-3 bg-[#0f172a]/40 border border-white/10 rounded-xl focus:border-[#00CC99] focus:outline-none text-white" placeholder="FRK300, MAT101, STK220" />
                <p className="text-xs text-gray-500 mt-1">Comma-separated. Helps us match precisely.</p>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-3">Subjects</label>
                {data.subjects.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {data.subjects.map((s) => (
                      <span key={s} className="px-3 py-1 bg-[#00CC99]/20 rounded-full text-sm flex items-center gap-2">
                        {s}<button type="button" onClick={() => toggleSubject(s)} className="text-[#00CC99]">×</button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {SUBJECT_OPTIONS.map((s) => (
                    <button key={s} type="button" onClick={() => toggleSubject(s)} className={`px-3 py-2 rounded-lg text-sm transition ${data.subjects.includes(s) ? 'bg-[#00CC99] text-[#0f172a] font-semibold' : 'bg-[#0f172a]/40 text-white hover:bg-[#00CC99]/20'}`}>{s}</button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-bold mb-2">Logistics</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Budget (R / hour)</label>
                  <input type="number" min="0" value={data.budgetPerHour} onChange={(e) => update('budgetPerHour', e.target.value)} className="w-full px-4 py-3 bg-[#0f172a]/40 border border-white/10 rounded-xl focus:border-[#00CC99] focus:outline-none text-white" placeholder="e.g. 250" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Number of students</label>
                  <input type="number" min="1" value={data.numberOfStudents} onChange={(e) => update('numberOfStudents', e.target.value)} className="w-full px-4 py-3 bg-[#0f172a]/40 border border-white/10 rounded-xl focus:border-[#00CC99] focus:outline-none text-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-3">Preferred format</label>
                <div className="flex gap-3">
                  {FORMATS.map((f) => (
                    <button key={f.value} type="button" onClick={() => update('preferredFormat', f.value)} className={`flex-1 py-3 rounded-xl transition ${data.preferredFormat === f.value ? 'bg-[#00CC99] text-[#0f172a] font-bold' : 'bg-[#0f172a]/40 text-white hover:bg-[#00CC99]/20'}`}>{f.label}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Location (if in-person/hybrid)</label>
                <input type="text" value={data.location} onChange={(e) => update('location', e.target.value)} className="w-full px-4 py-3 bg-[#0f172a]/40 border border-white/10 rounded-xl focus:border-[#00CC99] focus:outline-none text-white" placeholder="e.g. Pretoria" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Anything else?</label>
                <textarea rows="4" maxLength="2000" value={data.notes} onChange={(e) => update('notes', e.target.value)} className="w-full px-4 py-3 bg-[#0f172a]/40 border border-white/10 rounded-xl focus:border-[#00CC99] focus:outline-none text-white" placeholder="Schedule preferences, learning goals, exam dates..." />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold mb-2">Review your request</h2>
              <ReviewRow label="Requester" value={data.requesterType} />
              <ReviewRow label="Name" value={data.fullName} />
              <ReviewRow label="Email" value={data.email} />
              <ReviewRow label="Phone" value={data.phoneNumber} />
              {data.organisation && <ReviewRow label="Organisation" value={data.organisation} />}
              {data.educationLevel && <ReviewRow label="Level" value={data.educationLevel} />}
              {data.institution && <ReviewRow label="Institution" value={data.institution} />}
              {data.subjects.length > 0 && <ReviewRow label="Subjects" value={data.subjects.join(', ')} />}
              {data.moduleCodesRaw.trim() && <ReviewRow label="Module codes" value={data.moduleCodesRaw} />}
              {data.budgetPerHour && <ReviewRow label="Budget" value={`R${data.budgetPerHour}/hr`} />}
              {data.preferredFormat && <ReviewRow label="Format" value={data.preferredFormat} />}
              {data.location && <ReviewRow label="Location" value={data.location} />}
              <ReviewRow label="Number of students" value={String(data.numberOfStudents)} />
              {data.notes && <ReviewRow label="Notes" value={data.notes} />}
              <p className="text-xs text-gray-500 mt-4">By submitting you agree that the Genius Prep admin team can contact you on the email and phone number above. Your contact details are never published.</p>
            </div>
          )}

          <div className="flex gap-3 mt-8">
            {step > 1 && <button type="button" onClick={back} className="px-6 py-3 glass-card rounded-xl text-white" disabled={submitting}>← Back</button>}
            {step < 4 && <button type="button" onClick={next} className="flex-1 py-3 bg-[#00CC99] text-[#0f172a] rounded-xl font-bold hover:scale-105 transition">Continue →</button>}
            {step === 4 && <button type="button" onClick={submit} disabled={submitting} className="flex-1 py-3 bg-[#00CC99] text-[#0f172a] rounded-xl font-bold hover:scale-105 transition disabled:opacity-50">{submitting ? 'Submitting...' : 'Submit request'}</button>}
          </div>
        </div>

        <div className="text-center mt-6">
          <button onClick={() => navigate('/')} className="text-gray-500 hover:text-white text-sm">← Back to Home</button>
        </div>
      </div>
    </div>
  );
}

function ReviewRow({ label, value }) {
  return (
    <div className="flex justify-between gap-4 py-2 border-b border-white/5 text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="text-white text-right break-all">{value}</span>
    </div>
  );
}

export default RequestTutor;
