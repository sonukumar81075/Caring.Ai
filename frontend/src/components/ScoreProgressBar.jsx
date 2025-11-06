import React from "react";

// Define the Progress Bar component
export const ScoreProgressBar = ({ current, total, label = "Score" }) => {
  // Calculate the percentage
  const percentage = (current / total) * 100;

  // Function to create the 0-8 scale labels
  const renderScale = () => {
    const scale = [];
    for (let i = 0; i <= total; i++) {
      scale.push(
        <span
          key={i}
          className="text-sm text-gray-600 w-1/9 text-center"
          style={{ width: i === total ? "10%" : `${100 / total}%` }}
        >
          {i}
        </span>
      );
    }
    return scale;
  };

  return (
    <div className="flex justify-between items-center p-4 w-full mx-auto">
      {/* 1. Progress Bar Container */}
      <div className="w-full
      ">
        <div className="flex items-center mb-2">
          <div className="flex-grow h-3 bg-gray-200 rounded-full overflow-hidden mr-4">
            {/* Progress Fill (75% width for 6/8) */}
            <div
              className="h-full bg-[#BAA377] transition-all duration-500 ease-out"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>
        {/* 3. Scale Markers (0, 1, 2... 8) */}
        <div className="flex justify-between items-start mt-2  ">
          {renderScale()}
        </div>
      </div>

      {/* 2. Score Box */}
      <div className="p-2 rounded-lg bg-white shadow-md border border-gray-100 text-center w-24">
        <div className="text-[#BAA377] font-medium text-lg">{label}</div>
        <div className="text-xl font-bold text-gray-800">
          {current}/{total}
        </div>
      </div>
    </div>
  );
};
