import React from "react";

export const AuditLogsCards = ({ title, value }) => {
  return (
    <div className="bg-white rounded-xl shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] p-6 border border-gray-200 outline-1 outline-offset-[-1px] outline-white/40 ">
      <p className="text-gray-500 mb-2 line-clamp-1">{title}</p>
      <h2
        className={` ${
          title === "Top Action"
            ? "text-md"
            : title === "Top Record Type"
            ? "text-md"
            : "text-lg"
        }  font-semibold text-gray-700`}
      >
        {value}
      </h2>
    </div>
  );
};
