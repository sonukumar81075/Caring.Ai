import { useState, useEffect } from "react";
import React from "react";
import {
  Building2,
  Users,
  UserCheck,
  Calendar,
  FileText,
  TrendingUp,
  Activity,
  BarChart3,
  Download,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { ClinicReportsOverview } from "../components/ClinicReports";

// Clinic Report Card Component with Hover Effects
const ClinicReportCard = ({ title, value, subtitle, icon, iconBgColor, iconColor }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="flex justify-between items-center rounded-xl p-5 outline-1 outline-offset-[-1px] outline-white/40 border border-gray-200 transition-all duration-300 ease-in-out cursor-pointer"
      style={{
        backgroundColor: isHovered ? "#334155" : "#ffffff",
        transform: isHovered ? "translateY(-4px) scale(1.02)" : "translateY(0) scale(1)",
        boxShadow: isHovered 
          ? "0px 8px 30px 0px rgba(0,0,0,0.12)" 
          : "0px 4px 20px 0px rgba(0,0,0,0.05)",
        transition: "background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.1s ease-in-out, box-shadow 0.3s ease-in-out",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div>
        <p 
          className="text-sm text-gray-500"
          style={{ 
            color: isHovered ? "#ffffff" : "#6b7280",
            transition: "color 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
          }}
        >
          {title}
        </p>
        <h3 
          className="text-3xl font-bold mt-1"
          style={{ 
            color: isHovered ? "#ffffff" : "#111827",
            transition: "color 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
          }}
        >
          {value}
        </h3>
        <p 
          className="text-sm text-gray-600 mt-1"
          style={{ 
            color: isHovered ? "#ffffff" : "#4b5563",
            transition: "color 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
          }}
        >
          {subtitle}
        </p>
      </div>
      <div
        className={`p-3 rounded-xl transition-all duration-300 ${
          isHovered ? "bg-white/20" : iconBgColor
        }`}
      >
        {isHovered
          ? React.cloneElement(icon, {
              ...icon.props,
              className: `${icon.props.className || ""} text-white`,
              style: { 
                ...icon.props.style,
                transition: "color 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
              },
            })
          : React.cloneElement(icon, {
              ...icon.props,
              className: `${icon.props.className || ""} ${iconColor}`,
              style: { 
                ...icon.props.style,
                transition: "color 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
              },
            })}
      </div>
    </div>
  );
};

const ClinicReports = () => {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedClinic, setSelectedClinic] = useState(null);
  const [dateFilter, setDateFilter] = useState({
    startDate: "",
    endDate: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchClinicReports();
  }, [dateFilter]);

  const fetchClinicReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (dateFilter.startDate)
        params.append("startDate", dateFilter.startDate);
      if (dateFilter.endDate) params.append("endDate", dateFilter.endDate);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/superadmin/clinic-reports?${params}`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setReports(data.data);
      } else {
        console.error("Failed to fetch clinic reports");
      }
    } catch (error) {
      console.error("Error fetching clinic reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilterChange = (field, value) => {
    setDateFilter((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const clearFilters = () => {
    setDateFilter({
      startDate: "",
      endDate: "",
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "approved":
        return <CheckCircle className="w-4 h-4 text-[#BAA377]" />;
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#BAA377] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading clinic reports...</p>
        </div>
      </div>
    );
  }

  if (!reports) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load clinic reports</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-6">
      {/* Header */}

      <ClinicReportsOverview
        fetchClinicReports={fetchClinicReports}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
      />
      {/* 
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clinic Reports</h1>
          <p className="text-gray-600">
            Comprehensive analytics and reports for all clinics
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
          <button
            onClick={fetchClinicReports}
            className="flex items-center gap-2 px-4 py-2 bg-[#475569] text-white rounded-lg hover:bg-[#334155] transition-colors"
          >
            <Activity className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div> */}

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-xl shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)]   outline-1 outline-offset-[-1px] outline-white/40 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Date Filters
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={dateFilter?.startDate}
                onChange={(e) =>
                  handleDateFilterChange("startDate", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none  "
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={dateFilter?.endDate}
                onChange={(e) =>
                  handleDateFilterChange("endDate", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none "
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={clearFilters}
              className="px-4 py-2 rounded-lg transition-colors"
              style={{
                color: "#ffffff",
                border: "1px solid #BAA377",
                backgroundColor: "#BAA377",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#A8956A";
                e.currentTarget.style.color = "#ffffff";
                e.currentTarget.style.borderColor = "#A8956A";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#BAA377";
                e.currentTarget.style.color = "#ffffff";
                e.currentTarget.style.borderColor = "#BAA377";
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Total Clinics */}
        <ClinicReportCard
          title="Total Clinics"
          value={reports?.systemTotals?.totalClinics}
          subtitle={`${reports?.systemTotals?.activeClinics} Active`}
          icon={<Building2 className="w-6 h-6" />}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
        />

        {/* Total Patients */}
        <ClinicReportCard
          title="Total Patients"
          value={reports?.systemTotals?.totalPatients}
          subtitle="Registered patients"
          icon={<Users className="w-6 h-6" />}
          iconBgColor="bg-green-100"
          iconColor="text-green-600"
        />

        {/* Total Doctors */}
        <ClinicReportCard
          title="Total Doctors"
          value={reports?.systemTotals?.totalDoctors}
          subtitle="Active doctors"
          icon={<UserCheck className="w-6 h-6" />}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
        />

        {/* Total Assessments */}
        <ClinicReportCard
          title="Total Assessments"
          value={reports?.systemTotals?.totalAssessments}
          subtitle="Completed & pending"
          icon={<FileText className="w-6 h-6" />}
          iconBgColor="bg-orange-100"
          iconColor="text-orange-600"
        />
      </div>

      {/* Clinic Reports Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 w-full ">
        {reports?.clinicReports?.map((clinicReport) => (
          <div
            key={clinicReport?.clinic?._id}
            className="bg-white rounded-xl shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] border border-gray-200 p-6 transition-shadow"
          >
            {/* Clinic Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {clinicReport?.clinic?.organizationName ||
                      clinicReport?.clinic?.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {clinicReport?.clinic?.email}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        clinicReport?.clinic?.isActive
                          ? "text-green-600 bg-green-100"
                          : "text-red-600 bg-red-100"
                      }`}
                    >
                      {clinicReport?.clinic?.isActive ? "Active" : "Inactive"}
                    </span>
                    {clinicReport?.clinic?.isVerified && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium text-blue-600 bg-blue-100">
                        Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() =>
                  setSelectedClinic(
                    selectedClinic === clinicReport?.clinic?._id
                      ? null
                      : clinicReport?.clinic?._id
                  )
                }
                className="flex items-center gap-1 px-3 py-1 text-sm text-[#475569] border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                {selectedClinic === clinicReport?.clinic?._id ? "Hide" : "View"}
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-900">
                  {clinicReport?.stats?.totalAssessments}
                </div>
                <div className="text-xs text-gray-600">Assessments</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-lg font-bold text-gray-900">
                  {clinicReport?.stats?.completionRate}%
                </div>
                <div className="text-xs text-gray-600">Completion Rate</div>
              </div>
            </div>

            {/* Assessment Status Breakdown */}
            <div className="space-y-2 mb-4">
              <h4 className="text-sm font-medium text-gray-900">
                Assessment Status
              </h4>
              <div className="grid xl:grid-cols-2 sm:grid-cols-2 grid-cols-1 gap-2">
                {Object.entries({
                  completed: clinicReport?.stats?.completedAssessments,
                  pending: clinicReport?.stats?.pendingAssessments,
                  approved: clinicReport?.stats?.approvedAssessments,
                  cancelled: clinicReport?.stats?.cancelledAssessments,
                }).map(([status, count]) => (
                  <div
                    key={status}
                    className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    {getStatusIcon(status)}
                    <span className="text-sm text-gray-600 capitalize">
                      {status}
                    </span>
                    <span className="text-sm font-medium text-gray-900 ml-auto">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Expanded Details */}
            {selectedClinic === clinicReport?.clinic?._id && (
              <div className="border-t border-gray-200 pt-4 space-y-4">
                {/* Detailed Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">
                      {clinicReport?.stats?.totalPatients}
                    </div>
                    <div className="text-xs text-blue-600">Patients</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">
                      {clinicReport?.stats?.totalDoctors}
                    </div>
                    <div className="text-xs text-green-600">Doctors</div>
                  </div>
                </div>

                {/* Assessment Types */}
                {Object.keys(clinicReport?.assessmentTypes)?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Assessment Types
                    </h4>
                    <div className="gap-6 grid xl:grid-cols-2 lg:grid-cols-2 sm:grid-cols-2 grid-cols-1">
                      {Object.entries(clinicReport?.assessmentTypes).map(
                        ([type, count]) => (
                          <div
                            key={type}
                            className="flex justify-between items-center p-2 bg-gray-50 rounded-lg border border-gray-200"
                          >
                            <span className="text-sm text-gray-600">
                              {type}
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              {count}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {/* Monthly Trends */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Monthly Trends (Last 6 Months)
                  </h4>
                  <div className="gap-6 grid xl:grid-cols-4 lg:grid-cols-2 sm:grid-cols-2 grid-cols-1">
                    {clinicReport?.monthlyTrends?.map((trend, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-2 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <span className="text-sm text-gray-600">
                          {trend?.month}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {trend?.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Activities */}
                {clinicReport?.recentActivities?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Recent Activities
                    </h4>
                    <div className=" grid xl:grid-cols-2 lg:grid-cols-2 sm:grid-cols-2 grid-cols-1 gap-6">
                      {clinicReport?.recentActivities
                        ?.slice(0, 3)
                        .map((activity, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-2 p-3 border border-gray-200 bg-gray-50 rounded-lg"
                          >
                            <div className="w-2 h-2 bg-[#BAA377] rounded-full mt-2"></div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">
                                {activity?.description}
                              </p>
                              <p className="text-xs text-gray-500">
                                {activity?.timestamp}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Organization Details */}
                {clinicReport?.clinic?.organization && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      Organization Details
                    </h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>
                        <strong>Contact:</strong>{" "}
                        {clinicReport?.clinic?.organization?.contactPersonName}
                      </p>
                      <p>
                        <strong>Phone:</strong>{" "}
                        {clinicReport?.clinic?.organization?.phoneNumber}
                      </p>
                      <p>
                        <strong>Address:</strong>{" "}
                        {clinicReport?.clinic?.organization?.address}
                      </p>
                      <p>
                        <strong>Contract Status:</strong>
                        <span
                          className={`ml-1 px-2 py-1 rounded-full text-xs ${
                            clinicReport?.clinic?.organization
                              ?.contractStatus === "Active"
                              ? "text-green-600 bg-green-100"
                              : "text-red-600 bg-red-100"
                          }`}
                        >
                          {clinicReport?.clinic?.organization?.contractStatus}
                        </span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State */}
      {reports.clinicReports.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Clinics Found
          </h3>
          <p className="text-gray-600">
            No clinic data available for the selected date range.
          </p>
        </div>
      )}
    </div>
  );
};

export default ClinicReports;
