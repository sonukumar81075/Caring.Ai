import { useState } from "react";
import React from "react";

const StatCard = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  color = "blue", // default color
  className = "",
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const getTrendColor = (trend) => {
    switch (trend) {
      case "up":
        return "text-green-600 dark:text-green-400";
      case "down":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };
  const ColorMap = {
    blue: "bg-blue-100 border-blue-300",
    green: "bg-green-100 border-green-300",
    purple: "bg-purple-100 border-purple-300",
    orange: "bg-orange-100 border-orange-300",
    indigo: "bg-indigo-100 border-indigo-300",
    pink: "bg-pink-100 border-pink-300",
    gray: "bg-gray-100 border-gray-300",
  };
  const getTrendIcon = (trend) => {
    switch (trend) {
      case "up":
        return (
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 17l9.2-9.2M17 17V7H7"
            />
          </svg>
        );
      case "down":
        return (
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 7l-9.2 9.2M7 7v10h10"
            />
          </svg>
        );
      default:
        return null;
    }
  };
  return (
    <div
      className={`
      rounded-xl p-6 outline-1 outline-offset-[-1px] outline-white/40  border border-gray-200
      transition-all duration-300 ease-in-out cursor-pointer
      ${className}
    `}
      style={{
        backgroundColor: isHovered ? "#334155" : "#ffffff",
        transform: isHovered ? "translateY(-0px) scale(1.02)" : "translateY(0) scale(1)",
        boxShadow: isHovered
          ? "0px 8px 30px 0px rgba(0,0,0,0.12)"
          : "0px 4px 20px 0px rgba(0,0,0,0.05)",
        transition: "background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p
            className="text-sm font-medium mb-1"
            style={{
              color: isHovered ? "#ffffff" : "#4b5563",
              transition: "color 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
            }}
          >
            {title}
          </p>

          <div className="flex items-baseline space-x-2">
            <p
              className="text-3xl font-bold"
              style={{
                color: isHovered ? "#ffffff" : "#111827",
                transition: "color 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
              }}
            >
              {value}
            </p>
            {trend && trendValue && (
              <div
                className={`flex items-center space-x-1 ${getTrendColor(
                  trend
                )}`}
              >
                {getTrendIcon(trend)}
                <span className="text-sm font-medium">{trendValue}</span>
              </div>
            )}
          </div>

          <p
            className="text-sm mt-1"
            style={{
              color: isHovered ? "#ffffff" : "#6b7280",
              transition: "color 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
            }}
          >
            {subtitle}
          </p>
        </div>
        {icon && (
          <div className="flex-shrink-0 ml-4">
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center ${isHovered ? "bg-white/20 scale-110" : ColorMap[color] || ColorMap?.blue
                }`}
              style={{
                transition: "background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s ease-in-out"
              }}
            >
              {isHovered
                ? React.cloneElement(icon, {
                  ...icon.props,
                  stroke: "#ffffff",
                  style: {
                    ...icon.props.style,
                    stroke: "#ffffff",
                    transition: "stroke 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                  },
                })
                : React.cloneElement(icon, {
                  ...icon.props,
                  style: {
                    ...icon.props.style,
                    transition: "stroke 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
                  },
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
