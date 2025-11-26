import React, { useState } from "react";

export const AuditLogsCards = ({ title, value }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="rounded-xl p-6 border border-gray-200 outline-1 outline-offset-[-1px] outline-white/40 transition-all duration-300 ease-in-out cursor-pointer"
      style={{
        backgroundColor: isHovered ? "#334155" : "#ffffff",
        transform: isHovered ? "translateY(-0px) scale(1.02)" : "translateY(0) ",
        boxShadow: isHovered 
          ? "0px 8px 30px 0px rgba(0,0,0,0.12)" 
          : "0px 4px 20px 0px rgba(0,0,0,0.05)",
        transition: "background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <p 
        className="mb-2 line-clamp-1"
        style={{ 
          color: isHovered ? "#ffffff" : "#6b7280",
          transition: "color 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
        }}
      >
        {title}
      </p>
      <h2
        className={`${
          title === "Top Action"
            ? "text-md"
            : title === "Top Record Type"
            ? "text-md"
            : "text-lg"
        } font-semibold`}
        style={{ 
          color: isHovered ? "#ffffff" : "#374151",
          transition: "color 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
        }}
      >
        {value}
      </h2>
    </div>
  );
};
