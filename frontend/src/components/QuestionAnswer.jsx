import React from 'react';

const QuestionAnswer = ({ questionCode, questionString, response, score, interpretation ,index}) => {
    return (
        <>

            {/* Cognitive Assessment Results Section */}
            <div className="w-full mx-auto bg-gray-50  rounded-br-xl rounded-bl-xl overflow-hidden">
                <div className="p-6 sm:p-8 bg-gray-50">
                    <div className="space-y-6">
                        {/* {questionData.map((item, index) => ( */}
                            <div
                                // key={index}
                                className="bg-white rounded-xl border border-gray-200 shadow-[0px_2px_8px_0px_rgba(0,0,0,0.08)] overflow-hidden transition-all hover:shadow-[0px_4px_12px_0px_rgba(0,0,0,0.12)]"
                            >
                                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-[#334155] text-white flex items-center justify-center font-bold text-sm shadow-md">
                                                {index}
                                            </div>
                                            {questionCode && (
                                                <span className="bg-white text-gray-600 text-xs font-semibold px-3 py-1.5 rounded-full border border-gray-200">
                                                    {questionCode}
                                                </span>
                                            )}
                                        </div>
                                        <div
                                            className={`px-4 py-2 rounded-lg font-bold text-sm shadow-sm  bg-white text-gray-700 border border-gray-300`}
                                        >
                                            Score: {score}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 space-y-4">
                                    <div>
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 mt-1">
                                                <svg
                                                    className="w-5 h-5 text-[#334155]"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-semibold uppercase text-gray-500 tracking-wider mb-2">
                                                    Question
                                                </p>
                                                <p className="text-base font-semibold text-gray-900 leading-relaxed">
                                                    {questionString}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t border-gray-100">
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 mt-1">
                                                <svg
                                                    className={`w-5 h-5 text-gray-600 `}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    />
                                                </svg>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-semibold uppercase text-gray-500 tracking-wider mb-2">
                                                    Response
                                                </p>
                                                <div
                                                    className={`p-4 rounded-lg border  ${score === 1
                                                        ? "bg-gray-50 border-gray-200 text-green-900"
                                                        : score === 0
                                                            ? "bg-gray-50 border-gray-200 text-gray-900"
                                                            : "bg-gray-50 border-gray-200 text-gray-700"
                                                        }`}
                                                >
                                                    <p className="text-sm font-medium leading-relaxed">
                                                        {response || "No response recorded"}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {interpretation && interpretation !== "N/A" && (
                                        <div className="pt-2 border-t border-gray-100">
                                            <div className="flex items-start gap-3">
                                                <div className="flex-shrink-0 mt-1">
                                                    <svg
                                                        className="w-5 h-5 text-blue-600"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                        />
                                                    </svg>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs font-semibold uppercase text-gray-500 tracking-wider mb-2">
                                                        Interpretation
                                                    </p>
                                                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                                                        <p className="text-sm text-blue-900 leading-relaxed font-medium">
                                                            {interpretation}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        {/* ))} */}
                    </div>
                </div>
            </div>

        </>
    );
};

export default QuestionAnswer;