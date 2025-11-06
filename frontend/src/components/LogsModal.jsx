export const LogsModal = ({ isVisible, logs, onClose }) => {
  if (!isVisible) return null;

  const logEntries = logs
    .split("|")
    .map((log) => log?.trim())
    .filter((log) => log?.length > 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col transform transition-all duration-300 scale-100 opacity-100" // Added max-w-3xl for wider modal like the image
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-color">
              Logs and Outcomes Details
            </h2>
            <p className="text-sm text-gray-500">
              Full details for Logs and Outcomes Details
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-color hover:text-color transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>

        <div className="p-5 overflow-y-auto text-sm flex-grow">
          <div className="space-y-3 font-mono">
            {logEntries?.map((entry, index) => {
              const parts = entry.match(/^\[(.*?)\] (.*)/);
              const timestamp = parts ? parts[1] : null;
              const message = parts ? parts[2] : entry;

              return (
                <div
                  key={index}
                  className="flex flex-col md:flex-row md:items-baseline text-color"
                >
                  {timestamp && (
                    <span className="text-xs text-color min-w-[170px] mr-4 block flex-shrink-0">
                      [{timestamp}]
                    </span>
                  )}
                  <p className="whitespace-pre-wrap flex-grow text-sm">
                    {message}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-8 py-2.5 text-sm font-medium text-white rounded-md cursor-pointer transition-colors shadow-md"
            style={{
              backgroundColor: "#BAA377",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#A8956A";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#BAA377";
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
