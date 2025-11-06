import { Activity } from "lucide-react";
import { useState } from "react";

const SuperAdminDashboardOverview = ({ fetchDashboardData }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="my-8">
      {/* Dashboard Overview Section */}
      <div className="bg-white rounded-xl shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)]   outline-1 outline-offset-[-1px] outline-white/40  mb-8">
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-6  "
        >
          <div className="sm:flex items-center justify-between">
            <div className="flex sm:items-center space-x-3">
              <div className=" sm:block hidden  ">
                <div className="w-8 h-8 bg-blue-100  rounded-lg flex items-center justify-center">
                  <svg
                    className="h-5 w-5 text-color "
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
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
                  Super Admin Dashboard Overview
                </h2>
                <p className="text-sm text-gray-600  ">
                  Overview of system analytics and reports
                </p>
              </div>
            </div>
            <button
              onClick={fetchDashboardData}
              className="flex items-center gap-2 w-full sm:w-auto justify-center px-4 py-2 sm:mt-0 mt-6 bg-color  text-white rounded-lg bg-hover cursor-pointer  transition-colors"
            >
              <Activity className="w-4 h-4" />
              Refresh Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboardOverview;
