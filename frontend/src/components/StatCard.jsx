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
      bg-white rounded-xl shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)]  p-6 outline-1 outline-offset-[-1px] outline-white/40  border border-gray-200
      ${className}
    `}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          
          <div className="flex items-baseline space-x-2">
            <p className="text-3xl font-bold text-gray-900 ">{value}</p>
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

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {subtitle}
          </p>
        </div>
        {icon && (
          <div className="flex-shrink-0 ml-4">
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                ColorMap[color] || ColorMap?.blue
              }`}
            >
              {icon}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
