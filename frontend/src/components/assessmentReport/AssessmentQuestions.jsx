import { AlertTriangle, ChevronDown, ChevronUp, CheckCircle } from "lucide-react";

const AssessmentQuestions = ({ isOpen, setIsOpen, questionsData, loading }) => {
  // Calculate metrics from questionResponses
  const totalQuestions = questionsData?.totalQuestions || 0;
  const answered = questionsData?.answered || 0;
  const notRecorded = questionsData?.notRecorded || 0;
  
  // Get the array of questions
  const questions = questionsData?.questionResponses || [];

  // Helper to determine if a question is answered
  const isAnswered = (question) => {
    return question.response && question.response !== 'No response recorded';
  };
  
  // Helper to determine score color
  const getScoreColor = (score) => {
    if (score === 'No score' || score === undefined) {
      return 'bg-red-100 text-red-700 border-red-300';
    }
    // If score is a number, determine color based on value
    const numScore = typeof score === 'number' ? score : parseInt(score);
    if (numScore === 0) {
      return 'bg-green-100 text-green-700 border-green-300';
    } else if (numScore > 0 && numScore <= 2) {
      return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    } else {
      return 'bg-red-100 text-red-700 border-red-300';
    }
  };
  
  // Helper to get appropriate icon based on score
  const getScoreIcon = (score) => {
    if (score === 'No score' || score === undefined) {
      return <AlertTriangle className="w-6 h-6 mr-3 flex-shrink-0" />;
    }
    const numScore = typeof score === 'number' ? score : parseInt(score);
    if (numScore === 0) {
      return <CheckCircle className="w-6 h-6 mr-3 flex-shrink-0" />;
    }
    return <AlertTriangle className="w-6 h-6 mr-3 flex-shrink-0" />;
  };

  const renderQuestionCard = (question) => {
    const scoreColorClass = getScoreColor(question.score);
    const scoreIcon = getScoreIcon(question.score);
    const questionIsAnswered = isAnswered(question);
    
    return (
      <div
        key={question.number}
        className="p-6 bg-white mt-8 rounded-lg shadow-sm border border-gray-200"
      >
        <div className="flex justify-between items-center mb-4 p-3  border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <span className="bg-gray-100 text-gray-800 text-xs font-semibold px-3 py-3 rounded-full">
              {question.number}
            </span>
            <span className="text-md text-gray-600 hidden sm:inline-block">
              {question.code}
            </span>
          </div>

          <div className={`${scoreColorClass} text-md font-medium px-4 py-2 rounded-md flex items-center border`}>
            {scoreIcon}
            {question.score}
          </div>
        </div>

        <div className="mt-6">
          <p className="text-sm font-semibold uppercase text-gray-800 tracking-wider">
            QUESTION
          </p>
          <div className="bg-gray-100 border border-gray-500 text-gray-900 p-4 rounded-lg mt-2">
            <p className="text-lg font-medium">{question.questionText}</p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm font-semibold uppercase text-gray-800 tracking-wider mb-2">
            RESPONSE
          </p>
          <div className={`${questionIsAnswered ? 'bg-gray-50 border-gray-300 text-gray-700' : 'bg-red-50 border-red-300 text-red-700'} border p-4 rounded-lg flex items-center`}>
            {questionIsAnswered ? 
              <CheckCircle className="w-6 h-6 mr-3 flex-shrink-0" /> :
              <AlertTriangle className="w-6 h-6 mr-3 flex-shrink-0" />
            }
            <p className="text-sm font-medium">{question.response}</p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm font-semibold uppercase text-gray-800 tracking-wider mb-2">
            INTERPRETATION
          </p>
          <div className={`${question.interpretation && question.interpretation !== 'No interpretation recorded' ? 'bg-gray-50 border-gray-300 text-gray-700' : 'bg-red-50 border-red-300 text-red-700'} border p-4 rounded-lg flex items-center`}>
            {question.interpretation && question.interpretation !== 'No interpretation recorded' ?
              <CheckCircle className="w-6 h-6 mr-3 flex-shrink-0" /> :
              <AlertTriangle className="w-6 h-6 mr-3 flex-shrink-0" />
            }
            <p className="text-sm font-medium">{question.interpretation}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderMetricCard = (label, value, colorClass) => (
    <div key={label} className="flex flex-col items-center w-full sm:w-1/3 p-4">
      <p className={`text-4xl font-bold ${colorClass}`}>{value}</p>
      <p className="text-sm font-semibold uppercase text-gray-500 mt-1 tracking-wider">
        {label}
      </p>
    </div>
  );


  return (
    <div className="  ">
      <div
        className=" p-4 bg-gray-100 border-l-4 border-r-4 border-[#4b5563] cursor-pointer rounded-md flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          Assessment Questions
        </h2>
        {isOpen ? (
          <ChevronUp className="w-7 h-7 text-gray-600" />
        ) : (
          <ChevronDown className="w-7 h-7 text-gray-600" />
        )}
      </div>

      {isOpen && (
        <>
          <div className="bg-white  w-full  my-10">
            <div className="flex flex-col sm:flex-row justify-around p-6 sm:p-4 bg-white border rounded-md border-gray-200 shadow-sm">
              {renderMetricCard(
                "Total Questions",
                totalQuestions,
                "text-gray-700"
              )}
              <div className="hidden sm:block border-r border-gray-200 h-16 self-center"></div>{" "}
              {renderMetricCard("Answered", answered, "text-green-600")}
              <div className="hidden sm:block border-r border-gray-200 h-16 self-center"></div>{" "}
              {renderMetricCard("Not Recorded", notRecorded, "text-red-600")}
            </div>
          </div>
          {loading ? (
            <div className="p-6 bg-white mt-8 rounded-lg shadow-sm border border-gray-200 text-center">
              <p className="text-gray-600">Loading questions...</p>
            </div>
          ) : questions.length > 0 ? (
            questions.map(renderQuestionCard)
          ) : (
            <div className="p-6 bg-white mt-8 rounded-lg shadow-sm border border-gray-200 text-center">
              <p className="text-gray-600">No questions available for this assessment.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AssessmentQuestions;

