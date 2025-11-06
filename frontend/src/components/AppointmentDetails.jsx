import React from "react";

const AppointmentDetails = ({ initialValues }) => { 
  return (
    <div className="sm:p-4 mb-6 sm:mb-0">
      <div className="bg-gray-50 border border-gray-200 rounded-lg   sm:p-6 p-4">
        <div className="flex items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-700">
            Appointment Details
          </h2>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Patient Info */}
          <div>
            <h3 className="font-[600] text-gray-700 mb-4">
              Patient Information
            </h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p className="flex justify-between text-gray-600 font-[600]">
                <span className="font-[400] text-gray-600">Name:</span>{" "}
                {initialValues?.patientName}
              </p>
              <p className="flex justify-between text-gray-600 font-[600]">
                <span className="font-[400] text-gray-600">Patient ID:</span>{" "}
                {initialValues?.patientId}
              </p>
              <p className="flex justify-between text-gray-600 font-[600]">
                <span className="font-[400] text-gray-600">Phone Number:</span>{" "}
                {initialValues?.phoneNumber}
              </p>
              <p className="flex justify-between text-gray-600 font-[600]">
                <span className="font-[400] text-gray-600">Age:</span>{" "}
                {initialValues?.age}
              </p>
              <p className="flex justify-between text-gray-600 font-[600]">
                <span className="font-[400] text-gray-600">Has Caregiver:</span>{" "}
                {initialValues?.hasCaregiver}
              </p>
              <p className="text-gray-600 font-[600] flex justify-between gap-12">
                <span className="font-[400] text-gray-600">Notes:</span>
                <span className=" text-end">
                  {initialValues?.communicationNotes}
                </span>
              </p>
            </div>
          </div>

          {/* Assessment Info */}
          <div>
            <h3 className="font-[600] text-gray-700 mb-4">
              Assessment Details
            </h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p className="flex justify-between text-gray-600 font-[600]">
                <span className="font-[400] text-gray-600">
                  Assessment Type:
                </span>{" "}
                {initialValues?.assessmentType}
              </p>
              <p className="flex justify-between text-gray-600 font-[600]">
                <span className="font-[400] text-gray-600">Physician:</span>{" "}
                {initialValues?.assigningPhysician}
              </p>
              <p className="flex justify-between text-gray-600 font-[600]">
                <span className="font-[400] text-gray-600">Date:</span>{" "}
                {initialValues?.assessmentDate}
              </p>
              <p className="flex justify-between text-gray-600 font-[600]">
                <span className="font-[400] text-gray-600">Time:</span>{" "}
                {`${initialValues?.timeHour}:${initialValues?.timeMinute} ${initialValues?.timeAmPm}`}
              </p>
              <p className="flex justify-between text-gray-600 font-[600]">
                <span className="font-[400] text-gray-600">Timezone:</span>{" "}
                {initialValues?.timezone}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetails;
