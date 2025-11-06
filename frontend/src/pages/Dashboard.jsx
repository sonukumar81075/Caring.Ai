import { useState, useEffect } from "react";
import DashboardOverview from "../components/DashboardOverview";
import ActionCard from "../components/ActionCard";
import StatCard from "../components/StatCard";
import dashboardService from "../services/dashboardService";
import { useNavigate } from "react-router-dom";
import { Calendar, FileText, UserCheck, UserCheck2, Users } from "lucide-react";
import ReportsGrid from "../components/comman/ReportsGrid";
import { useAuth } from "../contexts/AuthContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [statsLoading, setStatsLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState(null);

  // Fetch dashboard statistics on component mount
  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setStatsLoading(true);
      const response = await dashboardService.getDashboardStats();
      if (response.success && response.stats) {
        setDashboardStats(response.stats);
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      // Set default values if API fails
      setDashboardStats({
        doctors: { total: 0, active: 0, inactive: 0 },
        patients: { total: 0, active: 0, inactive: 0 },
        assessments: {
          total: 0,
          pending: 0,
          scheduled: 0,
          completed: 0,
          cancelled: 0,
          bookingQueue: 0,
        },
        timeBased: { today: 0, thisWeek: 0, thisMonth: 0, recent: 0 },
        users: { total: 0 },
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const handleNewAssessment = () => {
    // navigate("/request-assessment");
    navigate("/booking-queue");
  };

  const handleViewResults = () => {
    navigate("/assessment-results");
  };

  const stats = [
    {
      title: "Total Doctors",
      value: statsLoading ? "..." : dashboardStats?.doctors?.total ?? 0,
      subtitle: `${dashboardStats?.doctors?.active ?? 0} active doctors`,
      color: "blue",
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="#475569"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          />
        </svg>
      ),
    },
    {
      title: "Total Patients",
      value: statsLoading ? "..." : dashboardStats?.patients?.total ?? 0,
      subtitle: `${dashboardStats?.patients?.active ?? 0} active patients`,
      color: "green",
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="#475569"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      title: "Booking Queue",
      value: statsLoading ? "..." : dashboardStats?.assessments?.total ?? 0,
      subtitle: "Pending + Scheduled",
      color: "purple",
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="#475569"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      title: "Completed",
      value: statsLoading ? "..." : dashboardStats?.assessments?.completed ?? 0,
      subtitle: "Total completed assessments",
      color: "orange",
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="#475569"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
    {
      title: "Pending",
      value: statsLoading ? "..." : dashboardStats?.assessments?.pending ?? 0,
      subtitle: "Awaiting schedule",
      color: "orange",
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="#475569"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
          />
        </svg>
      ),
    },
    {
      title: "Scheduled",
      value: statsLoading ? "..." : dashboardStats?.assessments?.scheduled ?? 0,
      subtitle: "Confirmed appointments",
      color: "green",
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="#475569"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-5 5v-5z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4"
          />
        </svg>
      ),
    },
    {
      title: "This Week",
      value: statsLoading ? "..." : dashboardStats?.timeBased?.thisWeek ?? 0,
      subtitle: "Assessments this week",
      color: "indigo",
      icon: (
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="#475569"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
          />
        </svg>
      ),
    },
  ];

  // Filter stats based on user role
  const filteredStats = stats?.filter((stat) => {
    if (user?.role === "Doctor") {
      // Doctor can only see assessment-related stats
      return [
        "Booking Queue",
        "Completed",
        "Pending",
        "Scheduled",
        "This Week",
      ].includes(stat?.title);
    }
    return true; // Clinic users see all stats
  });

  return (
    <div className="space-y-8 mt-6">
      <DashboardOverview stats={dashboardStats} />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredStats?.map((stat, index) => (
          <StatCard
            key={index}
            title={stat?.title}
            value={stat?.value}
            subtitle={stat?.subtitle}
            icon={stat?.icon}
            color={stat?.color}
          />
        ))}
      </div>
      {/* Key Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Only show "Queue Assessment" for Clinic users */}
        {user?.role !== "Doctor" && (
          <ActionCard
            title="Queue Assessment"
            subtitle="Schedule"
            description="Queue a new cognitive assessment call"
            buttonText="New Assessment"
            onButtonClick={handleNewAssessment}
            icon={
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#475569"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            }
          />
        )}
        <ActionCard
          title="Assessment Results"
          subtitle="Results"
          description="View completed assessment results"
          buttonText="View Results"
          onButtonClick={handleViewResults}
          icon={
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="#475569"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          }
        />
      </div>

      {/* Quick Actions - Only show for Clinic users, not for Doctor role */}
      {user?.role !== 'Doctor' && (
        <div className="bg-white rounded-xl shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Reports Access
          </h3>

          <ReportsGrid />
        </div>
      )}

    </div>
  );
};

export default Dashboard;
