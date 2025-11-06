import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AssessmentInformation from "../components/assessmentReport/AssessmentInformation";
import AssessmentQuestions from "../components/assessmentReport/AssessmentQuestions";
import PostCallAnalysis from "../components/assessmentReport/PostCallAnalysis";
import ConversationTranscript from "../components/assessmentReport/ConversationTranscript";
import { Maximize2, Minimize2 } from "lucide-react";
import requestAssessmentService from "../services/requestAssessmentService";


const CognitiveAssessmentReport = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isPostOpen, setIsPostOpen] = useState(true);
  const [assessmentData, setAssessmentData] = useState(null);
  const [questionsData, setQuestionsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { id } = useParams();

  // Fetch assessment data by ID
  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchAssessmentData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Decode the base64 ID
        const normalized = id.replace(/-/g, "+").replace(/_/g, "/");
        const padded = normalized + "===".slice((normalized.length + 3) % 4);
        const decodedId = atob(padded);
        
        console.log("Decoded assessment id:", decodedId);
        
        // Fetch assessment data
        const response = await requestAssessmentService.getRequestAssessmentById(decodedId);
        
        if (response.success) {
          setAssessmentData(response.data);
          
          // Fetch questions data if call ID is available
          const callId = response.data?.retellBatchCallData?.batch_call_id;
          if (callId) {
            fetchAssessmentQuestions(callId);
          }
        } else {
          setError(response.message || 'Failed to fetch assessment data');
        }
      } catch (e) {
        console.error("Failed to fetch assessment data:", e);
        setError(e.message || 'Failed to fetch assessment data');
      } finally {
        setLoading(false);
      }
    };

    const fetchAssessmentQuestions = async (callId) => {
      try {
        setQuestionsLoading(true);
        const response = await requestAssessmentService.getAssessmentQuestions(callId);
        
        if (response.success) {
          setQuestionsData(response.data);
        }
      } catch (e) {
        console.error("Failed to fetch assessment questions:", e);
        // Don't set error state for questions, just log it
      } finally {
        setQuestionsLoading(false);
      }
    };

    fetchAssessmentData();
  }, [id]);

  // Ensure sections are expanded when printing (button or browser menu)
  useEffect(() => {
    const expandAll = () => {
      setIsOpen(true);
      setIsPostOpen(true);
    };

    const handleBeforePrint = () => {
      expandAll();
    };

    // beforeprint event
    window.addEventListener('beforeprint', handleBeforePrint);

    // Some browsers fire matchMedia change for print
    const mediaQueryList = window.matchMedia('print');
    const handleMediaChange = (e) => {
      if (e.matches) expandAll();
    };
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', handleMediaChange);
    } else if (mediaQueryList.addListener) {
      mediaQueryList.addListener(handleMediaChange);
    }

    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      if (mediaQueryList.removeEventListener) {
        mediaQueryList.removeEventListener('change', handleMediaChange);
      } else if (mediaQueryList.removeListener) {
        mediaQueryList.removeListener(handleMediaChange);
      }
    };
  }, []);
  return (
    <>
      <div className="   bg-gray-50 py-4 sm:py-8 lg:py-12">
        <div className="flex justify-between items-center py-4 border-b border-gray-200">
          <div className="flex items-center sm:block hidden">
            <span className="text-2xl font-bold text-color mr-1">caring</span>
            <span className="text-2xl font-bold text-gray-900">.ai</span>
          </div>
          <h1 className="sm:text-2xl text-lg font-semibold text-gray-900">
            Cognitive Assessment Report
          </h1>
          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={() => {
                // Expand all sections, then trigger print
                setIsOpen(true);
                setIsPostOpen(true);
                // Ensure state applies before print dialog opens
                setTimeout(() => window.print(), 50);
              }}
              className="px-4 py-2 bg-gray-700 text-white rounded-md border border-gray-300 hover:bg-gray-800 transition"
            >
              Print Report
            </button>
          </div>
        </div>
        
        {/* Display error message if any */}
        {error && (
          <div className="mt-8 mx-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p className="font-semibold">Error</p>
            <p>{error}</p>
          </div>
        )}
        
        <AssessmentInformation assessmentData={assessmentData} loading={loading} />
        
        <div className="sm:flex grid grid-cols-2 sm:mt-8 mt-4 gap-3 print:hidden">
          {/* Collapse All Button */}
          <button
            onClick={() => {
              setIsOpen(false);
              setIsPostOpen(false);
            }}
            className="flex items-center gap-2 px-4 py-3 bg-color text-white rounded-md border cursor-pointer border-gray-200 bg-hover transition"
          >
            <Minimize2 className="h-4 w-4" />
            <span className="text-sm font-medium">Collapse All</span>
          </button>

          {/* Expand All Button */}
          <button
            onClick={() => {
              setIsOpen(true);
              setIsPostOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-3 bg-color text-white cursor-pointer rounded-md border border-gray-300 bg-hover transition"
          >
            <Maximize2 className="h-4 w-4" />
            <span className="text-sm font-medium">Expand All</span>
          </button>
        </div>
      </div>
      <AssessmentQuestions 
        isOpen={isOpen} 
        setIsOpen={setIsOpen} 
        questionsData={questionsData}
        loading={questionsLoading}
      />
      <PostCallAnalysis 
        isPostOpen={isPostOpen} 
        setIsPostOpen={setIsPostOpen}
        questionsData={questionsData}
        loading={questionsLoading}
      />
      <ConversationTranscript 
        questionsData={questionsData}
        loading={questionsLoading}
      />
    </>
  );
};

export default CognitiveAssessmentReport;
