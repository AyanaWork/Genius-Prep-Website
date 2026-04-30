import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gpaService from '../../services/gpa';
import authService from '../../services/auth';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

function GPADashboard() {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const [hasSubscription, setHasSubscription] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [freeTier, setFreeTier] = useState(null);
  const [loading,setLoading] = useState(true);

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);

  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const [uploadingPDF, setUploadingPDF] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);

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

  const loadConversations = async () => {
    try {
      const response = await gpaService.getConversations();
      const convos = response.conversations || [];
      setConversations(convos.map(c => ({
        id: c.conversation_id,
        title: c.title,
        messages: Array.isArray(c.messages) ? c.messages : [],
        createdAt: c.created_at
      })));
      if (convos.length > 0 && !activeConversation) {
        const firstConvo = convos[0];
        setActiveConversation(firstConvo.conversation_id);
        let parsedMessages = [];
        if (Array.isArray(firstConvo.messages)) {
          parsedMessages = firstConvo.messages;
        } else if (typeof firstConvo.messages === 'string') {
          try { parsedMessages = JSON.parse(firstConvo.messages); } catch (e) {}
        }
        setMessages(parsedMessages);
      }
    } catch (error) {
      console.error('Load conversations error:', error);
    }
  };

  const saveCurrentConversation = async () => {
    if (!activeConversation || messages.length === 0) return;
    try {
      const conversation = conversations.find(c => c.id === activeConversation);
      await gpaService.saveConversation(activeConversation, conversation?.title || 'New Chat', messages);
    } catch (error) {
      console.error('Save conversation error:', error);
    }
  };

  const createNewConversation = async () => {
    const newConvoId = `conv_${Date.now()}`;
    const newConvo = { id: newConvoId, title: 'New Chat', messages: [], createdAt: new Date().toISOString() };
    try {
      await gpaService.saveConversation(newConvoId, 'New Chat', []);
      setConversations([newConvo, ...conversations]);
      setActiveConversation(newConvoId);
      setMessages([]);
    } catch (error) {
      console.error('Create conversation error:', error);
      alert('Failed to create new conversation');
    }
  };

  const selectConversation = async (convId) => {
    try {
      await saveCurrentConversation();
      const response = await gpaService.getConversation(convId);
      setActiveConversation(convId);
      let loadedMessages = response.messages;
      if (Array.isArray(loadedMessages)) {
        setMessages(loadedMessages);
      } else if (typeof loadedMessages === 'string') {
        try {
          const parsed = JSON.parse(loadedMessages);
          setMessages(Array.isArray(parsed) ? parsed : []);
        } catch (e) { setMessages([]); }
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error('Select conversation error:', error);
      alert('Failed to load conversation');
    }
  };

  const deleteConversation = async (convId) => {
    if (!window.confirm('Delete this conversation?')) return;
    try {
      await gpaService.deleteConversation(convId);
      const updated = conversations.filter(c => c.id !== convId);
      setConversations(updated);
      if (convId === activeConversation) {
        if (updated.length > 0) {
          setActiveConversation(updated[0].id);
          const response = await gpaService.getConversation(updated[0].id);
          let loadedMessages = response.messages;
          if (Array.isArray(loadedMessages)) {
            setMessages(loadedMessages);
          } else if (typeof loadedMessages === 'string') {
            try {
              const parsed = JSON.parse(loadedMessages);
              setMessages(Array.isArray(parsed) ? parsed : []);
            } catch (e) { setMessages([]); }
          } else { setMessages([]); }
        } else {
          setActiveConversation(null);
          setMessages([]);
        }
      }
    } catch (error) {
      console.error('Delete conversation error:', error);
      alert('Failed to delete conversation');
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;

    let currentConvId = activeConversation;
    if (!currentConvId) {
      const newConvoId = `conv_${Date.now()}`;
      currentConvId = newConvoId;
      const newConvo = { id: newConvoId, title: 'New Chat', messages: [], createdAt: new Date().toISOString() };
      await gpaService.saveConversation(newConvoId, 'New Chat', []);
      setConversations([newConvo, ...conversations]);
      setActiveConversation(newConvoId);
    }

    const userMessage = { role: 'user', content: input.trim(), timestamp: new Date().toISOString() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsGenerating(true);
    setError('');

    try {
      const result = await gpaService.answerQuestion(userMessage.content);
      const assistantMessage = { role: 'assistant', content: result.answer, timestamp: new Date().toISOString() };
      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);

      let chatTitle;
      if (newMessages.length === 1) {
        const firstWords = userMessage.content.split(' ').slice(0, 6).join(' ');
        chatTitle = firstWords.length < userMessage.content.length ? `${firstWords}...` : firstWords;
      } else {
        const currentConv = conversations.find(c => c.id === currentConvId);
        chatTitle = currentConv?.title || 'New Chat';
      }

      await gpaService.saveConversation(currentConvId, chatTitle, updatedMessages);
      setConversations(conversations.map(c =>
        c.id === currentConvId ? { ...c, title: chatTitle, messages: updatedMessages } : c
      ));

    } catch (err) {
      console.error('Send message error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to get response');
      setMessages(messages);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePDFUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') { alert('Please upload a PDF file'); return; }
    if (file.size > 10 * 1024 * 1024) { alert('PDF file must be less than 10MB'); return; }

    setPdfFile(file);
    setUploadingPDF(true);
    setError('');

    try {
      const pdfjsLib = window['pdfjs-dist/build/pdf'];
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

      const fileReader = new FileReader();
      fileReader.onload = async function () {
        try {
          const typedarray = new Uint8Array(this.result);
          const pdf = await pdfjsLib.getDocument(typedarray).promise;
          let fullText = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            fullText += textContent.items.map(item => item.str).join(' ') + '\n\n';
          }

          if (fullText.length < 100) throw new Error('Could not extract enough text from PDF.');

          let currentConvId = activeConversation;
          if (!currentConvId) {
            const newConvoId = `conv_${Date.now()}`;
            currentConvId = newConvoId;
            await gpaService.saveConversation(newConvoId, `PDF: ${file.name.substring(0, 30)}`, []);
            setConversations([{ id: newConvoId, title: `PDF: ${file.name.substring(0, 30)}`, messages: [], createdAt: new Date().toISOString() }, ...conversations]);
            setActiveConversation(newConvoId);
          }

          const userMessage = { role: 'user', content: `📄 Uploaded: ${file.name}\n\nPlease analyze and summarize this document.`, timestamp: new Date().toISOString() };
          const newMessages = [...messages, userMessage];
          setMessages(newMessages);

          const result = await gpaService.analyzePDF(fullText, 'summary');
          const assistantMessage = { role: 'assistant', content: result.analysis, timestamp: new Date().toISOString() };
          const updatedMessages = [...newMessages, assistantMessage];
          setMessages(updatedMessages);

          const pdfTitle = `PDF: ${file.name.substring(0, 30)}`;
          await gpaService.saveConversation(currentConvId, pdfTitle, updatedMessages);
          setConversations(conversations.map(c => c.id === currentConvId ? { ...c, title: pdfTitle, messages: updatedMessages } : c));

          setPdfFile(null);
          if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (err) {
          console.error('PDF processing error:', err);
          setError(err.message || 'Failed to process PDF');
          setPdfFile(null);
        } finally {
          setUploadingPDF(false);
        }
      };
      fileReader.readAsArrayBuffer(file);
    } catch (err) {
      console.error('PDF upload error:', err);
      setError('Failed to upload PDF');
      setPdfFile(null);
      setUploadingPDF(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      {/* Main Content */}
      <div className="pt-20 flex h-screen">
        {/* Sidebar */}
        <div className="w-64 glass-card rounded-3xl m-4 p-4 flex flex-col h-[calc(100vh-5rem)] overflow-y-auto">
          <div className="mb-4">
            <button
              onClick={createNewConversation}
              className="w-full py-2 bg-[#00CC99] text-[#0f172a] rounded-xl font-bold hover:scale-105 transition flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Chat
            </button>
          </div>

          {/* Subscription Status */}
          <div className="mb-4 p-3 bg-white/5 rounded-xl border border-white/10">
            {hasSubscription ? (
              <div className="text-xs">
                <p className="font-semibold text-[#00CC99] mb-1">✓ Premium Active</p>
                <p className="text-gray-400">{subscription?.type} Plan</p>
                <p className="text-gray-500 mt-1">{subscription?.daysRemaining} days left</p>
              </div>
            ) : freeTier ? (
              <div className="text-xs">
                <p className="font-semibold text-white/80 mb-1">Free Tier</p>
                <p className="text-gray-400">{freeTier.remaining} / {freeTier.limit} uses left</p>
                <button onClick={() => navigate('/subscription')} className="mt-2 w-full py-1.5 bg-[#00CC99] text-[#0f172a] rounded-lg text-xs font-bold hover:scale-105 transition">
                  Upgrade to Unlimited
                </button>
              </div>
            ) : (
              <div className="text-xs">
                <p className="font-semibold text-red-400 mb-1">Subscription Required</p>
                <button onClick={() => navigate('/subscription')} className="mt-2 w-full py-1.5 bg-[#00CC99] text-[#0f172a] rounded-lg text-xs font-bold hover:scale-105 transition">
                  Subscribe Now
                </button>
              </div>
            )}
          </div>

          {/* Conversation List */}
          <div className="flex-1">
            {conversations.length === 0 ? (
              <div className="text-center text-sm text-gray-500">No conversations yet</div>
            ) : (
              <div className="space-y-1">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`group relative p-2 rounded-lg cursor-pointer transition ${
                      activeConversation === conv.id ? 'bg-[#00CC99]/20 border border-[#00CC99]/50' : 'hover:bg-white/5'
                    }`}
                    onClick={() => selectConversation(conv.id)}
                  >
                    <p className="text-sm font-medium truncate pr-6">{conv.title}</p>
                    <p className="text-xs text-gray-500">{new Date(conv.createdAt).toLocaleDateString()}</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }}
                      className="absolute top-1 right-1 p-1 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col m-4 ml-0">
          <div className="glass-card rounded-3xl p-4 mb-4">
            <h1 className="text-xl font-bold">
              {activeConversation ? conversations.find(c => c.id === activeConversation)?.title || 'Chat' : 'Lwazi'}
            </h1>
            <p className="text-sm text-gray-400">Your AI study companion</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/5 rounded-3xl mb-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎓</div>
                <h2 className="text-2xl font-bold mb-2">Welcome to GPA!</h2>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  Ask me anything about your studies. I can help with notes, practice tests, explanations, and more.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
                  <div className="glass-card p-4 rounded-xl">
                    <div className="text-2xl mb-2">📝</div>
                    <p className="text-sm font-semibold mb-1">Generate Notes</p>
                    <p className="text-xs text-gray-400">Get comprehensive study notes</p>
                  </div>
                  <div className="glass-card p-4 rounded-xl">
                    <div className="text-2xl mb-2">📄</div>
                    <p className="text-sm font-semibold mb-1">Analyze PDFs</p>
                    <p className="text-xs text-gray-400">Upload slides or chapters</p>
                  </div>
                  <div className="glass-card p-4 rounded-xl">
                    <div className="text-2xl mb-2">💡</div>
                    <p className="text-sm font-semibold mb-1">Ask Questions</p>
                    <p className="text-xs text-gray-400">Get detailed explanations</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-3xl ${message.role === 'user' ? 'ml-12' : 'mr-12'}`}>
                      <div className={`rounded-xl p-4 ${
                        message.role === 'user'
                          ? 'bg-[#00CC99] text-[#0f172a]'
                          : 'glass-card text-white'
                      }`}>
                        {message.role === 'assistant' ? (
                          <div className="prose prose-invert prose-sm max-w-none">
                            <ReactMarkdown
                              remarkPlugins={[remarkMath]}
                              rehypePlugins={[rehypeKatex]}
                              components={{
                                strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
                                h1: ({node, ...props}) => <h1 className="text-xl font-bold mt-4 mb-2" {...props} />,
                                h2: ({node, ...props}) => <h2 className="text-lg font-bold mt-3 mb-2" {...props} />,
                                p: ({node, ...props}) => <p className="mb-3 text-gray-200 leading-relaxed" {...props} />,
                                ul: ({node, ...props}) => <ul className="list-disc list-inside mb-3 space-y-1 text-gray-200" {...props} />,
                                ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-3 space-y-1 text-gray-200" {...props} />,
                                li: ({node, ...props}) => <li className="ml-2 text-gray-200" {...props} />,
                                code: ({node, inline, ...props}) =>
                                  inline
                                    ? <code className="bg-white/10 px-1 py-0.5 rounded text-sm font-mono" {...props} />
                                    : <code className="block bg-white/10 p-3 rounded my-2 text-sm font-mono overflow-x-auto" {...props} />
                              }}
                            >
                              {message.content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1 px-2">
                        {new Date(message.timestamp).toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                {isGenerating && (
                  <div className="flex justify-start">
                    <div className="glass-card rounded-xl p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-[#00CC99] rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-[#00CC99] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-[#00CC99] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        <span className="text-sm text-gray-400 ml-2">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input Area */}
          <div className="glass-card rounded-3xl p-4">
            {error && (
              <div className="mb-3 bg-red-500/20 border border-red-500 text-red-300 px-4 py-2 rounded-lg text-sm">{error}</div>
            )}
            <div className="flex items-end gap-2">
              <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handlePDFUpload} className="hidden" />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isGenerating || uploadingPDF}
                className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition disabled:opacity-50"
                title="Upload PDF"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </button>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={uploadingPDF ? "Processing PDF..." : "Ask me anything..."}
                disabled={isGenerating || uploadingPDF}
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-[#00CC99] focus:outline-none text-white resize-none disabled:opacity-50"
                rows={1}
                style={{ minHeight: '52px', maxHeight: '120px' }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isGenerating || uploadingPDF}
                className="px-6 py-3 bg-[#00CC99] text-[#0f172a] rounded-xl font-bold hover:scale-105 transition disabled:opacity-50 flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-[#0f172a] border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    <span>Send</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Press Enter to send • Shift+Enter for new line • Upload PDFs up to 10MB
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GPADashboard;