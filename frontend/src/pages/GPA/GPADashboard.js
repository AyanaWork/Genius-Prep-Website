import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gpaService from '../../services/gpa';
import authService from '../../services/auth';
import PDFUpload from '../../components/gpa/PDFUpload';

function GPADashboard() {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  
  const [hasSubscription, setHasSubscription] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('notes'); // notes, test, question, analyze
  
  
  // Form states
  const [topic, setTopic] = useState('');
  const [educationLevel, setEducationLevel] = useState('university');
  const [subject, setSubject] = useState('');
  const [topics, setTopics] = useState('');
  const [numQuestions, setNumQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState('medium');
  const [question, setQuestion] = useState('');
  const [content, setContent] = useState('');
  
  // Response states
  const [response, setResponse] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkSubscriptionStatus();
  }, []);

  const checkSubscriptionStatus = async () => {
    try {
      setLoading(true);
      const status = await gpaService.checkSubscription();
      setHasSubscription(status.hasSubscription);
      setSubscription(status.subscription || null);
    } catch (err) {
      console.error('Check subscription error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateNotes = async (e) => {
    e.preventDefault();
    setError('');
    setResponse('');
    setIsGenerating(true);

    try {
      const result = await gpaService.generateNotes(topic, educationLevel);
      setResponse(result.notes);
    } catch (err) {
      if (err.response?.data?.requiresSubscription) {
        setError('You need an active GPA subscription to use this feature.');
      } else {
        setError(err.response?.data?.error || 'Failed to generate notes');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateTest = async (e) => {
    e.preventDefault();
    setError('');
    setResponse('');
    setIsGenerating(true);

    try {
      const result = await gpaService.generateTest(subject, topics, numQuestions, difficulty);
      setResponse(result.test);
    } catch (err) {
      if (err.response?.data?.requiresSubscription) {
        setError('You need an active GPA subscription to use this feature.');
      } else {
        setError(err.response?.data?.error || 'Failed to generate test');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswerQuestion = async (e) => {
    e.preventDefault();
    setError('');
    setResponse('');
    setIsGenerating(true);

    try {
      const result = await gpaService.answerQuestion(question);
      setResponse(result.answer);
    } catch (err) {
      if (err.response?.data?.requiresSubscription) {
        setError('You need an active GPA subscription to use this feature.');
      } else {
        setError(err.response?.data?.error || 'Failed to answer question');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnalyzeContent = async (e) => {
    e.preventDefault();
    setError('');
    setResponse('');
    setIsGenerating(true);

    try {
      const result = await gpaService.analyzeContent(content, 'summary');
      setResponse(result.analysis);
    } catch (err) {
      if (err.response?.data?.requiresSubscription) {
        setError('You need an active GPA subscription to use this feature.');
      } else {
        setError(err.response?.data?.error || 'Failed to analyze content');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading GPA...</p>
        </div>
      </div>
    );
  }

  // Subscription required screen
  if (!hasSubscription) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-xl font-bold text-primary-800">GPA - Genius Prep Accelerator</h1>
              <button
                onClick={() => navigate(`/${currentUser.role}/dashboard`)}
                className="text-gray-700 hover:text-primary-600 transition"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="text-6xl mb-6">🤖</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              GPA Subscription Required
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Unlock unlimited AI-powered study tools with a GPA subscription
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Semester Plan */}
              <div className="border-2 border-gray-200 rounded-xl p-6 hover:border-primary-500 transition">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Semester</h3>
                <div className="text-4xl font-bold text-primary-600 mb-4">R450</div>
                <p className="text-gray-600 mb-4">6 months access</p>
                <ul className="text-sm text-gray-700 space-y-2 mb-6">
                  <li>✓ Unlimited note generation</li>
                  <li>✓ Practice test creation</li>
                  <li>✓ AI Q&A assistant</li>
                  <li>✓ Content analysis</li>
                </ul>
              </div>

              {/* Annual Plan */}
              <div className="border-2 border-primary-500 bg-primary-50 rounded-xl p-6 relative">
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-xs font-bold">
                    BEST VALUE
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Annual</h3>
                <div className="text-4xl font-bold text-primary-600 mb-4">R700</div>
                <p className="text-gray-600 mb-4">12 months access</p>
                <ul className="text-sm text-gray-700 space-y-2 mb-6">
                  <li>✓ Everything in Semester</li>
                  <li>✓ Save R200 per year</li>
                  <li>✓ Priority support</li>
                  <li>✓ Early access to new features</li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h4 className="font-bold text-gray-900 mb-2">To Subscribe:</h4>
              <p className="text-sm text-gray-700">
                Contact us at <strong>hello@geniuspreptuition.co.za</strong> or call <strong>071 961 7185</strong> to activate your GPA subscription.
              </p>
            </div>

            <button
              onClick={() => navigate(`/${currentUser.role}/dashboard`)}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main GPA interface (for subscribed users)
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-bold text-primary-800">🤖 GPA - Genius Prep Accelerator</h1>
              {subscription && (
                <p className="text-xs text-gray-600">
                  Active until {new Date(subscription.endDate).toLocaleDateString()} 
                  ({subscription.daysRemaining} days remaining)
                </p>
              )}
            </div>
            <button
              onClick={() => navigate(`/${currentUser.role}/dashboard`)}
              className="text-gray-700 hover:text-primary-600 transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar - Tool Selection */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4">AI Tools</h2>
              <div className="space-y-2">
                <button
                  onClick={() => { setActiveTab('notes'); setResponse(''); setError(''); }}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
                    activeTab === 'notes' 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📝 Generate Notes
                </button>
                <button
                  onClick={() => { setActiveTab('test'); setResponse(''); setError(''); }}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
                    activeTab === 'test' 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  ✍️ Generate Test
                </button>
                <button
                  onClick={() => { setActiveTab('question'); setResponse(''); setError(''); }}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
                    activeTab === 'question' 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  💬 Ask Question
                </button>
                <button
                  onClick={() => { setActiveTab('analyze'); setResponse(''); setError(''); }}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
                    activeTab === 'analyze' 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🔍 Analyze Content
                </button>
                <button
                  onClick={() => { setActiveTab('pdf'); setResponse(''); setError(''); }}
                  className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${
                    activeTab === 'pdf' 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📄 Analyze PDF
                </button>
              </div>
            </div>
          </div>

          {/* Main Content - Forms and Results */}
          <div className="lg:col-span-2 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Generate Notes Tab */}
            {activeTab === 'notes' && (
              <div className="bg-white rounded-xl shadow-md p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Generate Study Notes</h3>
                <form onSubmit={handleGenerateNotes} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Topic <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g., Photosynthesis, Quadratic Equations, French Revolution"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Education Level
                    </label>
                    <select
                      value={educationLevel}
                      onChange={(e) => setEducationLevel(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="high school">High School</option>
                      <option value="university">University</option>
                      <option value="postgraduate">Postgraduate</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="w-full py-3 px-6 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50"
                  >
                    {isGenerating ? 'Generating Notes...' : 'Generate Notes'}
                  </button>
                </form>
              </div>
            )}

            {/* Generate Test Tab */}
            {activeTab === 'test' && (
              <div className="bg-white rounded-xl shadow-md p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Generate Practice Test</h3>
                <form onSubmit={handleGenerateTest} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g., Mathematics, Physics, History"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Topics to Cover <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={topics}
                      onChange={(e) => setTopics(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      rows={3}
                      placeholder="e.g., Quadratic equations, Factoring, Word problems"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Number of Questions
                      </label>
                      <input
                        type="number"
                        value={numQuestions}
                        onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                        min="5"
                        max="30"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Difficulty Level
                      </label>
                      <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="w-full py-3 px-6 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50"
                  >
                    {isGenerating ? 'Generating Test...' : 'Generate Test & Memo'}
                  </button>
                </form>
              </div>
            )}

            {/* Ask Question Tab */}
            {activeTab === 'question' && (
              <div className="bg-white rounded-xl shadow-md p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Ask Academic Question</h3>
                <form onSubmit={handleAnswerQuestion} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Question <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      rows={5}
                      placeholder="Ask any academic question..."
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="w-full py-3 px-6 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50"
                  >
                    {isGenerating ? 'Getting Answer...' : 'Get Answer'}
                  </button>
                </form>
              </div>
            )}

            {/* Analyze Content Tab */}
            {activeTab === 'analyze' && (
              <div className="bg-white rounded-xl shadow-md p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Analyze Study Content</h3>
                <form onSubmit={handleAnalyzeContent} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Paste Content to Analyze <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      rows={8}
                      placeholder="Paste your lecture notes, textbook content, or any study material here..."
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="w-full py-3 px-6 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50"
                  >
                    {isGenerating ? 'Analyzing...' : 'Analyze & Summarize'}
                  </button>
                </form>
              </div>
            )}

            {/* Analyze PDF Tab */}
            {activeTab === 'pdf' && (
              <PDFUpload />
            )}

            {/* Response/Output Section */}
            {response && (
              <div className="bg-white rounded-xl shadow-md p-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">AI Response</h3>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(response);
                      alert('Copied to clipboard!');
                    }}
                    className="text-sm px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                  >
                    📋 Copy
                  </button>
                </div>
                <div className="prose max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed bg-gray-50 p-6 rounded-lg">
                    {response}
                  </pre>
                </div>
              </div>
            )}

            {isGenerating && (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600">AI is working on your request...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default GPADashboard;