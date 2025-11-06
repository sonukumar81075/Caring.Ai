import React from "react";

const renderInfoItem = (label, value) => (
  <div key={label} className="flex flex-col mb-4 sm:mb-0 sm:w-1/3 min-w-0">
    <p className="text-sm font-semibold uppercase text-gray-500 tracking-wider">
      {label}
    </p>
    <p
      className={`text-base font-medium mt-1 ${
        label.includes("ID") ? "text-color" : "text-gray-900"
      }`}
    >
      {value}
    </p>
  </div>
);

const AssessmentInformation = ({ assessmentData, loading }) => {
  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      });
    } catch (error) {
      return "N/A";
    }
  };

  // Helper function to format scheduled time
  const formatScheduledTime = (date, timeHour, timeMinute, timeAmPm) => {
    if (!date) return "N/A";
    try {
      const scheduleDate = new Date(date);
      const scheduleTime = scheduleDate.toLocaleDateString("en-US", {
        month: "numeric",
        day: "numeric",
        year: "numeric"
      });
      const time = `${timeHour}:${timeMinute} ${timeAmPm}`;
      return `${scheduleTime}, ${time}`;
    } catch (error) {
      return "N/A";
    }
  };

  // Build assessment info data dynamically
  const getAssessmentInfoData = () => {
    if (!assessmentData) {
      return [
        [{ label: "Patient Name", value: "Loading..." }],
        [{ label: "Assigned Doctor", value: "Loading..." }],
        [{ label: "Assessment ID", value: "Loading..." }],
      ];
    }

    // Get assigning physician name from populated data
    const doctorName = assessmentData.assigningPhysician?.name || "N/A";
    
    // Format scheduled time
    const scheduledTime = formatScheduledTime(
      assessmentData.assessmentDate,
      assessmentData.timeHour,
      assessmentData.timeMinute,
      assessmentData.timeAmPm
    );

    return [
      [
        { label: "Patient Name", value: assessmentData.patientName || "N/A" },
        { label: "Patient ID", value: assessmentData.patientId || "N/A" },
      ],
      [
        { label: "Assigned Doctor", value: doctorName },
        { label: "Assessment Type", value: assessmentData.assessmentType || "N/A" },
        { label: "Scheduled", value: scheduledTime },
      ],
      [
        { label: "Assessment ID", value: assessmentData._id || "N/A" },
        { label: "Scheduled ID", value: assessmentData._id || "N/A" },
        { label: "Call ID", value: assessmentData.retellBatchCallData?.batch_call_id || "N/A" },
      ],
    ];
  };

  const assessmentInfoData = getAssessmentInfoData();

  return (
    <div>
      {/* Assessment Information Header Bar */}
      <div className="mt-8 bg-gray-100 border-l-4 border-r-4 border-[#4b5563] rounded-md p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Assessment Information
        </h2>
      </div>
      <div className="bg-white p-6 sm:p-8 mt-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-wrap gap-y-6 sm:gap-y-12">
          {assessmentInfoData?.map((rowItems, rowIndex) => (
            <div
              key={`row-${rowIndex}`}
              className="flex flex-col sm:flex-row w-full justify-between mb-4"
            >
              {rowItems?.map((item) => renderInfoItem(item?.label, item?.value))}
              {rowIndex === 0 && (
                <div className="sm:w-1/3 hidden sm:block"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssessmentInformation;
