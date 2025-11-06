const ActionCard = ({
  title,
  subtitle,
  description,
  buttonText,
  onButtonClick,
  icon,
  className = "",
}) => {
  return (
    <div
      className={`
      bg-white rounded-xl border  border-gray-200 shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)]   outline-1 outline-offset-[-1px] outline-white/40  p-6
      ${className}
    `}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900  mb-1">{title}</h3>
          <p className="text-sm text-primary-600  font-medium mb-2">
            {subtitle}
          </p>
          <p className="text-sm text-gray-600 ">{description}</p>
        </div>
        {icon && (
          <div className="flex-shrink-0 ml-4">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "#e2e8f0" }}
            >
              {icon}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end ">
        <button
          onClick={onButtonClick}
          className="sm:w-fit w-full text-white font-semibold py-2.5 px-6 rounded-lg text-sm
                 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
                 focus:ring-offset-white cursor-pointer shadow-md hover:shadow-lg hover:opacity-90 bg-brand-gradient"
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default ActionCard;
