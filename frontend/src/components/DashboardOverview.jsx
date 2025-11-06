import { useState } from "react";

const DashboardOverview = () => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="mb-8">
      {/* Dashboard Overview Section */}
      <div className="bg-white rounded-xl shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)]   outline-1 outline-offset-[-1px] outline-white/40  mb-8">
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-6 cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="sm:block hidden">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  // style={{ backgroundColor: "#e2e8f0" }}
                >
                  <svg
                    className="h-5 w-5 text-gray-600  "
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="#475569"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900  ">
                  Dashboard Overview
                </h2>
                <p className="text-sm text-gray-600  ">
                  Quick overview of your assessment statistics and key actions.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-lg hover:bg-gray-100  text-gray-600   transition-colors"
              aria-label={isExpanded ? "Collapse section" : "Expand section"}
            >
              <svg
                className={`h-5 w-5 transition-transform duration-200 ${
                  isExpanded ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="px-6 pb-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700 mb-4">
                Welcome to your CaringAI dashboard. Here you can monitor
                assessment requests, review completed assessments, and manage
                your cognitive assessment workflow. All data is processed
                securely in compliance with HIPAA regulations.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardOverview;
