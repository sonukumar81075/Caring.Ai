import { useState } from "react";

const CognitiveAssessmentdetails = ({ NewAssessment, customClassType }) => {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <>
      {NewAssessment?.map((item) => (
        <div
          key={item?.id}
          className={`bg-white rounded-xl mt-6 shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] outline-1 outline-offset-[-1px] outline-white/40  ${
            customClassType === "AddedCustomCss" ? "mb-0" : "sm:mb-8 mb-4"
          } ${
            customClassType === "AddedCustomCss"
              ? "border border-gray-200"
              : "border border-gray-200"
          }`}
        >
          <div
            onClick={() => toggleExpand(item?.id)}
            className="p-6 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className=" sm:block hidden  ">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="h-5 w-5 text-gray-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>

                <div>
                  <h2 className="sm:text-xl text-lg font-semibold text-gray-900">
                    {item?.title}
                  </h2>
                  <p className="text-sm text-gray-600">{item?.description}</p>
                </div>
              </div>
              <button
                onClick={() => toggleExpand(item?.id)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                aria-label={
                  expandedId === item?.id
                    ? "Collapse section"
                    : "Expand section"
                }
              >
                <svg
                  className={`h-5 w-5 transition-transform duration-200 cursor-pointer ${
                    expandedId === item?.id ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>
          </div>
          {expandedId === item?.id && (
            <div className="px-6 pb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700 mb-4">{item?.details}</p>
                {item?.steps && (
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                    {item?.steps?.map((step, index) => (
                      <li key={index}>
                        <span className="font-semibold">{step?.label}</span>{" "}
                        {step?.text}
                      </li>
                    ))}
                  </ol>
                )}

                <p className="text-sm text-gray-700 mt-4">{item?.footer}</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </>
  );
};

export default CognitiveAssessmentdetails;
