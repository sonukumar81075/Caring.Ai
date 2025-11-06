import { CheckCircle } from "lucide-react";
import React from "react";

const AuthBrandingFeatures = () => {
  return (
    <div className="auth_right_color text-white flex  flex-col justify-center  p-12 lg:p-16">
      <h1 className="text-2xl font-semibold mb-2 tracking-wide">Caring AI</h1>
      <h2 className="text-lg font-normal border-b border-white/20 w-fit pb-4 mb-6">
        Cognitive Assessment Platform
      </h2>

      <p className="mb-8 text-md font-light max-w-sm w-full">
        Technology That Meets People Where They Are—and Raises the Standard of
        Cognitive Care
      </p>

      <ul className="space-y-6">
        {[
          {
            title: "Conversational AI that patients trust",
            desc: "Phone-based assessments increase completion rates and reduce tech barriers—especially for seniors with cognitive decline.",
          },
          {
            title: "Clinically validated, protocol-driven tools",
            desc: "Built on cognitive screening, PHQ-9, ADLs, and other standard assessments—delivered with perfect consistency.",
          },
          {
            title: "Smart automation for overwhelmed care teams",
            desc: "From assessment prompts to care plan generation, Caring AI lightens the administrative load for your team.",
          },
          {
            title: "Speech-based AI insights",
            desc: "We use natural language processing (NLP) to extract cognitive markers from speech—adding diagnostic support beyond scores.",
          },
          {
            title: "Compliance and billing readiness",
            desc: "All outputs align with CPT, G0X0F, and BHI documentation and reimbursement standards.",
          },
        ].map((item, index) => (
          <li key={index} className="flex items-start">
            <CheckCircle
              size={20}
              className="text-white mt-1 flex-shrink-0 mr-3"
            />
            <div className="leading-relaxed max-w-sm w-full">
              <span className="font-semibold">{item.title}</span>
              <span className="block text-sm text-gray-300 font-light mt-0.5">
                {item.desc}
              </span>
            </div>
          </li>
        ))}
      </ul>
      <p className="  pt-10 text-xs text-gray-400">
        © 2025 Caring AI Healthcare Solutions
      </p>
    </div>
  );
};

export default AuthBrandingFeatures;
