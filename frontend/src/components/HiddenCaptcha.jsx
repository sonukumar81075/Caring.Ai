import React, { useState } from 'react';

const HiddenCaptcha = ({ challenge, onSubmit, onCancel }) => {
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!answer.trim()) {
      setError('Please enter your answer');
      return;
    }

    const numericAnswer = parseInt(answer, 10);
    if (isNaN(numericAnswer)) {
      setError('Please enter a valid number');
      return;
    }

    onSubmit(numericAnswer);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Security Verification
        </h3>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Please solve this simple math problem to continue:
          </p>
          <div className="bg-gray-50 p-4 rounded-md text-center">
            <span className="text-xl font-mono font-bold text-gray-800">
              {challenge} = ?
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Answer:
            </label>
            <input
              type="number"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter the answer"
              autoFocus
            />
            {error && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Verify
            </button>
          </div>
        </form>

        <div className="mt-4 text-xs text-gray-500 text-center">
          This helps protect your account from automated attacks
        </div>
      </div>
    </div>
  );
};

export default HiddenCaptcha;
