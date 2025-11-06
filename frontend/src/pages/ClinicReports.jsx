import { useState, useEffect } from "react";
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
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#475569] mx-auto mb-4"></div>
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
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Total Clinics */}
        <div className="flex justify-between items-center bg-white rounded-xl shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)]  p-5 outline-1 outline-offset-[-1px] outline-white/40  border border-gray-200">
          <div>
            <p className="text-sm text-gray-500">Total Clinics</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">
              {reports?.systemTotals?.totalClinics}
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {reports?.systemTotals?.activeClinics} Active
            </p>
          </div>
          <div className="bg-blue-100 p-3 rounded-xl">
            <Building2 className="w-6 h-6 text-blue-600" />
          </div>
        </div>

        {/* Total Patients */}
        <div className="flex justify-between items-center bg-white rounded-xl shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)]  p-5 outline-1 outline-offset-[-1px] outline-white/40  border border-gray-200">
          <div>
            <p className="text-sm text-gray-500">Total Patients</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">
              {reports?.systemTotals?.totalPatients}
            </h3>
            <p className="text-sm text-gray-600 mt-1">Registered patients</p>
          </div>
          <div className="bg-green-100 p-3 rounded-xl">
            <Users className="w-6 h-6 text-green-600" />
          </div>
        </div>

        {/* Total Doctors */}
        <div className="flex justify-between items-center bg-white rounded-xl shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)]  p-5 outline-1 outline-offset-[-1px] outline-white/40  border border-gray-200">
          <div>
            <p className="text-sm text-gray-500">Total Doctors</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">
              {reports?.systemTotals?.totalDoctors}
            </h3>
            <p className="text-sm text-gray-600 mt-1">Active doctors</p>
          </div>
          <div className="bg-purple-100 p-3 rounded-xl">
            <UserCheck className="w-6 h-6 text-purple-600" />
          </div>
        </div>

        {/* Total Assessments */}
        <div className="flex justify-between items-center bg-white rounded-xl shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)]  p-5 outline-1 outline-offset-[-1px] outline-white/40  border border-gray-200">
          <div>
            <p className="text-sm text-gray-500">Total Assessments</p>
            <h3 className="text-3xl font-bold text-gray-900 mt-1">
              {reports?.systemTotals?.totalAssessments}
            </h3>
            <p className="text-sm text-gray-600 mt-1">Completed & pending</p>
          </div>
          <div className="bg-orange-100 p-3 rounded-xl">
            <FileText className="w-6 h-6 text-orange-600" />
          </div>
        </div>
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
                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
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
