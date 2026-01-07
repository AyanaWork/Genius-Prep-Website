import React, { useState } from 'react';

function ModuleCodeInput({ moduleCodes, onChange }) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  // Validate module code format (alphanumeric, 3-10 characters)
  const validateModuleCode = (code) => {
    const cleaned = code.trim().toUpperCase();
    
    if (cleaned.length < 3 || cleaned.length > 10) {
      return { valid: false, message: 'Module code must be 3-10 characters' };
    }
    
    if (!/^[A-Z0-9]+$/.test(cleaned)) {
      return { valid: false, message: 'Only letters and numbers allowed' };
    }
    
    if (moduleCodes.includes(cleaned)) {
      return { valid: false, message: 'Module code already added' };
    }
    
    return { valid: true, code: cleaned };
  };

  const handleAdd = () => {
    setError('');
    
    if (!inputValue.trim()) {
      setError('Please enter a module code');
      return;
    }

    const validation = validateModuleCode(inputValue);
    
    if (!validation.valid) {
      setError(validation.message);
      return;
    }

    // Add the module code
    onChange([...moduleCodes, validation.code]);
    setInputValue('');
  };

  const handleRemove = (codeToRemove) => {
    onChange(moduleCodes.filter(code => code !== codeToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-3">
      {/* Input Row */}
      <div className="flex gap-2">
        <div className="flex-1">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setError('');
            }}
            onKeyPress={handleKeyPress}
            placeholder="e.g., WTW114, MAT101, PHY121"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition uppercase"
            maxLength={10}
          />
          {error && (
            <p className="text-red-600 text-sm mt-1">{error}</p>
          )}
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="px-6 py-2 bg-secondary-500 text-white rounded-lg font-semibold hover:bg-secondary-600 transition whitespace-nowrap"
        >
          + Add
        </button>
      </div>

      {/* Module Codes Display */}
      {moduleCodes.length > 0 && (
        <div>
          <p className="text-sm text-gray-600 mb-2">
            Added module codes ({moduleCodes.length}):
          </p>
          <div className="flex flex-wrap gap-2">
            {moduleCodes.map((code, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-50 text-secondary-700 rounded-lg font-mono font-semibold border border-secondary-200"
              >
                {code}
                <button
                  type="button"
                  onClick={() => handleRemove(code)}
                  className="text-secondary-700 hover:text-red-600 transition"
                  title="Remove module code"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Hint Text */}
      <p className="text-sm text-gray-500">
        Add university module codes (e.g., WTW114 for Mathematics, PHY121 for Physics).
        Students will be able to search for you by these codes.
      </p>
    </div>
  );
}

export default ModuleCodeInput;