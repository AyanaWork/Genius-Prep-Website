import React, { useState } from 'react';
import gpaService from '../../services/gpa';

function PDFUpload() {
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: upload, 2: preview, 3: analysis

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    
    if (!selectedFile) return;

    // Validate file type
    if (selectedFile.type !== 'application/pdf') {
      setError('Please select a PDF file');
      return;
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('PDF file must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setError('');
    extractTextFromPDF(selectedFile);
  };

  const extractTextFromPDF = async (pdfFile) => {
    setLoading(true);
    setError('');

    try {
      // Use pdf.js to extract text
      const pdfjsLib = window['pdfjs-dist/build/pdf'];
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

      const fileReader = new FileReader();
      
      fileReader.onload = async function() {
        const typedarray = new Uint8Array(this.result);
        
        try {
          const pdf = await pdfjsLib.getDocument(typedarray).promise;
          let fullText = '';

          // Extract text from each page
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += `\n\nPage ${i}:\n${pageText}`;
          }

          setExtractedText(fullText.trim());
          setStep(2);
        } catch (err) {
          setError('Failed to read PDF. Please try another file.');
          console.error('PDF extraction error:', err);
        } finally {
          setLoading(false);
        }
      };

      fileReader.readAsArrayBuffer(pdfFile);
    } catch (err) {
      setError('Failed to process PDF');
      setLoading(false);
    }
  };

  const handleAnalyze = async (analysisType = 'summary') => {
    setLoading(true);
    setError('');

    try {
      const result = await gpaService.analyzeContent(extractedText, analysisType);
      setAnalysis(result.analysis);
      setStep(3);
    } catch (err) {
      if (err.response?.data?.requiresSubscription) {
        setError('GPA subscription required to analyze PDFs');
      } else {
        setError(err.response?.data?.error || 'Failed to analyze PDF');
      }
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setExtractedText('');
    setAnalysis('');
    setStep(1);
    setError('');
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#0f172a] rounded-xl shadow-md p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">📄 Analyze PDF Documents</h3>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Step 1: Upload */}
        {step === 1 && (
          <div>
            <p className="text-gray-600 mb-6">
              Upload lecture slides, notes, or any PDF document for AI analysis and summarization.
            </p>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-primary-500 transition">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="pdf-upload"
              />
              <label htmlFor="pdf-upload" className="cursor-pointer">
                <div className="text-6xl mb-4">📄</div>
                <p className="text-lg font-semibold text-gray-900 mb-2">
                  Click to upload PDF
                </p>
                <p className="text-sm text-gray-600">
                  Maximum file size: 10MB
                </p>
              </label>
            </div>

            {loading && (
              <div className="mt-6 text-center">
                <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                <p className="text-gray-600">Extracting text from PDF...</p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Preview & Choose Analysis */}
        {step === 2 && (
          <div>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">📄</div>
                  <div>
                    <p className="font-semibold text-gray-900">{file?.name}</p>
                    <p className="text-sm text-gray-600">
                      {Math.round(file?.size / 1024)} KB • {extractedText.split(' ').length} words extracted
                    </p>
                  </div>
                </div>
                <button
                  onClick={reset}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  ✕ Remove
                </button>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {extractedText.substring(0, 500)}...
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="font-semibold text-gray-900">Choose analysis type:</p>
              
              <button
                onClick={() => handleAnalyze('summary')}
                disabled={loading}
                className="w-full text-left px-6 py-4 bg-primary-50 border-2 border-primary-200 rounded-lg hover:bg-primary-100 transition disabled:opacity-50"
              >
                <div className="font-semibold text-primary-900 mb-1">📝 Summary & Key Points</div>
                <div className="text-sm text-primary-700">Get main topics, key concepts, and study recommendations</div>
              </button>

              <button
                onClick={() => handleAnalyze('questions')}
                disabled={loading}
                className="w-full text-left px-6 py-4 bg-secondary-50 border-2 border-secondary-200 rounded-lg hover:bg-secondary-100 transition disabled:opacity-50"
              >
                <div className="font-semibold text-secondary-900 mb-1">❓ Generate Practice Questions</div>
                <div className="text-sm text-secondary-700">Create exam questions based on this content</div>
              </button>

              <button
                onClick={() => handleAnalyze('explain')}
                disabled={loading}
                className="w-full text-left px-6 py-4 bg-green-50 border-2 border-green-200 rounded-lg hover:bg-green-100 transition disabled:opacity-50"
              >
                <div className="font-semibold text-green-900 mb-1">💡 Simplified Explanation</div>
                <div className="text-sm text-green-700">Break down complex concepts into simple terms</div>
              </button>
            </div>

            {loading && (
              <div className="mt-6 text-center">
                <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                <p className="text-gray-600">AI is analyzing your PDF...</p>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Analysis Results */}
        {step === 3 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="text-3xl">✅</div>
                <div>
                  <p className="font-semibold text-gray-900">Analysis Complete</p>
                  <p className="text-sm text-gray-600">{file?.name}</p>
                </div>
              </div>
              <button
                onClick={reset}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                Analyze Another PDF
              </button>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-6 border border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-gray-900">AI Analysis:</h4>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(analysis);
                    alert('Analysis copied to clipboard!');
                  }}
                  className="text-sm px-4 py-2 bg-[#0f172a] text-gray-700 rounded-lg hover:bg-gray-100 transition border border-gray-300"
                >
                  📋 Copy
                </button>
              </div>

              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">
                  {analysis}
                </pre>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition"
              >
                ← Different Analysis
              </button>
              <button
                onClick={reset}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
              >
                Upload New PDF
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-bold text-gray-900 mb-2">💡 Tips for Best Results:</h4>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>✓ Upload clear, text-based PDFs (not scanned images)</li>
          <li>✓ Lecture slides and notes work best</li>
          <li>✓ Keep files under 10MB for faster processing</li>
          <li>✓ Try different analysis types for comprehensive understanding</li>
        </ul>
      </div>
    </div>
  );
}

export default PDFUpload;