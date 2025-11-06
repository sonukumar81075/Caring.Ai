import { useState, useEffect } from "react";
import {
  Users,
  UserCheck,
  Calendar,
  ClipboardList,
  FileText,
  TrendingUp,
  Activity,
  BarChart3,
} from "lucide-react";
import StatCard from "../components/StatCard";
import SuperAdminDashboardOverview from "../components/SuperAdminDashboardOverview";

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalBookings: 0,
    totalAssessments: 0,
    pendingAssessments: 0,
    completedAssessments: 0,
    totalAdmins: 0,
    activeAdmins: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/superadmin/dashboard-stats`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data?.stats);

        setRecentActivities(data?.recentActivities || []);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      setStats({
        totalPatients: 0,
        totalDoctors: 0,
        totalBookings: 0,
        totalAssessments: 0,
        pendingAssessments: 0,
        completedAssessments: 0,
        totalAdmins: 0,
        activeAdmins: 0,
      });
    } finally {
      setLoading(false);
    }
  };
  const statsData = [
    {
      icon: <Users />,
      title: "Total Patients",
      value: stats?.totalPatients,
      subtitle: "Registered patients",
      color: "blue",
    },
    {
      icon: <UserCheck />,
      title: "Total Doctors",
      value: stats?.totalDoctors,
      subtitle: "Active doctors",
      color: "green",
    },
    {
      icon: <Calendar />,
      title: "Total Bookings",
      value: stats?.totalBookings,
      subtitle: "Assessment bookings",
      color: "purple",
    },
    {
      icon: <FileText />,
      title: "Total Assessments",
      value: stats?.totalAssessments,
      subtitle: "Completed & pending",
      color: "orange",
    },
    {
      icon: <ClipboardList />,
      title: "Pending Assessments",
      value: stats?.pendingAssessments,
      subtitle: "Awaiting completion",
      color: "orange",
    },
    {
      icon: <TrendingUp />,
      title: "Completed Assessments",
      value: stats?.completedAssessments,
      subtitle: "Successfully finished",
      color: "green",
    },
    {
      icon: <Users />,
      title: "Total Clinic",
      value: stats?.totalAdmins,
      subtitle: "System administrators",
      color: "indigo",
    },
    {
      icon: <Activity />,
      title: "Active Clinic",
      value: stats?.activeAdmins,
      subtitle: "Currently online",
      color: "pink",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#475569] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 ">
      <SuperAdminDashboardOverview fetchDashboardData={fetchDashboardData} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {statsData?.map((stat, index) => (
          <StatCard
            key={index}
            icon={stat?.icon}
            title={stat?.title}
            value={stat?.value}
            subtitle={stat?.subtitle}
            color={stat?.color}
          />
        ))}
      </div>

      {/* Charts and Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Overview */}
        <div className="bg-white rounded-xl shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              System Overview
            </h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-600">
                  Assessment Completion Rate
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {stats?.totalAssessments > 0
                    ? Math.round(
                        (stats?.completedAssessments /
                          stats?.totalAssessments) *
                          100
                      )
                    : 0}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-sky-200 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      stats?.totalAssessments > 0
                        ? (stats?.completedAssessments /
                            stats?.totalAssessments) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-600">
                  Doctor Utilization
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {stats?.totalDoctors > 0
                    ? Math.round(
                        (stats?.totalBookings / (stats?.totalDoctors * 10)) *
                          100
                      )
                    : 0}
                  %
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-200 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${
                      stats?.totalDoctors > 0
                        ? Math.min(
                            (stats?.totalBookings /
                              (stats?.totalDoctors * 10)) *
                              100,
                            100
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">
                  Patient Engagement
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {stats?.totalPatients > 0
                    ? Math.round(
                        ((stats?.totalAssessments ?? 0) /
                          stats?.totalPatients) *
                          100
                      )
                    : 0}
                  %
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    (stats?.totalAssessments ?? 0) > 0
                      ? "bg-violet-500"
                      : "bg-transparent"
                  }`}
                  style={{
                    width: `${
                      stats?.totalPatients > 0
                        ? Math.min(
                            ((stats?.totalAssessments ?? 0) /
                              stats?.totalPatients) *
                              100,
                            100
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] p-6  border border-gray-100">
          <div className="flex items-center justify-between mb-3 ">
            <h3 className="text-lg font-semibold text-gray-900 ">
              Recent Clinic Activities
            </h3>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          <div className="  grid grid-cols-2 gap-4">
            {recentActivities?.length > 0 ? (
              recentActivities?.slice(0, 4).map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100"
                >
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      {activity?.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {activity?.timestamp}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No recent activities</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};

export default SuperAdminDashboard;
