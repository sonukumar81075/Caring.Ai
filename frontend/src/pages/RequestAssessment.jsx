import CognitiveAssessmentdetails from "../components/requestAssessment/CognitiveAssessmentdetails";
import MultiStepForm from "../components/requestAssessment/MultiStepForm";
import { RequestNewAssessment } from "../DynamicData.js";

const RequestAssessment = () => {
  return (
    <div className="space-y-6 mt-6">
      <CognitiveAssessmentdetails NewAssessment={RequestNewAssessment} />
      <MultiStepForm />
    </div>
  );
};

export default RequestAssessment;
