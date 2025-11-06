import React from "react";
import { useNavigate } from "react-router-dom";
import { Users, UserCheck2, Calendar, FileText } from "lucide-react";

const reportsData = [
  {
    icon: <Users className="w-5 h-5 text-blue-400" />,
    title: "Patient Reports",
    subtitle: "View analytics",
    borderColor: "border-blue-200",
    bgColor: "bg-blue-50",
    link: "/patients",
  },
  {
    icon: <UserCheck2 className="w-5 h-5 text-green-400" />,
    title: "Doctor Reports",
    subtitle: "View analytics",
    borderColor: "border-green-200",
    bgColor: "bg-green-50",
    link: "/doctors",
  },
  {
    icon: <Calendar className="w-5 h-5 text-purple-400" />,
    title: "Booking Reports",
    subtitle: "View analytics",
    borderColor: "border-purple-200",
    bgColor: "bg-purple-50",
    link: "/booking-queue",
  },
  {
    icon: <FileText className="w-5 h-5 text-orange-400" />,
    title: "Assessment Reports",
    subtitle: "View analytics",
    borderColor: "border-orange-200",
    bgColor: "bg-orange-50",
    link: "/assessment-results",
  },
];

export default function ReportsGrid() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {reportsData?.map((report, index) => (
        <button
          key={index}
          onClick={() => navigate(report?.link)} // 👈 Redirect on click
          className={`flex items-center gap-3 p-6 border rounded-xl shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] cursor-pointer  ${report?.borderColor} ${report?.bgColor}`}
        >
          {report?.icon}
          <div className="text-left">
            <p className="font-medium text-gray-900">{report?.title}</p>
            <p className="text-xs text-gray-500">{report?.subtitle}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
