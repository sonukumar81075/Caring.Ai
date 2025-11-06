import { AlertTriangle, ChevronDown, ChevronUp, CheckCircle } from "lucide-react";

const PostCallAnalysis = ({isPostOpen, setIsPostOpen, questionsData, loading}) => {
  // Get the postcallAnalysis data from questionsData
  const postcallAnalysisData = questionsData?.postcallAnalysis || [];
  
  // Helper to determine if analysis data is available
  const hasAnalysisData = (item) => {
    return item.response && item.response.trim() !== '';
  }; 

  return (
    <div className="mt-6">
      <div
        className=" p-4 bg-gray-100 border-l-4 border-r-4 border-[#4b5563] cursor-pointer rounded-md flex justify-between items-center"
        onClick={() => setIsPostOpen(!isPostOpen)}
      >
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          Post-Call Analysis
        </h2>
        {isPostOpen ? (
          <ChevronUp className="w-7 h-7 text-gray-600" />
        ) : (
          <ChevronDown className="w-7 h-7 text-gray-600" />
        )}
      </div>

      {isPostOpen && (
        <>
          {loading ? (
            <div className="p-6 bg-white mt-10 rounded-lg shadow-sm border border-gray-200 text-center">
              <p className="text-gray-600">Loading post-call analysis...</p>
            </div>
          ) : postcallAnalysisData.length > 0 ? (
            postcallAnalysisData.map((question, index) => (
              <div
                key={index}
                className="p-6 bg-white mt-10 rounded-lg shadow-sm border border-gray-200"
              >
                <div className="flex justify-between items-center mb-4 p-3 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <span className="text-md text-gray-600 hidden sm:inline-block">
                      {question?.questionText}
                    </span>
                  </div>
                </div>
                {hasAnalysisData(question) ? (
                  <div className="bg-gray-100 border border-gray-500 text-gray-900 p-4 rounded-lg mt-2">
                    <p className="text-lg font-medium">{question.response}</p>
                  </div>
                ) : (
                  <div className="mt-4">
                    <div className="bg-red-50 border border-red-300 text-red-700 p-4 rounded-lg flex items-center">
                      <AlertTriangle className="w-6 h-6 mr-3 flex-shrink-0" />
                      <p className="text-md font-medium">
                        No analysis data available
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-6 bg-white mt-10 rounded-lg shadow-sm border border-gray-200 text-center">
              <p className="text-gray-600">No post-call analysis available for this assessment.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PostCallAnalysis;
