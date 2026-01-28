import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gpaService from '../../services/gpa';
import authService from '../../services/auth';

function GPADashboard() {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const messagesEndRef = useRef(null);
  
  const [hasSubscription, setHasSubscription] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [freeTier, setFreeTier] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Conversation management
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  
  // Input and generation
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    checkSubscriptionStatus();
    loadConversations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const checkSubscriptionStatus = async () => {
    try {
      setLoading(true);
      const status = await gpaService.checkSubscription();
      
      if (status.hasSubscription) {
        setHasSubscription(true);
        setSubscription(status.subscription);
      } else if (status.freeTier) {
        setHasSubscription(false);
        setFreeTier(status.freeTier);
      } else {
        setHasSubscription(false);
        setFreeTier(null);
      }
    } catch (err) {
      console.error('Check subscription error:', err);
      setError('Failed to check subscription status');
    } finally {
      setLoading(false);
    }
  };

  const loadConversations = () => {
    // Load from localStorage
    const saved = localStorage.getItem('gpa_conversations');
    if (saved) {
      const parsed = JSON.parse(saved);
      setConversations(parsed);
      if (parsed.length > 0 && !activeConversation) {
        setActiveConversation(parsed[0].id);
        setMessages(parsed[0].messages);
      }
    }
  };

  const saveConversations = (convos) => {
    localStorage.setItem('gpa_conversations', JSON.stringify(convos));
  };

  const createNewConversation = () => {
    const newConvo = {
      id: Date.now(),
      title: 'New Chat',
      messages: [],
      createdAt: new Date().toISOString()
    };
    const updated = [newConvo, ...conversations];
    setConversations(updated);
    setActiveConversation(newConvo.id);
    setMessages([]);
    saveConversations(updated);
  };

  const selectConversation = (convId) => {
    const convo = conversations.find(c => c.id === convId);
    if (convo) {
      setActiveConversation(convId);
      setMessages(convo.messages);
    }
  };

  const deleteConversation = (convId) => {
    const updated = conversations.filter(c => c.id !== convId);
    setConversations(updated);
    saveConversations(updated);
    
    if (convId === activeConversation) {
      if (updated.length > 0) {
        setActiveConversation(updated[0].id);
        setMessages(updated[0].messages);
      } else {
        setActiveConversation(null);
        setMessages([]);
      }
    }
  };

  const updateConversationTitle = (convId, newTitle) => {
    const updated = conversations.map(c => 
      c.id === convId ? { ...c, title: newTitle } : c
    );
    setConversations(updated);
    saveConversations(updated);
  };

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;

    const userMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setError('');
    setIsGenerating(true);

    try {
      // Call GPA service with the user's question
      const result = await gpaService.answerQuestion(input.trim());
      
      const assistantMessage = {
        role: 'assistant',
        content: result.answer || result.notes || result.test || 'I processed your request.',
        timestamp: new Date().toISOString()
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);

      // Update conversation
      if (activeConversation) {
        const updated = conversations.map(c => {
          if (c.id === activeConversation) {
            const title = c.messages.length === 0 && input.trim().length > 0
              ? input.trim().slice(0, 30) + (input.trim().length > 30 ? '...' : '')
              : c.title;
            return { ...c, messages: finalMessages, title };
          }
          return c;
        });
        setConversations(updated);
        saveConversations(updated);
      } else {
        // Create new conversation automatically
        const newConvo = {
          id: Date.now(),
          title: input.trim().slice(0, 30) + (input.trim().length > 30 ? '...' : ''),
          messages: finalMessages,
          createdAt: new Date().toISOString()
        };
        const updated = [newConvo, ...conversations];
        setConversations(updated);
        setActiveConversation(newConvo.id);
        saveConversations(updated);
      }

      // Update free tier if applicable
      if (result.accessInfo && result.accessInfo.remaining !== undefined) {
        setFreeTier(prev => ({
          ...prev,
          remaining: result.accessInfo.remaining,
          used: prev.used + 1
        }));
      }
    } catch (err) {
      if (err.response?.data?.requiresSubscription) {
        setError('You need an active GPA subscription to continue. Subscribe to get unlimited access!');
      } else {
        setError(err.response?.data?.error || 'Failed to get response. Please try again.');
      }
      // Remove the user message on error
      setMessages(messages);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubscribe = async (subscriptionType) => {
    try {
      setLoading(true);
      const paymentData = await gpaService.initiatePayment(subscriptionType);
      
      // Redirect to PayFast
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = paymentData.paymentUrl;

      Object.keys(paymentData.paymentData).forEach(key => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = paymentData.paymentData[key];
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      setError('Failed to initiate payment. Please try again.');
      setLoading(false);
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
  if (!hasSubscription && (!freeTier || freeTier.remaining === 0)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
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
            <div className="text-6xl mb-6">֎</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {freeTier && freeTier.used >= 5 
                ? 'Free Trial Complete - Subscribe to Continue'
                : 'GPA Subscription Required'}
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
                <ul className="text-sm text-gray-700 space-y-2 mb-6 text-left">
                  <li>✓ Unlimited note generation</li>
                  <li>✓ Practice test creation</li>
                  <li>✓ AI Q&A assistant</li>
                  <li>✓ Content analysis</li>
                </ul>
                <button
                  onClick={() => handleSubscribe('semester')}
                  disabled={loading}
                  className="w-full py-3 px-6 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50"
                >
                  Subscribe Now
                </button>
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
                <ul className="text-sm text-gray-700 space-y-2 mb-6 text-left">
                  <li>✓ Everything in Semester</li>
                  <li>✓ Save R200 per year</li>
                  <li>✓ Priority support</li>
                  <li>✓ Early access to new features</li>
                </ul>
                <button
                  onClick={() => handleSubscribe('annual')}
                  disabled={loading}
                  className="w-full py-3 px-6 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition disabled:opacity-50"
                >
                  Subscribe Now
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main Chat Interface (Claude-like)
  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Top Navigation */}
      <nav className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(`/${currentUser.role}/dashboard`)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Genius Prep Accelerator</h1>
          </div>
          
          {!hasSubscription && freeTier && (
            <div className="text-sm text-gray-600">
              {freeTier.remaining} free uses remaining
            </div>
          )}
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Conversation History */}
        <div className="w-64 flex-shrink-0 bg-gray-50 border-r border-gray-200 flex flex-col">
          {/* New Chat Button */}
          <div className="p-3 border-b border-gray-200">
            <button
              onClick={createNewConversation}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Chat
            </button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto">
            {conversations.map(convo => (
              <div
                key={convo.id}
                className={`group px-3 py-2.5 cursor-pointer hover:bg-gray-100 transition border-b border-gray-100 ${
                  activeConversation === convo.id ? 'bg-gray-100' : ''
                }`}
                onClick={() => selectConversation(convo.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {convo.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {new Date(convo.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(convo.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 ml-2 p-1 hover:bg-gray-200 rounded transition"
                  >
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Subscription Info */}
          <div className="p-3 border-t border-gray-200 bg-white">
            {hasSubscription ? (
              <div className="text-xs text-gray-600">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="font-medium">Subscribed</span>
                </div>
                <p>Unlimited access</p>
              </div>
            ) : (
              <button
                onClick={() => handleSubscribe('annual')}
                className="w-full px-3 py-2 bg-primary-600 text-white rounded-lg text-xs font-medium hover:bg-primary-700 transition"
              >
                Upgrade to Unlimited
              </button>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center max-w-2xl px-4">
                  <div className="text-6xl mb-6">֎</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">
                    How can I help you today?
                  </h2>
                  <p className="text-gray-600 mb-8">
                    I can help you generate study notes, create practice tests, answer academic questions, and more.
                  </p>
                  <div className="grid grid-cols-2 gap-3 max-w-xl mx-auto">
                    {[
                      'Explain photosynthesis',
                      'Create a math test',
                      'Summarize this topic',
                      'Help with my assignment'
                    ].map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => setInput(prompt)}
                        className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-left transition"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary-600 text-sm font-bold">AI</span>
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    {msg.role === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-gray-600 text-sm font-bold">
                          {currentUser?.email?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
                {isGenerating && (
                  <div className="flex gap-4 justify-start">
                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary-600 text-sm font-bold">AI</span>
                    </div>
                    <div className="bg-gray-100 rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="px-4 py-2">
              <div className="max-w-3xl mx-auto bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="flex-shrink-0 border-t border-gray-200 bg-white p-4">
            <div className="max-w-3xl mx-auto">
              <div className="flex gap-3 items-end">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Ask me anything about your studies..."
                  rows={1}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                  style={{ minHeight: '48px', maxHeight: '200px' }}
                  disabled={isGenerating}
                />
                <button
                  onClick={handleSend}
                  disabled={isGenerating || !input.trim()}
                  className="px-5 py-3 bg-primary-600 text-white rounded-2xl hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GPADashboard;