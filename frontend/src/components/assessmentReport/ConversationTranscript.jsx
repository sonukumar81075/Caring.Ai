import React from "react";

const ConversationTranscript = ({ questionsData, loading }) => {
  // Get the conversationTranscript data from questionsData
  const messages = questionsData?.conversationTranscript || [];
  return (
    <div className="w-full bg-white">
      <div className="mt-8 bg-gray-100 border-l-4 border-r-4 border-[#4b5563] rounded-md p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Conversation Transcript
        </h2>
      </div>
      <div className="w-full mt-8  border border-gray-300   rounded-lg shadow-md  mx-auto h-[400px] overflow-y-auto p-4 space-y-6 print:h-auto print:overflow-visible print:shadow-none">
        <div className="bg-white w-full mx-auto p-4 ">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading conversation transcript...</p>
            </div>
          ) : messages.length > 0 ? (
            messages.map((msg, index) => (
              <div key={index} className="space-y-2">
                {/* Role */}
                <p className="text-gray-600 mt-3 font-semibold uppercase text-sm">
                  {msg?.role}
                </p>

                {/* Message Box */}
                {msg?.role === "AGENT" ? (
                  <div className="bg-gray-100 text-gray-700 p-4 rounded-lg shadow-sm border border-gray-200">
                    {msg?.text}
                  </div>
                ) : (
                  <div className="bg-color text-white px-4 py-3 rounded-lg shadow-sm  w-full">
                    {msg?.text}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">No conversation transcript available for this assessment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationTranscript;
